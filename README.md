# MyFirstEProject
My First React Native Project
# 🛒 E-Shop Mobile App & Admin Panel

![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/eshop-app)
![License](https://img.shields.io/github/license/yourusername/eshop-app)
![Issues](https://img.shields.io/github/issues/yourusername/eshop-app)

A complete mobile e-commerce solution built with **React Native** (user app) and **React + Node.js** (admin panel). Includes PayPal integration and full order management.

---

## 📲 User Mobile App

### Features

- 🛍️ Browse products with categories
- 📦 Add to cart / edit quantity&remove from cart
- 🔒 Login / Register with JWT auth
- 💳 PayPal payment gateway integration
- 📄 Order history & tracking

### Screenshots

#### 🏠 Home
![Home](https://raw.githubusercontent.com/yourusername/eshop-app/main/assets/images/home.png)

#### 🧺 Cart
![Cart](https://raw.githubusercontent.com/yourusername/eshop-app/main/assets/images/cart.png)

#### 💳 PayPal Payment
![Payment](https://raw.githubusercontent.com/yourusername/eshop-app/main/assets/images/payment.png)

---

## 🧑‍💼 Admin Panel

Built with **React + Redux + Chart.js**

### Features

- 📦 Product management and Category management (CRUD)
- 🔐 Admin authentication
- 🛍️ Browse products with categories
### Screenshots

#### 📊 Dashboard
![Dashboard](https://raw.githubusercontent.com/yourusername/eshop-admin/main/assets/images/dashboard.png)

#### 📦 Product Editor
![Admin Product](https://raw.githubusercontent.com/yourusername/eshop-admin/main/assets/images/product-edit.png)

---

## 💳 Payment Gateway

Integrated with **PayPal REST API** for secure checkout.

- Supports sandbox and live modes
- Payment handled via WebView (React Native)
- Backend order verification on success

![PayPal Flow](https://raw.githubusercontent.com/yourusername/eshop-app/main/assets/images/paypal-flow.png)

---

## 🧰 Tech Stack

| Layer      | Tech                              |
|------------|-----------------------------------|
| Frontend   | React Native, React, Redux        |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB (Mongoose)                |
| Auth       | JWT (JSON Web Tokens)             |
| Payment    | PayPal Gateway                    |
          

---

## 🚀 Installation

### Clone the repos:

```bash
# Run RESTful API
cd api
npm install
npx react-native run-android

