const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/auth');
const portfolioController = require('../controllers/portfolioController');

// Landing page
router.get('/', portfolioController.publicGallery);

// Dashboard user
router.get('/dashboard', ensureAuthenticated, portfolioController.userDashboard);

// About page
router.get('/about', (req, res) => {
    res.render('pages/about', { user: req.user });
});

module.exports = router;
