const express = require('express');
const { getUsers, updateUser, deleteUser } = require('../controllers/admin');

const router = express.Router();

router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .delete(deleteUser);

module.exports = router;
