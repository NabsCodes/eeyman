const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { storeReturnTo } = require('../middlewares/authMiddleware');

router.get('/admin/register', userController.renderRegister); // to render the register page
router.post('/admin/register', userController.register); // to handle the register request
router.get('/admin/login', storeReturnTo, userController.renderLogin); // to render the login form
router.post('/admin/login', userController.handleLogin); // to handle the login request
router.post('/admin/logout', userController.logout); // to handle the logout request
router.get('/admin/reset-password', userController.resetPasswordLink); // to render the reset password form
router.post('/admin/reset-password/:userId', userController.resetPassword); // to handle the reset password request
router.get('/admin/reset-password/:userId', userController.renderResetPassword); // to render the reset password form

module.exports = router;