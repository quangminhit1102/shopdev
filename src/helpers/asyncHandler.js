"use strict";

/**
 * Express middleware wrapper for handling asynchronous route handlers and middleware.
 * This utility eliminates the need for try-catch blocks in async Express routes by
 * automatically catching and forwarding errors to Express's error handling chain.
 *
 * Key features:
 * - Automatically catches and forwards rejected promises to Express error handler
 * - Preserves the error stack trace for debugging
 * - Logs errors to console for development visibility
 * - Works with both async/await and Promise-based handlers
 *
 * @param {Function} fn - The async route handler or middleware function to wrap
 *                       Should accept standard Express (req, res, next) parameters
 *                       Can be async function or return a Promise
 * @returns {Function} Express middleware that handles promise rejections
 *
 * @example
 * // Basic usage with async route handler
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find({});
 *   res.json(users);
 * }));
 *
 * @example
 * // Usage with middleware that needs to pass control
 * router.use(asyncHandler(async (req, res, next) => {
 *   req.user = await User.findById(req.params.id);
 *   next(); // Continues to next middleware/route
 * }));
 *
 * @example
 * // Error handling demonstration
 * router.post('/data', asyncHandler(async (req, res) => {
 *   // No try-catch needed - asyncHandler will catch any errors
 *   await validateData(req.body);    // Throws ValidationError
 *   await saveToDatabase(req.body);  // Throws DatabaseError
 *   res.status(201).json({ success: true });
 * }));
 *
 * Notes:
 * 1. Errors are logged to console.error before being passed to Express
 * 2. Works with any error type (Error, ValidationError, etc.)
 * 3. Maintains Express's error handling chain (error middleware)
 * 4. Does not handle errors in synchronous code that doesn't return a Promise
 */
const asyncHandler = (fn) => {
  // Return Express middleware function
  return (req, res, next) => {
    // Execute handler, catch any errors, and forward to Express error chain
    fn(req, res, next).catch((error) => {
      // Log error for debugging (consider using proper logger in production)
      console.error("Error in asyncHandler:", error);
      // Forward error to Express error handling middleware
      next(error);
    });
  };
};

module.exports = { asyncHandler };
