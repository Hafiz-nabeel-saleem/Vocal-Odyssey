const express = require('express');
const { login, signup, googleSignin, requestPasswordRecovery, recoverPassword } = require('../controllers/auth');

const router = express.Router();

router.route('/login').post(login);
router.route('/signup').post(signup);
router.route('/google-signin').post(googleSignin);
router.post('/request-password-recovery', requestPasswordRecovery);
router.post('/recover-password', recoverPassword);

module.exports = router;
