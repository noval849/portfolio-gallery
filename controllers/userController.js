const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Tampilkan halaman profil user sendiri
exports.profile = async (req, res) => {
    try {
        const portfolios = await Portfolio.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.render('pages/profile', {
            user: req.user,
            portfolios,
            error_msg: req.flash('error_msg'),
            success_msg: req.flash('success_msg')
        });
    } catch (err) {
        req.flash('error_msg', 'Gagal mengambil data profil');
        res.redirect('/dashboard');
    }
};

// Tampilkan form edit profil
exports.editProfileForm = (req, res) => {
    res.render('pages/editProfile', {
        user: req.user,
        error_msg: req.flash('error_msg'),
        success_msg: req.flash('success_msg')
    });
};

// Proses update profil user (nama, avatar)
exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        let user = await User.findById(req.user._id);
        if (!user) {
            req.flash('error_msg', 'User tidak ditemukan');
            return res.redirect('/profile');
        }

        user.name = name;
        // Update avatar jika ada file upload
        if (req.file) {
            // Hapus avatar lama jika bukan default
            if (user.avatar && user.avatar !== '/uploads/default-avatar.png') {
                const oldPath = path.join(__dirname, '../public', user.avatar);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            user.avatar = '/uploads/' + req.file.filename;
        }
        await user.save();
        req.flash('success_msg', 'Profil berhasil diperbarui!');
        res.redirect('/profile');
    } catch (err) {
        req.flash('error_msg', 'Gagal update profil: ' + err.message);
        res.redirect('/profile/edit');
    }
};

// Tampilkan form ganti password
exports.changePasswordForm = (req, res) => {
    res.render('pages/changePassword', {
        user: req.user,
        error_msg: req.flash('error_msg'),
        success_msg: req.flash('success_msg')
    });
};

// Proses ganti password
exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    try {
        let user = await User.findById(req.user._id);
        if (!user) {
            req.flash('error_msg', 'User tidak ditemukan');
            return res.redirect('/profile/password');
        }
        // Cek old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Password lama salah');
            return res.redirect('/profile/password');
        }
        if (newPassword.length < 6) {
            req.flash('error_msg', 'Password baru minimal 6 karakter');
            return res.redirect('/profile/password');
        }
        if (newPassword !== confirmPassword) {
            req.flash('error_msg', 'Konfirmasi password tidak cocok');
            return res.redirect('/profile/password');
        }
        // Update password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        req.flash('success_msg', 'Password berhasil diubah!');
        res.redirect('/profile');
    } catch (err) {
        req.flash('error_msg', 'Gagal mengubah password: ' + err.message);
        res.redirect('/profile/password');
    }
};

// Melihat profil user lain (public)
exports.publicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            req.flash('error_msg', 'User tidak ditemukan');
            return res.redirect('/');
        }
        const portfolios = await Portfolio.find({ userId: user._id }).sort({ createdAt: -1 });
        res.render('pages/publicProfile', {
            publicUser: user,
            portfolios,
            user: req.user // User yang sedang login, untuk navigasi
        });
    } catch (err) {
        req.flash('error_msg', 'Gagal membuka profil user');
        res.redirect('/');
    }
};
