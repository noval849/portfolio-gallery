const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { body, validationResult } = require('express-validator');

// Tampilkan halaman login
exports.loginForm = (req, res) => {
    res.render('pages/login', { 
        title: 'Login', 
        error_msg: req.flash('error_msg'), 
        error: req.flash('error'), 
        success_msg: req.flash('success_msg') 
    });
};

// Tampilkan halaman register
exports.registerForm = (req, res) => {
    res.render('pages/register', { 
        title: 'Register', 
        error_msg: req.flash('error_msg'), 
        success_msg: req.flash('success_msg') 
    });
};

// Proses register
exports.register = [
    // 1. Validasi input
    body('name', 'Nama wajib diisi').notEmpty(),
    body('email', 'Email wajib diisi').notEmpty().isEmail().withMessage('Format email salah'),
    body('password', 'Password minimal 6 karakter').isLength({ min: 6 }),
    body('password2').custom((value, { req }) => {
        if (value !== req.body.password) throw new Error('Konfirmasi password tidak cocok');
        return true;
    }),

    // 2. Proses register
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Jika ada error validasi
            return res.render('pages/register', { 
                title: 'Register',
                error_msg: errors.array().map(err => err.msg).join(', '),
                success_msg: null
            });
        }

        const { name, email, password } = req.body;

        try {
            // Cek user sudah ada atau belum
            let user = await User.findOne({ email });
            if (user) {
                return res.render('pages/register', {
                    title: 'Register',
                    error_msg: 'Email sudah terdaftar',
                    success_msg: null
                });
            }

            // Hash password
            const hashed = await bcrypt.hash(password, 10);

            // Buat user baru
            user = new User({
                name,
                email,
                password: hashed,
                avatar: '/uploads/default-avatar.png' // ganti path jika ada upload avatar
            });
            await user.save();

            req.flash('success_msg', 'Registrasi berhasil! Silakan login.');
            res.redirect('/auth/login');
        } catch (err) {
            console.error(err);
            res.render('pages/register', {
                title: 'Register',
                error_msg: 'Error pada server: ' + err.message,
                success_msg: null
            });
        }
    }
];

// Proses login
exports.login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
};

// Logout user
exports.logout = (req, res) => {
    req.logout(function(err) {
        if (err) {
            req.flash('error_msg', 'Gagal logout');
            return res.redirect('/dashboard');
        }
        req.flash('success_msg', 'Logout berhasil');
        res.redirect('/auth/login');
    });
};
