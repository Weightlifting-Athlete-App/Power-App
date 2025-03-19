// routes/UserRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create a new user
router.post('/UserData', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/UserData/:username', async (req, res) => {
  console.log(`Fetching user: ${req.params.username}`); // Debug log
  try {
    const user = await User.findOne({ username: req.params.username });
    console.log("User found:", user); // Log fetched user data

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/PerformanceData/:username', async (req, res) => {
  console.log(`Fetching user: ${req.params.username}`); // Debug log
  try {
    const user = await User.findOne({ username: req.params.username });
    console.log("User found:", user); // Log fetched user data

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
