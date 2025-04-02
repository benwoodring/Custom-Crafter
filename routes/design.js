// routes/design.js
const express = require('express');
const Design = require('../models/Design');
const validateDesign = require('../middleware/validateDesign');
const logger = require('../utils/logger');
const router = express.Router();

/**
 * Saves a new design to the database.
 * @route POST /api/save-design
 * @param {object} req.body - Request body
 * @param {string} req.body.design - PNG Data URL of the design
 * @param {string} req.body.designId - Unique identifier for the design
 * @param {string} req.body.template - Template used for the design
 * @returns {object} JSON response with designId
 * @throws {Error} If designId already exists or save fails
 */
router.post('/save-design', validateDesign, async (req, res) => {
  const { design, designId, template } = req.body;

  const existingDesign = await Design.findOne({ designId });
  if (existingDesign) {
    const error = new Error('Design ID already exists');
    error.statusCode = 400;
    throw error;
  }

  const newDesign = new Design({ designId, design, template });
  await newDesign.save();
  logger.info('Design saved successfully', {
    designId,
    timestamp: new Date().toISOString()
  });
  res.json({ designId });
});

/**
 * Retrieves a design by its ID.
 * @route GET /api/designs/:designId
 * @param {string} req.params.designId - Unique identifier of the design
 * @returns {object} JSON response with design data
 * @throws {Error} If design is not found
 */
router.get('/designs/:designId', async (req, res) => {
  const design = await Design.findOne({ designId: req.params.designId });
  if (!design) {
    const error = new Error('Design not found');
    error.statusCode = 404;
    throw error;
  }
  res.json(design);
});

module.exports = router;
