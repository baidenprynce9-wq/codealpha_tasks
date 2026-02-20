# Social Media Platform API

A robust Social Media Platform backend built with Node.js, Express, and MongoDB. This project features user authentication, post creation with image uploads, likes, and comments.

## ✨ Features
- **User Authentication**: Secure registration and login using JWT and Bcrypt.
- **Posts**: Create, Update, and Delete posts.
- **Media Support**: Image uploads integrated using Multer.
- **Social Interaction**: Like system and commenting functionality.
- **Robust Error Handling**: Graceful handling of database disconnections and invalid requests.
- **Frontend Interface**: A clean, responsive UI included in the `public` folder.

## 🚀 Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [MongoDB](https://www.mongodb.com/) installed and running (Local or Atlas).

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd social-media-platform
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Create a `.env` file in the root directory.
   - Add your connection strings (defaults are provided in the code but using a `.env` is recommended):
     ```env
     MONGO_URI=your_mongodb_connection_string
     PORT=5000
     JWT_SECRET=your_jwt_secret
     ```

### Running the App
1. **Seed the Database** (Recommended for reviewers to quickly see data):
   ```bash
   node seed.js
   ```
2. **Start the Server**:
   ```bash
   npm start
   ```
   The API will be available at `http://localhost:5000`.
   The Frontend can be accessed directly at `http://localhost:5000/`.

## 🧪 How to Test
1. **Open the browser** and navigate to `http://localhost:5000`.
2. **Register** a new account or use the seeded credentials (if `seed.js` was run).
3. **Login** to access your profile.
4. **Create a Post** with an optional image upload.
5. **Interact** by liking or commenting on other posts.

## 🛠 Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JSON Web Tokens (JWT)
- **File Uploads**: Multer
- **Frontend**: HTML5, Vanilla CSS, JavaScript

---
*Created for CodeAlpha Internship Project.*
