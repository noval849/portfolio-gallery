const mongoose = require('mongoose');

/**
 * Schema Portfolio
 * Setiap karya/portfolio berhubungan dengan user (userId)
 */
const portfolioSchema = new mongoose.Schema({
    userId: { // relasi ke user pembuat karya
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { // Judul karya
        type: String,
        required: true,
        trim: true
    },
    description: { // Deskripsi karya
        type: String,
        required: true
    },
    category: { // Kategori karya, misal: 'Desain', 'Fotografi', dsb
        type: String,
        required: true
    },
    tags: [{ // Array tag, misal: ['UI', 'Logo', 'Branding']
        type: String,
        trim: true
    }],
    imageUrl: { // Path/file gambar karya
        type: String,
        required: true
    },
    likes: { // Jumlah like
        type: Number,
        default: 0
    },
    comments: [ // Array komentar pada karya
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            name: String, // Nama user pemberi komentar
            comment: String, // Isi komentar
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: { // Tanggal upload karya
        type: Date,
        default: Date.now
    }
});

// Ekspor model
module.exports = mongoose.model('Portfolio', portfolioSchema);
