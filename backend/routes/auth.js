import express from "express";
import User from "../models/User.js";

const router = express.Router();

// POST /api/auth/sync
// Triggered by Frontend after Firebase Login success
router.post("/sync", async (req, res) => {
  const { uid, email, displayName, photoURL } = req.body;

  try {
    // findOneAndUpdate with 'upsert: true' is the secret key here.
    // It means: "Find this user. If missing, CREATE them. If found, UPDATE them."
    const user = await User.findOneAndUpdate(
      { uid: uid }, // Search by Firebase UID
      {
        $set: {
          email: email,
          displayName: displayName || "Collab Student",
          photoURL: photoURL,
          "stats.lastLogin": new Date() // Always update login time
        },
        // Only set these defaults if we are creating a BRAND NEW user
        $setOnInsert: {
          "location.country": "India",
          interests: [],
          friends: [],
          stats: { loginStreak: 1, totalCollaborations: 0 }
        }
      },
      { new: true, upsert: true } // Return the new doc & Create if missing
    );

    console.log(`✅ User Synced: ${user.displayName}`);
    res.status(200).json(user);

  } catch (err) {
    console.error("❌ Sync Error:", err.message);
    res.status(500).json({ error: "Server Error during sync" });
  }
});

export default router;