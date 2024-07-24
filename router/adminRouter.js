const express = require('express');
const router = express.Router();
const { storeReturnTo, isLoggedIn } = require('../middlewares/authMiddleware');

router.get('/dashboard', storeReturnTo, isLoggedIn, (req, res) => {
	res.render('admin/admin-dashboard', { title: 'Admin Dashboard' });
});


module.exports = router;
