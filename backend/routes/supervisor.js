const express = require('express');
const { getSupervisor, updateSupervisor, deleteSupervisor } = require('../controllers/supervisor');

const router = express.Router();

router.route('/:id')
    .get(getSupervisor)
    .put(updateSupervisor)
    .delete(deleteSupervisor);

module.exports = router;
