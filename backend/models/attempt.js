const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
  },
  mistakes_counts: {
    type: Map,
    of: Number,
    required: true,
  },
  stars: {
    type: Number,
    required: true,
  },
  progress_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Progress',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Attempt', AttemptSchema);
