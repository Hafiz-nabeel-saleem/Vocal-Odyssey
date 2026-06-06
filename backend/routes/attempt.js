const express = require('express');
const { getAttemptsByProgress, getAttempt, createAttempt } = require('../controllers/attempt');

const router = express.Router();

router.route('/by-progress/:progressId')
    .get(getAttemptsByProgress)
    .post(createAttempt);

router.route('/:id')
    .get(getAttempt);

module.exports = router;
