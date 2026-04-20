const express = require('express');
const { body, validationResult } = require('express-validator');
const Gallery = require('../models/Gallery');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const category = req.query.category;

    let query = { isVisible: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const images = await Gallery.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploadedBy', 'name');

    const total = await Gallery.countDocuments(query);

    res.json({
      images,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get gallery categories
// @route   GET /api/gallery/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Gallery.distinct('category', { isVisible: true });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Upload new image
// @route   POST /api/gallery
// @access  Private/Admin
router.post('/', [
  protect,
  adminOnly,
  upload.single('image'),
  handleMulterError,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('category').isIn(['Campus', 'Students', 'Events', 'Facilities', 'Sports', 'Academic', 'Other']).withMessage('Invalid category')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { title, description, category, tags, order } = req.body;

    const image = await Gallery.create({
      title,
      description,
      imageUrl: `/uploads/images/${req.file.filename}`,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      order: order || 0,
      uploadedBy: req.user._id
    });

    const populatedImage = await Gallery.findById(image._id).populate('uploadedBy', 'name');

    res.status(201).json(populatedImage);
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Update image
// @route   PUT /api/gallery/:id
// @access  Private/Admin
router.put('/:id', [
  protect,
  adminOnly,
  upload.single('image'),
  handleMulterError
], async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.imageUrl = `/uploads/images/${req.file.filename}`;
    }
    
    if (updateData.tags) {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }

    const updatedImage = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name');

    res.json(updatedImage);
  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Delete image
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    await Gallery.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Reorder images
// @route   PUT /api/gallery/reorder
// @access  Private/Admin
router.put('/reorder', protect, adminOnly, async (req, res) => {
  try {
    const { imageIds } = req.body;
    
    if (!Array.isArray(imageIds)) {
      return res.status(400).json({ error: 'imageIds must be an array' });
    }

    // Update order for each image
    const updatePromises = imageIds.map((id, index) => 
      Gallery.findByIdAndUpdate(id, { order: index })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Images reordered successfully' });
  } catch (error) {
    console.error('Reorder images error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;