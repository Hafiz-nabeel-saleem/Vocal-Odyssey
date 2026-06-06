const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'supervisor'],
    default: 'supervisor'
  },
  authProvider: { 
    type: String, 
    enum: ['local', 'google'], 
    default: 'local' 
  },
}, {
  timestamps: true
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
