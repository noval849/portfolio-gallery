const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Halaman login (GET)
router.get('/login', authController.loginForm);

// Halaman register (GET)
router.get('/register', authController.registerForm);

// Proses register (POST)
router.post('/register', authController.register);

// Proses login (POST)
router.post('/login', authController.login);

// Proses logout (GET)
router.get('/logout', authController.logout);

module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) return next();
    req.flash('error_msg', 'Silakan login terlebih dahulu');
    res.redirect('/auth/login');
  }
}

