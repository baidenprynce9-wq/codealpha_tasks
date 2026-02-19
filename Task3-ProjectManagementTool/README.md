# TASK 3 - Project Management Tool

A full-stack project management application featuring real-time task updates, project boards, and user collaboration. This project was built as part of an internship.

## 🚀 Features

- **Real-time Collaboration**: Powered by Socket.io for instant updates across clients.
- **Project Tracking**: Kanban-style task management with status transitions.
- **Member Management**: Invite other users to your project via email.
- **Comment System**: Discuss tasks directly within the application.
- **Secure Authentication**: JWT-based login and registration.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Real-time**: Socket.io

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (v14+ recommended)
- npm (comes with Node.js)

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd pm
```

### 2. Database Setup
1. Create a new PostgreSQL database named `project_manager`.
2. Run the provided schema script to create the necessary tables:
   ```bash
   psql -U your_username -d project_manager -f db/schema.sql
   ```
   *(Alternatively, copy and paste the contents of `db/schema.sql` into your database query tool like pgAdmin.)*

### 3. Environment Configuration
Create a `.env` file in the root directory and add the following:
```env
PORT=5000
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/project_manager
JWT_SECRET=your_jwt_secret_key
```

### 4. Install Dependencies
Install dependencies for both the server and the client:
```bash
# Install root dependencies (concurrently, nodemon, etc.)
npm install

# Install client dependencies
cd client
npm install
cd ..
```

## 🚀 Running the Project

You can run both the server and the client simultaneously from the root directory:

```bash
npm run dev
```

- **Server**: Runs on [http://localhost:5000](http://localhost:5000)
- **Client**: Runs on [http://localhost:5173](http://localhost:5173)

## 📂 Project Structure

- `/client`: React frontend application.
- `/controllers`: Backend logic for handling API requests.
- `/routes`: API route definitions.
- `/db`: Database connection and schema files.
- `/middleware`: Custom Express middleware.
- `server.js`: Entry point for the backend server.

## 🧪 How to Test (Real-time Collaboration)

To get the full experience of the real-time features (Socket.io), follow these steps:

1. **Open Two Browser Windows**:
   - Open your browser (e.g., Chrome) and go to [http://localhost:5173](http://localhost:5173).
   - Open a **new Incognito window** or a different browser (e.g., Firefox) and go to the same URL.

2. **Register Two Different Users**:
   - In Window 1: Register as `User A`.
   - In Window 2: Register as `User B`.

3. **Test Real-time Updates**:
   - **Create a Project**: Using `User A`, create a new project.
   - **Invite/Member management**: Click the **"Invite Member"** button in Window 1 and enter User B's email.
   - **Task Board**: Open the project board in both windows.
   - **Real-time Interaction**: 
     - Create a task in Window 1; it should appear instantly in Window 2.
     - Move a task card between columns in Window 1; observe it moving in Window 2.
     - Add a comment to a task in Window 2; see it pop up in Window 1.
