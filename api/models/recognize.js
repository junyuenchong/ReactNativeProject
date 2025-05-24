const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
      }
});

module.exports = mongoose.model("Recognize", ProductSchema);
