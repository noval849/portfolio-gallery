// config/db.js

const mongoose = require('mongoose');

// Membaca env variable (MONGODB_URI)
require('dotenv').config();

const connectDB = async () => {
    try {
        // Pastikan ada MONGODB_URI di .env
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI belum diatur di .env!');
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // autoIndex: true, // Optional: index otomatis
        });

        console.log('\x1b[32m%s\x1b[0m', 'MongoDB connected ✔');
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', 'MongoDB connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
