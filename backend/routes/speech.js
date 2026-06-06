const express = require('express');
const multer = require('multer');
const { createSpeech, evaluateSpeech } = require('../controllers/speech');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); 

router.route('/create')
  .post(createSpeech);

router.route('/evaluate')
  .post(upload.single('user_audio_file'), evaluateSpeech);

module.exports = router;
