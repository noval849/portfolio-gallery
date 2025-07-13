const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/auth');

router.get('/profile', ensureAuthenticated, (req, res) => {
  res.render('pages/profile', { user: req.user });
});

module.exports = router;
