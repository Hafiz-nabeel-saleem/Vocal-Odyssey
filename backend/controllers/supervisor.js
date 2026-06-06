const User = require('../models/user');

const getSupervisor = async (req, res) => {
  try {
    const supervisor = await User.findOne({ _id: req.params.id, role: 'supervisor' });
    if (!supervisor) return res.status(404).json({ error: 'Supervisor not found.' });
    res.status(200).json(supervisor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve supervisor. Please try again later.' });
  }
}; 

const updateSupervisor = async (req, res) => {
  try {
    const updatedSupervisor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'supervisor' },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedSupervisor) return res.status(404).json({ error: 'Supervisor not found.' });
    res.status(200).json(updatedSupervisor);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update supervisor. Please try again later.' });
  }
};

const deleteSupervisor = async (req, res) => {
  try {
    const deleted = await User.findOneAndDelete({ _id: req.params.id, role: 'supervisor' });
    if (!deleted) return res.status(404).json({ error: 'Supervisor not found.' });
    res.status(200).json({ message: 'Supervisor deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete supervisor. Please try again later.' });
  }
};

module.exports = { getSupervisor, updateSupervisor, deleteSupervisor };
