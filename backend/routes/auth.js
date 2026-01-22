import express from "express";
import User from "../models/User.js";

const router = express.Router();

// ROUTE: POST /api/auth/sync
// DESC: Called by Frontend immediately after Firebase Login
router.post("/sync", async (req, res) => {
  const { uid, email, displayName, photoURL } = req.body;

  try {
    // "Upsert": Update if exists, Create if new
    const user = await User.findOneAndUpdate(
      { uid: uid },
      {
        $set: {
          email: email,
          displayName: displayName || "Collab Student",
          photoURL: photoURL,
          "stats.lastLogin": new Date()
        },
        // Defaults for NEW users only
        $setOnInsert: {
          "location.country": "India",
          interests: [],
          friends: [],
          friendRequests: [], // Important for connections
          stats: { loginStreak: 1, totalCollaborations: 0 }
        }
      },
      { new: true, upsert: true }
    );

    console.log(`✅ User Synced: ${user.displayName}`);
    res.status(200).json(user);

  } catch (err) {
    console.error("❌ Sync Error:", err.message);
    res.status(500).json({ error: "Server Error during sync" });
  }
});

export default router;