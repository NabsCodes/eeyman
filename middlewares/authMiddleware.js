const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to store the original URL the user was trying to access
const storeReturnTo = (req, res, next) => {
	// If there's a returnTo property in the session
	if (req.session.returnTo) {
		// Store it in res.locals so it can be accessed in the views
		res.locals.returnTo = req.session.returnTo;
	}
	next();
};

// Middleware to check if the user is logged in
const isLoggedIn = (req, res, next) => {
	// Store the original URL the user was trying to access
	req.session.returnTo = req.originalUrl;

	// Retrieve the JWT from the cookies
	const token = req.cookies.token;

	// If there's no token
	if (!token) {
		// Flash an error message
		req.flash('error', 'You need to be logged in to access this page');
		// Redirect to the login page
		return res.redirect('/admin/login');
	}

	// If there's a token, verify it
	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		// If the token is invalid or expired
		if (err) {
			// Clear the JWT cookie
			res.clearCookie('token');
			return res.redirect('/admin/login');
		}
		// If the token is valid, store the user info in req.user
		req.user = user;
		next();
	});
};

module.exports = {
	storeReturnTo,
	isLoggedIn
};