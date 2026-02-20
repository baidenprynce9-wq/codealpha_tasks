const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User'); // ensure User model exists
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Create Post with Image
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { userId, text } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        const newPost = new Post({
            userId,
            text,
            image
        });

        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        console.error('SERVER ERROR:', err.message);
        res.status(500).json({ msg: 'Server Error: Database or operation failed', error: err.message });
    }
});

// Get All Posts (Feed)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate('userId', 'name profilePic');
        res.json(posts);
    } catch (err) {
        console.error('SERVER ERROR:', err.message);
        res.status(500).json({ msg: 'Server Error: Database or operation failed', error: err.message });
    }
});

// Like a Post
router.put('/like/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const { userId } = req.body; // In real app, get from token

        if (post.likes.includes(userId)) {
            // Unlike
            const index = post.likes.indexOf(userId);
            post.likes.splice(index, 1);
        } else {
            // Like
            post.likes.push(userId);
        }

        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error('SERVER ERROR:', err.message);
        res.status(500).json({ msg: 'Server Error: Database or operation failed', error: err.message });
    }
});

// Comment on a Post
router.post('/comment/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const { userId, text } = req.body;

        const newComment = {
            userId,
            text
        };

        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error('SERVER ERROR:', err.message);
        res.status(500).json({ msg: 'Server Error: Database or operation failed', error: err.message });
    }
});

// Update a Post
router.put('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        // Check user
        if (post.userId.toString() !== req.body.userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        post.text = req.body.text; // Currently only updating text to keep it simple
        await post.save();
        res.json(post);
    } catch (err) {
        console.error('SERVER ERROR:', err.message);
        res.status(500).json({ msg: 'Server Error: Database or operation failed', error: err.message });
    }
});

// Delete a Post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Check user (In a real app, userId should come from middleware/token)
        // We will pass userId in the body for now since we aren't using strict middleware yet
        // However, delete usually doesn't send a body. We might need to send it in headers or just rely on client for this demo logic
        // For simplicity in this demo, we will check a header 'x-user-id' or just allow it if we assume the frontend is honest
        // STRICTER: Let's assume we pass userId in headers for delete

        const userId = req.headers['x-user-id'];

        if (post.userId.toString() !== userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await post.deleteOne();
        res.json({ msg: 'Post removed' });
    } catch (err) {
        console.error('SERVER ERROR:', err.message);
        res.status(500).json({ msg: 'Server Error: Database or operation failed', error: err.message });
    }
});

module.exports = router;
