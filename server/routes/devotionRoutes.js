const express = require('express');
const { body, validationResult } = require('express-validator');
const Devotion = require('../models/Devotion');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// @desc    Get current active devotion
// @route   GET /api/devotions/current
// @access  Public
router.get('/current', async (req, res) => {
  try {
    const devotion = await Devotion.findOne({ isActive: true })
      .populate('createdBy', 'name');
    console.log('Found current devotion:', devotion);
    if (!devotion) {
      return res.status(404).json({ error: 'No active devotion found' });
    }

    res.json(devotion);
  } catch (error) {
    console.error('Get current devotion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get all devotions (admin)
// @route   GET /api/devotions
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const devotions = await Devotion.find()
      .sort({ scheduledDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name');

    const total = await Devotion.countDocuments();

    res.json({
      devotions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get devotions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get previous devotions for public view
// @route   GET /api/devotions/previous
// @access  Public
router.get('/previous', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // First, find the currently active devotion (if any)
    const current = await Devotion.findOne({ isActive: true }).select('_id');

    // Then, find devotions scheduled before now (excluding the active one)
    const devotions = await Devotion.find({
      scheduledDate: { $lt: new Date() },
      ...(current && { _id: { $ne: current._id } })  // exclude current if it exists
    })
        .sort({ scheduledDate: -1 })
        .limit(limit)
        .select('title verse reference scheduledDate image');

    res.json(devotions);
  } catch (error) {
    console.error('Get previous devotions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get single devotion
// @route   GET /api/devotions/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const devotion = await Devotion.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!devotion) {
      return res.status(404).json({ error: 'Devotion not found' });
    }

    res.json(devotion);
  } catch (error) {
    console.error('Get devotion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Create new devotion
// @route   POST /api/devotions
// @access  Private/Admin
router.post('/', [
  protect,
  adminOnly,
  upload.single('image'),
  handleMulterError,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('verse').notEmpty().withMessage('Bible verse is required'),
    body('reference').notEmpty().withMessage('Bible reference is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Devotion image is required' });
    }

    const { title, verse, reference, message, author, scheduledDate, isActive } = req.body;

    const devotion = await Devotion.create({
      title,
      verse,
      reference,
      message,
      author: author || 'School Chaplain',
      image: `/uploads/images/${req.file.filename}`,
      scheduledDate: new Date(scheduledDate),
      isActive: isActive === 'true',
      createdBy: req.user._id
    });

    const populatedDevotion = await Devotion.findById(devotion._id).populate('createdBy', 'name');

    res.status(201).json(populatedDevotion);
  } catch (error) {
    console.error('Create devotion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Update devotion
// @route   PUT /api/devotions/:id
// @access  Private/Admin
router.put('/:id', [
  protect,
  adminOnly,
  upload.single('image'),
  handleMulterError
], async (req, res) => {
  try {
    const devotion = await Devotion.findById(req.params.id);
    
    if (!devotion) {
      return res.status(404).json({ error: 'Devotion not found' });
    }

    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.image = `/uploads/images/${req.file.filename}`;
    }

    if (updateData.scheduledDate) {
      updateData.scheduledDate = new Date(updateData.scheduledDate);
    }

    const updatedDevotion = await Devotion.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    res.json(updatedDevotion);
  } catch (error) {
    console.error('Update devotion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Delete devotion
// @route   DELETE /api/devotions/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const devotion = await Devotion.findById(req.params.id);
    
    if (!devotion) {
      return res.status(404).json({ error: 'Devotion not found' });
    }

    await Devotion.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Devotion deleted successfully' });
  } catch (error) {
    console.error('Delete devotion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Set devotion as active
// @route   PUT /api/devotions/:id/activate
// @access  Private/Admin
router.put('/:id/activate', protect, adminOnly, async (req, res) => {
  try {
    const devotion = await Devotion.findById(req.params.id);
    
    if (!devotion) {
      return res.status(404).json({ error: 'Devotion not found' });
    }

    // Set this devotion as active (pre-save middleware will deactivate others)
    devotion.isActive = true;
    await devotion.save();

    const updatedDevotion = await Devotion.findById(devotion._id).populate('createdBy', 'name');

    res.json(updatedDevotion);
  } catch (error) {
    console.error('Activate devotion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;