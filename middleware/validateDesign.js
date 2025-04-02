// middleware/validateDesign.js
const { body, validationResult } = require('express-validator');

/**
 * Validates and sanitizes design data in the request body for POST /api/save-design.
 * Ensures design, designId, and template are present, correctly formatted, and safe.
 * @returns {Array} Middleware array for Express route
 */
const validateDesign = [
  // Sanitize and validate design (PNG Data URL)
  body('design')
    .trim()
    .notEmpty()
    .withMessage('Valid design (PNG Data URL) is required')
    .isString()
    .matches(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/)
    .withMessage('Design must be a valid PNG Data URL'),

  // Sanitize and validate designId
  body('designId')
    .trim()
    .notEmpty()
    .withMessage('Valid designId is required')
    .isString()
    .isLength({ min: 1, max: 100 }) // Arbitrary max length to prevent abuse
    .withMessage('designId must be a string between 1 and 100 characters'),

  // Sanitize and validate template
  body('template')
    .trim()
    .notEmpty()
    .withMessage('Valid template is required')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('template must be a string between 1 and 100 characters'),

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg); // Use first error message
      error.statusCode = 400;
      return next(error); // Pass to errorHandler
    }
    next();
  },
];

module.exports = validateDesign;
