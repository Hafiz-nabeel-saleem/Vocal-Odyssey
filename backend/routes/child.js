const express = require('express');
const { getChildren, getChild, createChild, updateChild, deleteChild } = require('../controllers/child');

const router = express.Router();

router.route('/')
    .get(getChildren)
    .post(createChild);

router.route('/:id')
    .get(getChild)
    .put(updateChild)
    .delete(deleteChild);

module.exports = router;
