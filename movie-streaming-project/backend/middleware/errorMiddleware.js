const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Log errors to a file
    new winston.transports.File({ filename: 'error.log' }),
    // Log to console in development
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Custom error handler middleware
const errorMiddleware = (err, req, res, next) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    body: req.body,
    user: req.user ? req.user.id : 'Unauthenticated'
  });

  // Determine the status code
  const statusCode = err.statusCode || 500;

  // Prepare error response
  const errorResponse = {
    success: false,
    status: statusCode,
    message: statusCode === 500 
      ? 'Something went wrong on our end' 
      : err.message
  };

  // Add additional error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.originalError = err;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handling specific error types
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  return new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
};

const handleDuplicateKeyError = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  return new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
};

const handleCastError = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

// Error transformation middleware
const transformError = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    error = handleValidationError(error);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    error = handleDuplicateKeyError(error);
  }

  // Mongoose Cast Error
  if (err.name === 'CastError') {
    error = handleCastError(error);
  }

  next(error);
};

module.exports = {
  errorMiddleware,
  AppError,
  transformError
};