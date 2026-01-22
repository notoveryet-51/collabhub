import express from "express";
import User from "../models/User.js";
import Hackathon from "../models/Hackathon.js";
import Event from "../models/Event.js";
import Post from "../models/Post.js"; 

const router = express.Router();

// 1. STATS
router.get('/stats/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    const stats = {
      streak: user.stats?.loginStreak || 0,
      hackathonsParticipated: user.participatingEvents?.length || 0,
      eventsParticipated: user.favorites?.length || 0, // Showing Likes as "Events" count for now
    };
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. HACKATHONS
router.get('/hackathons', async (req, res) => {
  try {
    const hackathons = await Hackathon.find().sort({ createdAt: -1 });
    res.json(hackathons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. EVENTS
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. REAL SUGGESTIONS (New!)
router.get('/suggestions/:uid', async (req, res) => {
  try {
    // 1. Find Current User to exclude friends
    const currentUser = await User.findOne({ uid: req.params.uid });
    const friendIds = currentUser ? currentUser.friends : [];

    // 2. Find Users who are NOT me AND NOT my friends
    const suggestions = await User.find({ 
        uid: { $ne: req.params.uid },
        _id: { $nin: friendIds } // Exclude existing friends
    })
    .limit(5) // Suggest 5 people
    .select('displayName location uid role'); 
    
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. SEARCH
router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const regex = new RegExp(q, 'i');
    const hackathons = await Hackathon.find({ title: regex });
    res.json({ hackathons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;