const Progress = require('../models/progress');

const getProgressByChild = async (req, res) => {
  try {
    const { childId } = req.query;
    if (!childId) return res.status(400).json({ error: 'Query parameter childId is required.' });

    const progress = await Progress.find({ child_id: childId }).populate('level_id');
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve progress. Please try again later.' });
  }
};

const getProgress = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id).populate(['child_id', 'level_id']);
    if (!progress) return res.status(404).json({ error: 'Progress not found.' });
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get progress. Please try again later.' });
  }
};

const createProgress = async (req, res) => {
  try {
    const { child_id, level_id } = req.body;
    if (!child_id || !level_id) {
      return res.status(400).json({ error: 'Fields child_id and level_id are required.' });
    }

    const newProgress = new Progress({ child_id, level_id });
    const saved = await newProgress.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create progress. Please try again later.' });
  }
};

module.exports = {
  getProgressByChild,
  getProgress,
  createProgress,
};
