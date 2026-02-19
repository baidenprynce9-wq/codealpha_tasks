require('dotenv').config();
const cors = require('cors');
const express = require('express');

require('./db');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
    socket.on('join_project', (projectId) => {
        socket.join(`project_${projectId}`);
    });
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.get('/', (req, res) => {
    res.send('API is running')
});

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})