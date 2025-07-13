const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ensureAuthenticated } = require('../middlewares/auth');
const portfolioController = require('../controllers/portfolioController');

// Konfigurasi Multer untuk upload gambar portfolio
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// ROUTES CRUD PORTFOLIO

// Form tambah portfolio
router.get('/add', ensureAuthenticated, portfolioController.addForm);

// Proses tambah portfolio (upload gambar)
router.post('/add', ensureAuthenticated, upload.single('image'), portfolioController.addPortfolio);

// Form edit portfolio
router.get('/edit/:id', ensureAuthenticated, portfolioController.editForm);

// Proses update portfolio (upload gambar jika ada)
router.put('/edit/:id', ensureAuthenticated, upload.single('image'), portfolioController.updatePortfolio);

// Proses hapus portfolio
router.delete('/delete/:id', ensureAuthenticated, portfolioController.deletePortfolio);

module.exports = router;
