const mongoose = require('mongoose');

/**
 * Schema User
 * Untuk user aplikasi (kreator, admin, dsb)
 */
const userSchema = new mongoose.Schema({
    name: { // Nama lengkap user
        type: String,
        required: true,
        trim: true
    },
    email: { // Email unik
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Email tidak valid']
    },
    password: { // Password hash
        type: String,
        required: true
    },
    avatar: { // Foto profil user
        type: String,
        default: '/uploads/default-avatar.png'
    },
    role: { // Role user (bisa 'user', 'admin', dst)
        type: String,
        default: 'user'
    },
    createdAt: { // Tanggal pendaftaran
        type: Date,
        default: Date.now
    }
});

// Ekspor model User
module.exports = mongoose.model('User', userSchema);
