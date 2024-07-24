const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { storeReturnTo } = require('../middlewares/authMiddleware');

router.post('/register', userController.register); // to handle the register request
router.get('/login', storeReturnTo, userController.renderLogin); // to render the login form
router.post('/login', userController.handleLogin); // to handle the login request
router.post('/logout', userController.logout); // to handle the logout request
router.get('/reset-password', userController.resetPasswordLink); // to render the reset password form
router.post('/reset-password/:userId', userController.resetPassword); // to handle the reset password request
router.get('/reset-password/:userId', userController.renderResetPassword); // to render the reset password form

module.exports = router;