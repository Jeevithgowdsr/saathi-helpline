const express = require("express");
const router = express.Router();
const Helpline = require("../models/Helpline");

// GET all helplines
router.get("/", async (req, res) => {
  try {
    const helplines = await Helpline.find();
    res.json(helplines);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// POST a new helpline
router.post("/", async (req, res) => {
  try {
    const newHelpline = new Helpline(req.body);
    await newHelpline.save();
    res.status(201).json(newHelpline);
  } catch (err) {
    res.status(400).json({ error: "Invalid Data" });
  }
});

module.exports = router;
