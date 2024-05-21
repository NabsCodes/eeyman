// Error Handling Middleware
const errorHandler = (err, _req, res, _next) => {
	const { statusCode = 500 } = err; // Default to 500 if no status code is provided
	if (!err.message) err.message = 'Oh No, Something Went Wrong!'; // Default error message

	// Log the error details to the console
	console.error(`Error: ${err.message}`);
	console.error(`Status Code: ${statusCode}`);
	// console.error(`Stack Trace: ${err.stack}`);

	// Determine the view name based on the status code
	let errorViewName;
	if (statusCode === 404) {
		errorViewName = 'error/404'; // 404 error view
	} else {
		errorViewName = 'error/500'; // 500 error view
	}

	res.status(statusCode).render(errorViewName, { err, title: statusCode === 404 ? 'Page Not Found' : 'Internal Server Error' });
};

module.exports = errorHandler;
