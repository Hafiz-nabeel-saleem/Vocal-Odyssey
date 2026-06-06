const express = require('express');
const { getProgressByChild, getProgress, createProgress } = require('../controllers/progress');

const router = express.Router();

router.route('/')
    .get(getProgressByChild)
    .post(createProgress);

router.route('/:id')
    .get(getProgress)

module.exports = router;
