const express = require('express');
const { getLevels, getLevel, createLevel, updateLevel, deleteLevel } = require('../controllers/level');

const router = express.Router();

router.route('/')
    .get(getLevels)
    .post(createLevel);

router.route('/:id')
    .get(getLevel)
    .put(updateLevel)
    .delete(deleteLevel);

module.exports = router;
