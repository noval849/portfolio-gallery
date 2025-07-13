const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Tampilkan halaman login (GET)
router.get('/login', authController.loginForm);

// Tampilkan halaman register (GET)
router.get('/register', authController.registerForm);

// Proses register (POST)
router.post('/register', authController.register);

// Proses login (POST)
router.post('/login', authController.login);

// Logout user (GET)
router.get('/logout', authController.logout);

module.exports = router;
