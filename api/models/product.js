const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrls: { type: [String], required: true },  // Ensure it's an array of strings
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: String, required: true },  // Changed to `Number` instead of `double`
  colour: { type: String, required: true },
  description: { type: String, required: true },
  offer:{ type: String, required: true },
  oldPrice:{ type: String, required: true },
});



module.exports = mongoose.model("Product", ProductSchema);
