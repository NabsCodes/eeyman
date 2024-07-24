const express = require('express');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

// Import routers
const userRouter = require('./router/userRouter');
const homeRouter = require('./router/homeRouter');
const adminRouter = require('./router/adminRouter');

// MongoDB Connection Setup check if in production or development
const dbUri = process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : 'mongodb://localhost:27017/eeyman';
mongoose
	.connect(dbUri)
	.then(() => console.log('Connected to DB!'))
	.catch((error) => console.log(`Error Connecting to Mongo: ${error.message}`));

// Set up Mongoose connection event handlers
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('Database Connected!');
});

// Create an express app
const app = express();

// Set view engine to EJS and views directory
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use middleware for parsing request bodies and handling method override
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Use middleware for parsing JSON request bodies
app.use(express.json());

// Use middleware for parsing cookies
app.use(cookieParser());

// Use middleware for session and flash messages
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false },
	})
);
app.use(flash());

// Middleware to pass flash messages to all views
app.use((req, res, next) => {
	res.locals.messages = req.flash(); // Pass flash messages to all views
	res.locals.returnTo = req.session.returnTo; // Pass the returnTo URL to all views
	next();
});

app.use('/', homeRouter);
app.use('/admin', userRouter);
app.use('/admin', adminRouter);

// Catch All Route for 404 Errors
app.all('*', (_req, _res, next) => {
	next(new ExpressError('Page Not Found', 404)); // Pass error to error handling middleware
});

// Error Handling Middleware
app.use(errorHandler);

// Start the server on the specified port
const port = process.env.PORT;

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
