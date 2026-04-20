const express = require('express');
const { body, validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// @desc    Get all published blogs
// @route   GET /api/blogs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;

    let query = { isPublished: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content'); // Exclude content for list view

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: {
        blogs,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get latest blogs for homepage
// @route   GET /api/blogs/latest
// @access  Public
router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    
    const blogs = await Blog.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('title excerpt author publishedAt image category');

    res.json(blogs);
  } catch (error) {
    console.error('Get latest blogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog || !blog.isPublished) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Increment views
    await blog.incrementViews();

    res.json(blog);
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private/Admin
router.post('/', [
  protect,
  adminOnly,
  upload.single('image'),
  handleMulterError,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('excerpt').notEmpty().withMessage('Excerpt is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('author').notEmpty().withMessage('Author is required'),
    body('category').isIn(['Academic News', 'Events', 'Facilities', 'Sports', 'General']).withMessage('Invalid category')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, excerpt, content, author, category, tags, isPublished } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Featured image is required' });
    }

    const blog = await Blog.create({
      title,
      excerpt,
      content,
      author,
      category,
      image: `/uploads/images/${req.file.filename}`,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublished: isPublished === 'true',
      publishedAt: isPublished === 'true' ? new Date() : undefined,
      createdBy: req.user._id
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
router.put('/:id', [
  protect,
  adminOnly,
  upload.single('image'),
  handleMulterError
], async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.image = `/uploads/images/${req.file.filename}`;
    }
    
    if (updateData.tags) {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedBlog);
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;