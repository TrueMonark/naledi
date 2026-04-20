const mongoose = require('mongoose');

const devotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Devotion title is required'],
    trim: true,
    maxlength: [150, 'Title cannot be more than 150 characters']
  },
  verse: {
    type: String,
    required: [true, 'Bible verse is required'],
    trim: true,
    maxlength: [500, 'Verse cannot be more than 500 characters']
  },
  reference: {
    type: String,
    required: [true, 'Bible reference is required'],
    trim: true,
    maxlength: [50, 'Reference cannot be more than 50 characters']
  },
  message: {
    type: String,
    required: [true, 'Devotion message is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    default: 'School Chaplain'
  },
  image: {
    type: String,
    required: [true, 'Devotion image is required']
  },
  isActive: {
    type: Boolean,
    default: false
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for finding active devotions
devotionSchema.index({ isActive: 1, scheduledDate: -1 });

// Only one devotion can be active at a time
devotionSchema.pre('save', async function(next) {
  if (this.isActive) {
    await mongoose.model('Devotion').updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

module.exports = mongoose.model('Devotion', devotionSchema);