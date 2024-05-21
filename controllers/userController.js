const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const resetMail = require('../services/resetPasswordEmail');
const User = require('../models/user');

// Function to handle user registration
const register = async (req, res) => {
	try {
		// Extract user details from request body
		const { username, email, password } = req.body;

		// Check if user already exists
		const user = await User.findOne({ username });
		if (user) {
			return res.status(400).send('User Already Exists');
		}

		// Hash the password using bcrypt
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create a new user
		const newUser = new User({
			username,
			email,
			password: hashedPassword
		});

		// Save the new user to the database
		await newUser.save();

		// Send success response
		res.status(201).send('User Registered');
	} catch (error) {
		// Log any errors and send error response
		console.log(error.message);
		res.status(500).send('Error Registering User');
	}
};

// Function to render the register page
const renderRegister = (req, res) => {
	try {
		// // If user is already logged in, redirect to home
		// if (req.cookies.token) {
		// 	return res.status(200).redirect('/');
		// }

		// Render the login page
		res.render('admin/auth/register', { title: 'Register' });
	} catch (error) {
		// Log any errors and send error response
		console.log(error.message);
		res.status(500).send('Error Rendering Register Page');
	}
};

// Function to render the login page
const renderLogin = (req, res) => {
	try {
		// // If user is already logged in, redirect to home
		// if (req.cookies.token) {
		// 	return res.status(200).redirect('/');
		// }

		// Render the login page
		res.render('admin/auth/login', { title: 'Admin Login' });
	} catch (error) {
		// Log any errors and send error response
		console.log(error.message);
		res.status(500).send('Error Rendering Login Page');
	}
};

// Function to handle user login
const handleLogin = async (req, res) => {
	try {
		// Extract username and password from request body
		const { username, password, rememberMe } = req.body;

		// Check if username and password are provided
		if (!username || !password) {
			req.flash('error', 'Please provide a username and password');
			return res.status(400).redirect('/admin/login');
		}

		// Find the user in the database
		const user = await User.findOne({ username });
		if (!user) {
			req.flash('error', 'Invalid username or password');
			return res.status(400).redirect('/admin/login');
		}

		// Check if the password is correct
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			req.flash('error', 'Invalid username or password');
			return res.status(400).redirect('/admin/login');
		}

		// If authentication is successful, sign the JWT
		const expiresIn = rememberMe ? '7d' : '1d'; // 7 days if "Remember Me" is checked, otherwise 1 day
		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn });

		// Set rememberMe cookie option if "Remember Me" is checked (7 days), otherwise, the cookie expires when the browser is closed
		const cookieOptions = { httpOnly: true };
		if (rememberMe) {
			cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
		}
		res.cookie('token', token, cookieOptions);

		// Send success response
		req.flash('success', 'Logged in successfully!');

		// Redirect to the original URL the user was trying to access, or to home if no original URL stored
		const redirectUrl = req.session.returnTo || '/';
		delete req.session.returnTo; // Clear the returnTo from the session
		res.status(200).redirect(redirectUrl);
	} catch (error) {
		console.log(error.message);
		req.flash('error', 'There was an error logging in. Please try again later.');
		res.status(500).redirect('/admin/login');
	}
};

// Function to handle user logout
const logout = (req, res) => {
	try {
		// Clear the JWT cookie
		res.clearCookie('token');

		// Send success response
		req.flash('success', 'Logged out successfully!');
		// Redirect to login
		res.status(200).redirect('/admin/login');
	} catch (error) {
		// Log any errors and send error response
		console.log(error.message);
		// Send error response
		req.flash('error', 'There was an error logging out. Please try again later.');
		res.status(500).send('Error Logging Out');
	}
};

// Function to generate a password reset link and send it to the user's email
const resetPasswordLink = async (req, res) => {
	try {
		// Get the username from the request body
		const { username } = req.body;

		// Find the user with the given username
		const user = await User.findOne({ username });

		// If the user is not found, respond with a 404 status code and a message
		if (!user) {
			return res.status(404).send('User not found');
		}

		// Sign a JWT token with the user's ID
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30m' });

		// Check if the token was successfully created
		if (!token) {
			return res.status(500).send('Error generating password reset link');
		}

		// Create the password reset link with the token
		// const resetLink = process.env.NODE_ENV === 'production' ? `https://sms-scheduler.live/reset-password/${token}` : `http://localhost:3001/reset-password/${token}`;
		const resetLink = `http://localhost:3000/admin/reset-password/${token}`;

		// Get the user's email
		const email = user.email;

		// Send the password reset link to the user's email
		resetMail(email, 'Password Reset', resetLink);
		// Respond with a success message
		res.status(200).send('Password reset link has been sent to your email.');
	} catch (error) {
		// 
		console.log(error);
		res.status(500).send('Error generating password reset link');
	}
};

// Function to reset the user's password
const resetPassword = async (req, res) => {
	const token = req.params.userId; // Get the token from the request parameters

	// Check if the token is valid
	if (!token) {
		req.flash('error', 'Invalid reset link');
		return res.redirect('/admin/login');
	}
	try {
		const { newPassword, confirmPassword } = req.body; // Get the new password and confirm password from the request body

		// Check if fields are empty
		if (!newPassword || !confirmPassword) {
			req.flash('error', 'Please fill in all fields');
			return res.redirect(`/admin/reset-password/${token}`);
		}

		// Check if the new password and confirm password match
		if (newPassword !== confirmPassword) {
			req.flash('error', 'Passwords do not match!');
			return res.redirect(`/admin/reset-password/${token}`);
		}

		// Verify the token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Find user by ID
		const user = await User.findById(decoded.id);
		console.log('user:', user);
		// Check if user exists
		if (!user) {
			req.flash('error', 'User not found!');
			return res.redirect(`/admin/reset-password/${token}`);
		}

		// Hash the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update user's password
		user.password = hashedPassword;

		// Save updated user
		await user.save();

		// Set success flash message
		req.flash('success', 'Your password has been reset successfully!');
		return res.redirect('/admin/login');
	} catch (error) {
		console.log(error);
		// If the token has expired or is invalid, jwt.verify() will throw an error
		req.flash('error', 'Error resetting password. The reset link may have expired.');
		return res.redirect(`/admin/reset-password/${token}`);
	}
};

// Function to render ResetPassword Page
const renderResetPassword = (req, res) => {
	const { userId } = req.params;
	res.render('admin/auth/resetPassword', { userId, title: 'Reset Password' });
};

module.exports = {
	register,
	renderRegister,
	renderLogin,
	handleLogin,
	logout,
	resetPasswordLink,
	resetPassword,
	renderResetPassword
};