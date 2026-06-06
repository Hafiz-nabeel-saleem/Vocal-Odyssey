const Level = require('../models/level');
const Progress = require('../models/progress');
const Attempt = require('../models/attempt');

const getLevels = async (req, res) => {
  try {
    const { childId } = req.query;
    const levels = await Level.find();

    if (!childId) {
      return res.status(200).json(levels);
    }

    const progressList = await Promise.all(
      levels.map(async (level) => {
        let progress = await Progress.findOne({ child_id: childId, level_id: level._id });
        if (!progress) {
          progress = await new Progress({ child_id: childId, level_id: level._id }).save();
        }
        return progress;
      })
    );

    const progressIds = progressList.map(p => p._id);
    const attempts = await Attempt.find({ progress_id: { $in: progressIds } });

    const attemptsByProgress = attempts.reduce((acc, attempt) => {
      const pid = attempt.progress_id.toString();
      (acc[pid] = acc[pid] || []).push(attempt);
      return acc;
    }, {});

    const levelsWithProgress = levels.map((level, i) => ({
      level,
      progress: progressList[i],
      attempts: attemptsByProgress[progressList[i]._id.toString()] || [],
    }));

    res.status(200).json({ levels: levelsWithProgress });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve levels. Please try again later.' });
  }
};

const getLevel = async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    if (!level) return res.status(404).json({ error: 'Level not found.' });
    res.status(200).json(level);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get level. Please try again later.' });
  }
};

const createLevel = async (req, res) => {
  try {
    const { name, description, content, level_type, ideal_score } = req.body;
    const newLevel = new Level({ name, description, content, level_type, ideal_score });
    const savedLevel = await newLevel.save();
    res.status(201).json(savedLevel);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create level. Please try again later.' });
  }
};

const updateLevel = async (req, res) => {
  try {
    const updatedLevel = await Level.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedLevel) return res.status(404).json({ error: 'Level not found.' });
    res.status(200).json(updatedLevel);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update level. Please try again later.' });
  }
};

const deleteLevel = async (req, res) => {
  try {
    const deleted = await Level.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Level not found.' });
    res.status(200).json({ message: 'Level deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete level. Please try again later.' });
  }
};

module.exports = {
  getLevels,
  getLevel,
  createLevel,
  updateLevel,
  deleteLevel,
};
