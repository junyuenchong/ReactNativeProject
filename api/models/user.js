const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: function () {
        return this.method === "email"; // Only required if method is email
      },
    },
    phoneNumber: {
      type: String,
      required: function () {
        return this.method === "phone"; // Only required if method is phone
      },
    },
    password: {
      type: String,
      required: true,
    },
    verified: { type: Boolean, default: false },

    verificationToken: String,
    addresses: [
      {
        name: String,
        status: String,
        mobileNumber: String,
        houseNo: String,
        street: String,
        landmark: String,
        city: String,
        country: String,
        postalCode: String,
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    cart: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        title: {
          type: String,
          required: true,
        },
        image: {
          type: String,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
    searchhistory: [
      {
        historyname: String,
        searchedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    method: {
      type: String,
      required: true,
    },
  },
  {
    collection: "users",
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
