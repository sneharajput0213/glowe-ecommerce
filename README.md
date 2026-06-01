# Glowé - Full Stack MERN E-Commerce Website

Glowé is a modern full-stack e-commerce web application built using the MERN Stack (MongoDB, Express.js, React.js, Node.js). The platform provides a complete online shopping experience with authentication, product management, order processing, and an admin dashboard.

## Features

### Customer Features

* User Registration & Login
* JWT Authentication & Authorization
* Browse Products
* Product Details Page
* Search Products
* Filter Products by Category
* Sort Products
* Add to Cart
* Wishlist Management
* Place Orders
* View Order History
* Responsive Design

### Admin Features

* Admin Dashboard
* Product Management

  * Add Products
  * Delete Products
  * View Products
* Order Management

  * View All Orders
  * Update Order Status
* User Management

  * View Users
  * Delete Users
  * Grant/Revoke Admin Access

## Tech Stack

### Frontend

* React.js
* React Router DOM
* Tailwind CSS
* Lucide React Icons

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcryptjs

### Database

* MongoDB Atlas

## Project Structure

E-Commerce-Web/

├── frontend/

│ ├── src/

│ ├── components/

│ ├── pages/

│ └── ...

│

├── backend/

│ ├── controllers/

│ ├── models/

│ ├── routes/

│ ├── middleware/

│ └── ...

│

└── README.md

## Installation

### Clone Repository

```bash
git clone https://github.com/sneharajput0213/e-commerce-web.git
cd e-commerce-web
```

### Backend Setup

```bash
cd backend
npm install
```

Create a .env file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Run backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication

* POST /api/auth/register
* POST /api/auth/login

### Products

* GET /api/products
* GET /api/products/:id
* POST /api/products
* DELETE /api/products/:id

### Orders

* POST /api/orders
* GET /api/orders/myorders
* GET /api/orders/allorders
* PUT /api/orders/:id/status

### Users

* GET /api/auth/users
* DELETE /api/auth/users/:id

## Security Features

* JWT Based Authentication
* Protected Routes
* Admin Middleware
* Password Hashing with bcrypt
* Role-Based Access Control

## Future Improvements

* Product Editing
* Payment Gateway Integration (Razorpay)
* Product Image Uploads
* Dashboard Analytics
* Coupon System
* Inventory Management

## Author

Sneha Rajput

B.Sc IT Student | MERN Stack Developer

GitHub: https://github.com/sneharajput0213

LinkedIn: https://www.linkedin.com/in/sneha-rajput2

---

If you found this project useful, feel free to star the repository.
