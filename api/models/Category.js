// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  path: {
    type: String,
    required: true,
    unique: true
  },
  icon: {
    type: String, // You can store icon URL or icon name (depending on your setup)
    required: false
  }

});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
