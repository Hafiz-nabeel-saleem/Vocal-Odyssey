const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  child_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true,
  },
  level_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
