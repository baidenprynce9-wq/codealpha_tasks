const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');

// Connect to DB
mongoose.connect('mongodb://localhost:27017/social-media-platform')
    .then(() => console.log('MongoDB connected for seeding'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Post.deleteMany({});
        console.log('Cleared existing data...');

        // Create Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const user1 = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPassword,
            bio: 'Tech enthusiast and developer',
            profilePic: ''
        });

        const user2 = new User({
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: hashedPassword,
            bio: 'Digital nomad & designer',
            profilePic: ''
        });

        await user1.save();
        await user2.save();
        console.log('Users created...');

        // Create Posts
        const post1 = new Post({
            userId: user1._id,
            text: 'Hello world! This is the first post on our new platform.',
            likes: [user2._id],
            comments: [
                { userId: user2._id, text: 'Welcome John! Looks great.' }
            ]
        });

        const post2 = new Post({
            userId: user2._id,
            text: 'Just redesigned the UI! mesmerizing colors!',
            likes: [user1._id]
        });

        await post1.save();
        await post2.save();
        console.log('Posts created...');

        console.log('Database seeded successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
