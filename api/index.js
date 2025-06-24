require('dotenv').config();
console.log("🧪 Debug .env -> PAYPAL_CLIENT_ID:", process.env.PAYPAL_CLIENT_ID);
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
// Store reset codes in memory or DB (for demo, in-memory)
const resetCodes = new Map();

// Configure multer
const uploadDir = path.join(__dirname, "uploads");

// Check if the uploads directory exists, if not create it
const fs = require("fs");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Cloudinary setup
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up storage with multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // Optional folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"], // Acceptable formats
    transformation: [{ width: 500, height: 500, crop: "limit" }], // Optional resize
  },
});

const upload = multer({ storage: storage });



const app = express();
const port = 8000;
const cors = require("cors");
//Model
const User = require("./models/user");
const Order = require("./models/order");
const Product = require("./models/product");
const Category = require("./models/Category");
const UserInfo = require("./models/userinfo");
const { userInfo } = require("os");

//MangoDB URI
const uri = process.env.MONGODB_URI;

// Your AccountSID and Auth Token from console.twilio.com
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH;
const TWILIO_FROM = process.env.TWILIO_FROM;

//Send email account
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

//twilio client
const client = require("twilio")(TWILIO_SID, TWILIO_AUTH);

// PayPal client id and  paypal secret
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

// Setup Express
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());


//Connected to MongoDB
mongoose
  .connect(uri,
    {
      // Old Version mongoose
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB ");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDb", err);
  });

//Connect to port
app.listen(port, () => {
  console.log("Server is running on port");
});

/* --------------------------------------------------------------------- */
/* User Register, Reset Password, User Login                             */
/* --------------------------------------------------------------------- */

//Register User Account
app.post("/register", async (req, res) => {
  const { name, email, phone, password, method } = req.body; // Get method from request body

  // Validate that either email or phone is present depending on the method
  if (
    !name ||
    !password ||
    (method === "email" && !email) ||
    (method === "phone" && !phone)
  ) {
    return res.status(400).json({
      message: "All fields including verification code are required.",
    });
  }

  // Check if the email or phone already exists in the database
  const existing = await User.findOne({
    $or: [{ email }, { phoneNumber: phone }],
  });
  if (existing) {
    return res
      .status(400)
      .json({ message: "This email or phone is already registered." });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(20).toString("hex");

  // Prepare the new user object, depending on the method
  const newUser = new User({
    name,
    email: method === "email" ? email : undefined, // Set email if method is email
    phoneNumber: method === "phone" ? phone : undefined, // Set phone if method is phone
    password: hashedPassword,
    verificationToken,
    verified: false, // Default to unverified, it will be updated after verification
    method, // Store the verification method (email or phone)
  });

  try {
    // Save the new user to the database
    await newUser.save();
    res.status(201).json({ message: "Registration successful." });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Failed to register user." });
  }
});

//generateRandomCode
const generateRandomCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

// send-code to reset password
app.post("/send-code", async (req, res) => {
  const { email, phone, method } = req.body;
  const code = generateRandomCode();

  try {
    if (method === "email") {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: "Your Verification Code",
        text: `Your verification code is: ${code}`,
      };

      await transporter.sendMail(mailOptions);
      console.log("Verification code sent via email to", email);
      return res.status(200).json({ message: "Code sent via email", code });
    }

    if (method === "phone") {
      // Validate phone format
      if (!phone || !phone.startsWith("+60") || phone.length < 11) {
        return res
          .status(400)
          .json({ message: "Invalid Malaysian phone number" });
      }

      await client.messages.create({
        body: `Your verification code is: ${code}`,
        to: phone,
        from: TWILIO_FROM,
      });

      console.log("Verification code sent via SMS to", phone);
      return res.status(200).json({ message: "Code sent via SMS", code });
    }

    return res.status(400).json({ message: "Invalid method" });
  } catch (error) {
    console.error("Send-code error:", error);
    return res
      .status(500)
      .json({ message: "Failed to send verification code." });
  }
});

//endpoint to verify the email
app.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;

    //Find the user witht the given verification token
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({ message: "Invalid verification token" });
    }

    //Mark the user as verified
    user.verified = true;
    user.verificationToken = undefined;

    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Email Verificatioion Failed" });
  }
});

//generateSecretKey
const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");

  return secretKey;
};
//generating and setting a secret key (
const secretKey = generateSecretKey();

//endpoint to login the user!
app.post("/login", async (req, res) => {
  try {
    const { email, name, phone, password } = req.body; // ✅ fix here

    const user = await User.findOne({
      $or: [
        { email: email },
        { name: name },
        { phoneNumber: phone }, // ✅ now this will work
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid login credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, secretKey);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login Failed" });
  }
});

// POST /send-reset-code
app.post("/send-reset-code", async (req, res) => {
  const { email, phone, method } = req.body;
  const code = generateRandomCode();

  try {
    let user;
    if (method === "email") {
      if (!email) return res.status(400).json({ message: "Email required" });
      user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      });

      await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: "Password Reset Code",
        text: `Your password reset code is: ${code}`,
      });
    } else if (method === "phone") {
      if (!phone) return res.status(400).json({ message: "Phone required" });
      user = await User.findOne({ phoneNumber: phone });
      if (!user) return res.status(404).json({ message: "User not found" });

      await client.messages.create({
        body: `Your password reset code is: ${code}`,
        to: phone,
        from: TWILIO_FROM,
      });
    } else {
      return res.status(400).json({ message: "Invalid method" });
    }

    // Save code temporarily for verification (store with user ID as key)
    resetCodes.set(user._id.toString(), code);

    return res.status(200).json({ message: "Reset code sent" });
  } catch (error) {
    console.error("send-reset-code error:", error);
    return res.status(500).json({ message: "Failed to send reset code" });
  }
});

app.post("/reset-password", async (req, res) => {
  const { email, phone, method, code, newPassword } = req.body;

  if (!code || !newPassword) {
    return res.status(400).json({ message: "Code and new password required" });
  }

  try {
    let user;
    if (method === "email") {
      if (!email) return res.status(400).json({ message: "Email required" });
      user = await User.findOne({ email });
    } else if (method === "phone") {
      if (!phone) return res.status(400).json({ message: "Phone required" });
      user = await User.findOne({ phoneNumber: phone });
    } else {
      return res.status(400).json({ message: "Invalid method" });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    const savedCode = resetCodes.get(user._id.toString());
    if (savedCode !== code) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    resetCodes.delete(user._id.toString());

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("reset-password error:", error);
    return res.status(500).json({ message: "Failed to reset password" });
  }
});

/* --------------------------------------------------------------------- */
/* User Address                                                          */
/* --------------------------------------------------------------------- */

//creeate new address (user)
app.post("/addresses", async (req, res) => {
  try {
    const { userId, address } = req.body;

    //find the user by the Userid
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //add the new address to the user's addresses array
    user.addresses.push(address);

    //save the updated user in te backend
    await user.save();

    res.status(200).json({ message: "Address created Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error addding address" });
  }
});

//endpoint to get all the addresses of a particular user
app.get("/addresses/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addresses = user.addresses;
    res.status(200).json({ addresses });
  } catch (error) {
    res.status(500).json({ message: "Error retrieveing the addresses" });
  }
});

// Update a specific address by ID for a user
app.put("/updateaddresses/:userId/:addressId", async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const updatedAddress = req.body.address;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );
    if (index === -1)
      return res.status(404).json({ message: "Address not found" });

    user.addresses[index] = {
      ...user.addresses[index]._doc,
      ...updatedAddress,
    };

    await user.save();
    res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating address" });
  }
});

//Delete User Address
app.delete("/addresses/:userId/:addressId", async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove the address with the specified ID from the user's address list
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId // Keep addresses where the ID does not match the given addressId
    );

    await user.save();
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting address" });
  }
});

/* --------------------------------------------------------------------- */
/* User Default Address                                                  */
/* --------------------------------------------------------------------- */

// Get ONLY the default address for a user
app.get("/addresses/default/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the default address from the user's addresses
    const defaultAddress = user.addresses.find(
      (address) => address.status === "default"
    );

    if (!defaultAddress) {
      return res.status(404).json({ message: "No default address found" });
    }

    res.status(200).json({ address: defaultAddress });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving the default address" });
  }
});

// Update User default Address
app.put("/addresses/default/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { addressId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses.forEach((address) => {
      if (address._id.toString() === addressId) {
        address.status = "default";
      } else {
        address.status = "not a default";
      }
    });

    await user.save();
    res.status(200).json({ message: "Default address updated successfully" });
  } catch (error) {
    console.error("Error updating default address:", error);
    res.status(500).json({ message: "Error updating default address" });
  }
});

/* --------------------------------------------------------------------- */
/* User Order                                                            */
/* --------------------------------------------------------------------- */
//endpoint to store all the orders
app.post("/orders", async (req, res) => {
  try {
    const { userId, cartItems, totalPrice, shippingAddress, paymentMethod } =
      req.body;

    console.log("📦 /orders payload:", JSON.stringify(req.body, null, 2));

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const products = cartItems.map((item) => ({
      name: item.title,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    }));

    const order = new Order({
      userId: userId,
      products,
      totalPrice,
      shippingAddress,
      paymentMethod,
    });

    try {
      await order.save();
      return res.status(200).json({ message: "Order created successfully!" });
    } catch (saveErr) {
      console.error("❗ Order validation error:", saveErr);

      if (saveErr.name === "ValidationError") {
        const errors = Object.values(saveErr.errors).map((e) => e.message);
        return res.status(400).json({ message: "Validation failed", errors });
      }

      throw saveErr;
    }
  } catch (err) {
    console.error("🔥 Unexpected error in /orders:", err);
    return res.status(500).json({ message: "Error creating orders" });
  }
});

// Get all orders for a specific user
app.get("/orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format." });
    }

    // ✅ Use `userid` to match schema
    const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (err) {
    console.error("🔥 Error fetching user orders:", err);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* --------------------------------------------------------------------- */
/* User Home Page                                                        */
/* --------------------------------------------------------------------- */

//  get User Home products
app.get("/fetchproducts", async (req, res) => {
  const { query, category, userId, skip = 0, limit = 8 } = req.query;

  try {
    const filter = {};

    // 1. Search filter
    if (query) {
      if (userId) {
        User.updateOne(
          { _id: userId },
          {
            $addToSet: {
              searchhistory: { historyname: query, searchedAt: new Date() },
            },
          }
        ).catch(console.error);
      }

      const queryFilters = [{ name: { $regex: query, $options: "i" } }];
      const cat = await Category.findOne({ name: { $regex: query, $options: "i" } }, "_id");
      if (cat) queryFilters.push({ category: cat._id });
      filter.$or = queryFilters;
    }

    // 2. Category filter
    if (category) {
      const cat = mongoose.Types.ObjectId.isValid(category)
        ? await Category.findById(category, "_id")
        : await Category.findOne({ name: category }, "_id");

      if (cat) {
        filter.category = cat._id;
      } else {
        console.warn("⚠️ Category not found. Continuing without category filter.");
      }
    }

    // 3. Fetch with skip & limit (pagination)
    const products = await Product.find(filter)
      .populate("category")
      .skip(Number(skip))
      .limit(Number(limit));

    res.json({ data: products }); // ✅ consistent format
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error" });
  }
});


//fetchRecommendedProducinSearchMoodal
app.get("/fetch-recommeneded-products/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const history = user?.searchhistory ?? [];

    if (history.length === 0) return res.json([]);

    // Sort by most recent and take top 5
    const recent = history
      .sort((a, b) => new Date(b.searchedAt) - new Date(a.searchedAt))
      .slice(0, 5);

    // Build regex filters for product name
    const filters = recent.map(({ historyname }) => ({
      name: { $regex: historyname, $options: "i" },
    }));

    // Find matching products
    const products = await Product.find({ $or: filters });

    // Sort products by most recently searched keyword match
    const sorted = products.sort((a, b) => {
      const getDate = (name) =>
        recent.find((entry) =>
          new RegExp(entry.historyname, "i").test(name)
        )?.searchedAt || new Date(0);

      return new Date(getDate(b.name)) - new Date(getDate(a.name));
    });

    // Return top 10 results
    res.json(sorted.slice(0, 10));
  } catch (err) {
    console.error("Error fetching recommended products:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* --------------------------------------------------------------------- */
/* User Cart Function                                                    */
/* --------------------------------------------------------------------- */
//AddToCart and update quantity
app.post("/user/cart", async (req, res) => {
  const { userId, product, cart } = req.body;

  try {
    if (!userId) return res.status(400).json({ message: "User ID is required." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Option 1: Whole cart replacement
    if (cart && Array.isArray(cart)) {
      const isValidCart = cart.every((item) => item?.price);
      if (!isValidCart) {
        return res.status(400).json({ message: "Each cart item must have a price." });
      }

      user.cart = cart;
    }

    // Option 2: Single product update
    if (product) {
      if (!product.price) {
        return res.status(400).json({ message: "Product price is required." });
      }

      const existingIndex = user.cart.findIndex(
        (item) =>
          item.id.toString() === product.id.toString() &&
          (item.color || '').toLowerCase() === (product.color || '').toLowerCase() &&
          (item.size || '').toLowerCase() === (product.size || '').toLowerCase()
      );

      if (existingIndex !== -1) {
        // Update quantity and price
        user.cart[existingIndex].quantity = product.quantity;
        user.cart[existingIndex].price = product.price;
      } else {
        user.cart.push(product);
      }
    }

    await user.save();
    return res.status(200).json({ message: "Cart updated successfully", cart: user.cart });
  } catch (err) {
    console.error("❌ Error in /user/cart:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});
// Get Cart Product
app.post("/user/get-cart", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching cart" });
  }
});
//Remove cart product
app.post("/user/delete-cart-item", async (req, res) => {
  const { userId, productId, color, size } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Convert ids to string to avoid mismatch
    user.cart = user.cart.filter(
      (item) =>
        item.id.toString() !== productId.toString() ||
        item.color !== color ||
        item.size !== size
    );

    await user.save();
    return res.status(200).json({ message: "Item removed", cart: user.cart });
  } catch (err) {
    console.error("Error deleting item:", err);
    return res.status(500).json({ message: "Error removing item from cart" });
  }
});

/* --------------------------------------------------------------------- */
/* User Payment Gateway Integration                                                       */
/* --------------------------------------------------------------------- */
// 🚀 /paypal route for WebView
app.get("/paypal", (req, res) => {
  const amount = req.query.amount;
  const clientId = PAYPAL_CLIENT_ID;

  if (!clientId) {
    return res.status(500).send("PayPal Client ID not configured.");
  }

  // LIVE link <script src="https://www.paypal.com/sdk/js?client-id=LIVE_ID&currency=MYR"></script>
  // Sandbox link <script src="https://www.paypal.com/sdk/js?client-id=${clientId}&currency=MYR"></script>
  const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://www.paypal.com/sdk/js?client-id=${clientId}&currency=MYR"></script>

        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f9f9f9;
            font-family: sans-serif;
          }
          #paypal-button-container {
            width: 100%;
            max-width: 320px;
            display: none;
          }
          #loading {
            font-size: 16px;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div id="loading">Loading PayPal buttons...</div>
        <div id="paypal-button-container"></div>

        <script>
          paypal.Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
              height: 45
            },
            funding: {
              allowed: [paypal.FUNDING.PAYPAL, paypal.FUNDING.CARD] // ✅ allow cards
            },
            createOrder: function(data, actions) {
              return actions.order.create({
                purchase_units: [{
                  amount: { value: '${amount}' }
                }]
              });
            },
            onApprove: function(data, actions) {
              return actions.order.capture().then(function(details) {
                window.location.href = "https://success.payment";
              });
            },
            onCancel: function(data) {
              window.location.href = "https://cancel.payment";
            }
          }).render('#paypal-button-container').then(function() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('paypal-button-container').style.display = 'block';
          });
        </script>
      </body>
    </html>
  `;

  res.send(htmlContent);
});

/* --------------------------------------------------------------------- */
/* User Get and Update User Profile                                      */
/* --------------------------------------------------------------------- */
//get the user profile
app.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving the user profile" });
  }
});

// Update user profile
app.put("/updateprofile", async (req, res) => {
  try {
    const { userId, name, password } = req.body;

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user information
    if (name) {
      user.name = name;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Save the updated user profile
    await user.save();

    // Return updated user information
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

/* --------------------------------------------------------------------- */
/* Admin Login                                                           */
/* --------------------------------------------------------------------- */
//endpoint to login the admin!
app.post("/adminlogin", async (req, res) => {
  try {
    const { loginId, password } = req.body;

    console.log("Login attempt:", loginId);

    const user = await UserInfo.findOne({
      $or: [{ email: loginId }, { name: loginId }, { phone: loginId }],
    });
    console.log(user.password);
    if (!user) {
      return res.status(401).json({ message: "Invalid login credentials" });
    }

    // Plain text password comparison
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1h",
    });
    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login Failed" });
  }
});

/* --------------------------------------------------------------------- */
/* Admin User Management                                                 */
/* --------------------------------------------------------------------- */
// List all users
app.get("/admin/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
});

// Add a new user
app.post("/admin/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already registered:", email);
      return res.status(400).json({ message: "Email already registered" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    newUser.verificationToken = crypto.randomBytes(20).toString("hex");

    await newUser.save();

    console.log("New User Registered:", newUser);

    sendVerificationEmail(newUser.email, newUser.verificationToken);

    res.status(201).json({
      message:
        "Registration successful. Please check your email for verification.",
    });
  } catch (error) {
    console.log("Error during registration:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});
// Edit user
app.put("/admin/users/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, email, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
});

// Delete user
app.delete("/admin/users/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

/* --------------------------------------------------------------------- */
/* Admin Product Management                                             */
/* --------------------------------------------------------------------- */
// Create a product
app.post("/products", upload.array("image", 3), async (req, res) => {
  try {
    const { name, category, colour, price, description, offer, oldPrice } =
      req.body;

    // Check if there are multiple files uploaded
    const imageUrls = req.files.map((file) => file.path);  // Collect all image URLs

    const product = new Product({
      name,
      category,
      imageUrls, // Save the image URLs as an array
      colour,
      price,
      description,
      offer,
      oldPrice,
    });

    const savedProduct = await product.save();
    res.json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Update Product
app.put("/products/:id", upload.array("image", 3), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      colour,
      price,
      description,
      existingImages,
      offer,
      oldPrice,
    } = req.body;

    const updateData = {
      name,
      category,
      colour,
      price,
      description,
      offer,
      oldPrice,
    };

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let imageUrls = [];
    if (existingImages && existingImages.length > 0) {
      imageUrls = Array.isArray(existingImages)
        ? existingImages
        : JSON.parse(existingImages);
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path); // ✅ This is the full Cloudinary URL
      imageUrls = [...imageUrls, ...newImages];
    }

    updateData.imageUrls = imageUrls;

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a product
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product first to get image URLs
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete image files from disk
    if (product.imageUrls && product.imageUrls.length > 0) {
      product.imageUrls.forEach((imagePath) => {
        const fullPath = path.join(__dirname, imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlink(fullPath, (err) => {
            if (err) console.error(`Error deleting file ${fullPath}:`, err);
            else console.log(`Deleted file: ${fullPath}`);
          });
        }
      });
    }

    // Delete the product from DB
    await Product.findByIdAndDelete(id);

    res.json({ message: "Product and associated images deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to get one random products
app.get("/products/random", async (req, res) => {
  try {
    const count = await Product.countDocuments();
    const randomIndex = Math.floor(Math.random() * count);
    const randomProduct = await Product.findOne().skip(randomIndex);

    if (!randomProduct) {
      return res.status(404).json({ message: "No random product found" });
    }
    console.log(randomProduct); // Check if the random product is fetched correctly
    res.status(200).json(randomProduct);
  } catch (error) {
    console.error("Error fetching random product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//FetchProduct
app.get("/adminfetchproducts", async (req, res) => {
  const { query, category } = req.query;

  try {
    const filter = {};

    // Optional: search by name (case-insensitive)
    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }

    // Optional: filter by category (assumes it's the ObjectId)
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }

    const products = await Product.find(filter).populate("category");
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* --------------------------------------------------------------------- */
/* Admin Category Management                                             */
/* --------------------------------------------------------------------- */
// Create a category
app.post("/categories", async (req, res) => {
  try {
    const { name, path, icon } = req.body;
    const category = new Category({ name, path, icon });
    const savedCategory = await category.save();
    res.json(savedCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all categories
app.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update category
app.put("/categories/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    res.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete category
app.delete("/categories/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single product informatian by ID
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
