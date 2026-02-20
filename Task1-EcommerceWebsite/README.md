# Task 1: Ecommerce Website

A full-stack e-commerce application backend built with Node.js, Express, and MongoDB, featuring a responsive frontend.

## Features
- **User Authentication**: Secure signup and login using JWT and bcrypt.
- **Product Management**: API for browsing and managing products.
- **Order Processing**: Simple order placement and storage.
- **Frontend**: Responsive UI for product listing and user interaction.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, bcryptjs
- **Frontend**: HTML5, CSS3, Vanilla JavaScript

## Setup Instructions
1. Clone the repository.
2. Navigate to `Task1-EcommerceWebsite`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file with your `MONGO_URI` and `JWT_SECRET`.
5. Seed the database (optional):
   ```bash
   node seed.js
   ```
6. Start the server:
   ```bash
   npm start
   ```
