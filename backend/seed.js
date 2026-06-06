const mongoose = require('mongoose');
const Level = require('./models/level');
require('dotenv').config();

const levels = [
  {
    name: 'Short Vowels',
    description: "let's practice our short vowel sounds!",
    content: ['A', 'E', 'I', 'O', 'U'],
    level_type: 'phonics',
    ideal_score: 85
  },
  {
    name: 'Common Words',
    description: 'Practice some everyday words!',
    content: ['Hello', 'Apple', 'Water', 'School', 'Family'],
    level_type: 'words',
    ideal_score: 80
  },
  {
    name: 'Simple Sentences',
    description: 'Try speaking full sentences!',
    content: ['How are you?', 'I love to play.', 'The sun is bright.'],
    level_type: 'sentences',
    ideal_score: 75
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for seeding...');
    await Level.deleteMany({});
    await Level.insertMany(levels);
    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
