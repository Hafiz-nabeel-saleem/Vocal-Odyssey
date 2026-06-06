const Child = require('../models/child');

const getChildren = async (req, res) => {
  try {
    const { supervisorId } = req.query;
    const query = supervisorId ? { supervisor_id: supervisorId } : {};
    const children = await Child.find(query);

    res.status(200).json(children);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve children. Please try again later.' });
  }
};

const getChild = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) return res.status(404).json({ error: 'Child not found.' });
    res.status(200).json(child);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve child. Please try again later.' });
  }
};

const createChild = async (req, res) => {
  try {
    const { name, gender, dob, image_path, supervisor_id } = req.body;
    const newChild = await Child.create({ name, gender, dob, image_path, supervisor_id });
    res.status(201).json(newChild);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create child. Please try again later.' });
  }
};

const updateChild = async (req, res) => {
  try {
    const updatedChild = await Child.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedChild) return res.status(404).json({ error: 'Child not found.' });
    res.status(200).json(updatedChild);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update child. Please try again later.' });
  }
};

const deleteChild = async (req, res) => {
  try {
    const deletedChild = await Child.findByIdAndDelete(req.params.id);
    if (!deletedChild) return res.status(404).json({ error: 'Child not found.' });
    res.status(200).json({ message: 'Child deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete child. Please try again later.' });
  }
};

module.exports = {
  getChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild
};
