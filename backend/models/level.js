const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  content: {
    type: [String],
    required: true,
  },
  level_type: {
    type: String,
    enum: ['phonics', 'words', 'sentences'],
    required: true,
  },
  ideal_score: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Level', levelSchema);
