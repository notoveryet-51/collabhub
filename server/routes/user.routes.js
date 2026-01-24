import express from "express";
import User from "../models/User.js";
import { verifyFirebaseUser } from "../request.js";

const router = express.Router();

/**
 * 🔐 Sync Firebase user → MongoDB
 */
router.post("/auth/sync", verifyFirebaseUser, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email,
        name,
        photo: picture,
        lastLogin: new Date(),
      });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "User sync failed" });
  }
});

/**
 * 🔍 Search users (public profiles only)
 */
router.get("/users/search", verifyFirebaseUser, async (req, res) => {
  try {
    const searchText = req.query.q;

    if (!searchText) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      visibility: "public",
      $or: [
        { name: { $regex: searchText, $options: "i" } },
        { username: { $regex: searchText, $options: "i" } },
        { interests: { $regex: searchText, $options: "i" } },
        { "location.college": { $regex: searchText, $options: "i" } }
      ],
    }).select("name username photo interests location");

    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
});

/**
 * 👤 View public user profile
 */
router.get("/users/:username", verifyFirebaseUser, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      username,
      visibility: "public",
    }).select(
      "name username photo interests badges location streak createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found or private" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

/**
 * 🤝 User suggestions based on interests, college, recent activity
 */
router.get("/users/suggestions", verifyFirebaseUser, async (req, res) => {
  try {
    const currentUserUid = req.user.uid;

    const currentUser = await User.findOne({ firebaseUid: currentUserUid });
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    // Suggest users
    const suggestions = await User.find({
      firebaseUid: { $ne: currentUserUid }, // exclude self
      visibility: "public",
      $or: [
        { interests: { $in: currentUser.interests } },
        { "location.college": currentUser.location?.college }
      ]
    })
      .sort({ lastLogin: -1 }) // most recently active first
      .limit(10)
      .select("name username photo interests location streak");

    res.json({ success: true, suggestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch suggestions" });
  }
});


export default router;
