const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guideSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    featuredImage: { type: String, required: true },
    images: [String],       // Optional: Additional images
    tags: [String],         // Optional: For extra categorization
    author: { type: String, default: 'Admin' } // You can change this as needed
  },
  { timestamps: true }
);

module.exports = mongoose.model('Guide', guideSchema);
