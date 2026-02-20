const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
    {
        name: "Premium Wireless Headphones",
        description: "High-quality sound with noise cancellation and 40-hour battery life.",
        price: 299.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        category: "Electronics",
        stock: 15
    },
    {
        name: "Smart Watch Series 7",
        description: "Stay connected and track your health with the latest smart watch.",
        price: 399.99,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        category: "Electronics",
        stock: 20
    },
    {
        name: "Mechanical Gaming Keyboard",
        description: "RGB backlit keys with tactile switches for the best gaming experience.",
        price: 129.99,
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80",
        category: "Accessories",
        stock: 30
    },
    {
        name: "Ergonomic Office Chair",
        description: "Breathable mesh back and adjustable support for long working hours.",
        price: 2490.99,
        image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80",
        category: "Furniture",
        stock: 10
    },
    {
        name: "4K Ultra-Wide Monitor",
        description: "Experience stunning clarity and vibrant colors with this 34-inch curved display.",
        price: 4500.00,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
        category: "Electronics",
        stock: 8
    },
    {
        name: "Noise Cancelling Earbuds",
        description: "Compact, powerful, and ready for any environment. Perfect for travel.",
        price: 850.50,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
        category: "Electronics",
        stock: 25
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        await Product.deleteMany(); // Clear existing products
        console.log("Cleared existing products.");

        await Product.insertMany(products);
        console.log("Database Seeded successfully!");

        process.exit();
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDB();
