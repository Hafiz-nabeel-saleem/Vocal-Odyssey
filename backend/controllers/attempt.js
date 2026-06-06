const Attempt = require('../models/attempt');

const getAttemptsByProgress = async (req, res) => {
  try {
    const attempts = await Attempt.find({ progress_id: req.params.progressId });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attempts. Please try again later.' });
  }
};

const getAttempt = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attempt. Please try again later.' });
  }
};

const createAttempt = async (req, res) => {
  try {
    const { score, mistakes_counts, stars } = req.body;
    const attempt = new Attempt({
      score,
      mistakes_counts,
      stars,
      progress_id: req.params.progressId,
    });

    const saved = await attempt.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: 'Invalid attempt data.' });
  }
};

module.exports = { getAttemptsByProgress, getAttempt, createAttempt };
