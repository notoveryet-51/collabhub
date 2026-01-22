import express from "express";
import User from "../models/User.js";

const router = express.Router();

// 1. GET USER (Fetch profile & pending requests)
router.get("/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. UPDATE PROFILE
router.put("/update", async (req, res) => {
  try {
    const { uid, location, interests, displayName, photoURL } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { uid: uid },
      { $set: { location, interests, displayName, photoURL } },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. SEND REQUEST (User A -> User B)
router.post("/friend-request", async (req, res) => {
  try {
    const { senderUid, receiverUid, note } = req.body;

    const sender = await User.findOne({ uid: senderUid });
    const receiver = await User.findOne({ uid: receiverUid });

    if (!sender || !receiver) return res.status(404).json({ message: "User not found" });

    // Prevent duplicate requests
    const alreadyRequested = receiver.friendRequests.some(
        req => req.senderId.toString() === sender._id.toString()
    );
    // Prevent sending if already friends
    const alreadyFriends = receiver.friends.includes(sender._id);

    if (alreadyRequested || alreadyFriends) {
        return res.status(400).json({ message: "Request already sent or already friends." });
    }

    // Add request to Receiver's "Inbox"
    receiver.friendRequests.push({
      senderId: sender._id,
      senderName: sender.displayName,
      note: note,
      status: "pending"
    });

    await receiver.save();
    console.log(`📩 Request sent from ${sender.displayName} to ${receiver.displayName}`);
    res.json({ message: "Request sent successfully!" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. ACCEPT REQUEST (User B accepts User A)
router.put("/friend-request/respond", async (req, res) => {
  try {
    const { userUid, senderId, action } = req.body; // senderId is the Mongo _id from the request list
    
    const user = await User.findOne({ uid: userUid }); // Me (The Receiver)
    const sender = await User.findById(senderId); // Them (The Sender)

    if (action === "accept") {
      // Link them as friends
      user.friends.push(sender._id);
      sender.friends.push(user._id);
      await sender.save();
      console.log(`🤝 ${user.displayName} is now friends with ${sender.displayName}`);
    }

    // Remove the request from the list (whether accepted or rejected)
    user.friendRequests = user.friendRequests.filter(
        req => req.senderId.toString() !== senderId
    );
    
    await user.save();
    
    // Return updated friend list and requests
    res.json({ 
        message: `Request ${action}ed`, 
        friends: user.friends,
        friendRequests: user.friendRequests 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. FAVORITE (Heart)
router.put("/favorite", async (req, res) => {
  const { uid, itemId } = req.body; 
  try {
    const user = await User.findOne({ uid });
    if (!user.favorites) user.favorites = [];
    
    const index = user.favorites.indexOf(itemId);
    if (index === -1) user.favorites.push(itemId);
    else user.favorites.splice(index, 1);

    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;