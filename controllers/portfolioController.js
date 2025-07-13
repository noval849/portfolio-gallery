const Portfolio = require('../models/Portfolio');
const fs = require('fs');
const path = require('path');

// Tampilkan halaman form tambah portfolio
exports.addForm = (req, res) => {
    res.render('pages/addPortfolio', { 
        formTitle: "Tambah Portfolio", 
        formAction: "/portfolio/add",
        buttonLabel: "Tambah",
        portfolio: {},
        error_msg: req.flash('error_msg'), 
        success_msg: req.flash('success_msg') 
    });
};

// Proses tambah portfolio
exports.addPortfolio = async (req, res) => {
    try {
        const { title, description, category, tags } = req.body;
        let imageUrl = '';
        if (req.file) {
            imageUrl = '/uploads/' + req.file.filename;
        }
        const newPortfolio = new Portfolio({
            userId: req.user._id,
            title,
            description,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            imageUrl
        });
        await newPortfolio.save();
        req.flash('success_msg', 'Portfolio berhasil ditambahkan!');
        res.redirect('/dashboard');
    } catch (err) {
        req.flash('error_msg', 'Gagal menambah portfolio. ' + err.message);
        res.redirect('/portfolio/add');
    }
};

// Tampilkan halaman edit portfolio
exports.editForm = async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id);
        if (!portfolio || portfolio.userId.toString() !== req.user._id.toString()) {
            req.flash('error_msg', 'Akses ditolak');
            return res.redirect('/dashboard');
        }
        res.render('pages/editPortfolio', { 
            formTitle: "Edit Portfolio", 
            formAction: "/portfolio/edit/" + portfolio._id + "?_method=PUT",
            buttonLabel: "Update",
            portfolio,
            error_msg: req.flash('error_msg'),
            success_msg: req.flash('success_msg')
        });
    } catch (err) {
        req.flash('error_msg', 'Portfolio tidak ditemukan');
        res.redirect('/dashboard');
    }
};

// Proses update portfolio
exports.updatePortfolio = async (req, res) => {
    try {
        let portfolio = await Portfolio.findById(req.params.id);
        if (!portfolio || portfolio.userId.toString() !== req.user._id.toString()) {
            req.flash('error_msg', 'Akses ditolak');
            return res.redirect('/dashboard');
        }
        const { title, description, category, tags } = req.body;
        portfolio.title = title;
        portfolio.description = description;
        portfolio.category = category;
        portfolio.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
        if (req.file) {
            // hapus file lama
            if (portfolio.imageUrl && fs.existsSync(path.join(__dirname, '../public', portfolio.imageUrl))) {
                fs.unlinkSync(path.join(__dirname, '../public', portfolio.imageUrl));
            }
            portfolio.imageUrl = '/uploads/' + req.file.filename;
        }
        await portfolio.save();
        req.flash('success_msg', 'Portfolio berhasil diperbarui!');
        res.redirect('/dashboard');
    } catch (err) {
        req.flash('error_msg', 'Gagal update portfolio. ' + err.message);
        res.redirect('/dashboard');
    }
};

// Hapus portfolio
exports.deletePortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
        if (!portfolio) {
            req.flash('error_msg', 'Portfolio tidak ditemukan/akses ditolak.');
            return res.redirect('/dashboard');
        }
        // Hapus file gambar dari server
        if (portfolio.imageUrl && fs.existsSync(path.join(__dirname, '../public', portfolio.imageUrl))) {
            fs.unlinkSync(path.join(__dirname, '../public', portfolio.imageUrl));
        }
        await Portfolio.deleteOne({ _id: portfolio._id });
        req.flash('success_msg', 'Portfolio berhasil dihapus');
        res.redirect('/dashboard');
    } catch (err) {
        req.flash('error_msg', 'Gagal menghapus portfolio: ' + err.message);
        res.redirect('/dashboard');
    }
};

// Gallery public (landing page)
exports.publicGallery = async (req, res) => {
    try {
        // Query dengan filter kategori/judul jika ada
        let filter = {};
        if (req.query.category) {
            filter.category = req.query.category;
        }
        if (req.query.q) {
            filter.title = { $regex: req.query.q, $options: 'i' };
        }
        const portfolios = await Portfolio.find(filter).populate('userId', 'name').sort({ createdAt: -1 });
        res.render('pages/index', { portfolios });
    } catch (err) {
        res.render('pages/index', { portfolios: [] });
    }
};

// Dashboard user (portfolio sendiri)
exports.userDashboard = async (req, res) => {
    try {
        const portfolios = await Portfolio.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.render('pages/dashboard', { portfolios, user: req.user });
    } catch (err) {
        res.render('pages/dashboard', { portfolios: [], user: req.user });
    }
};

// Detail portfolio public (optional, kalau kamu mau detail page)
exports.detailPortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id).populate('userId', 'name');
        if (!portfolio) {
            req.flash('error_msg', 'Portfolio tidak ditemukan');
            return res.redirect('/');
        }
        res.render('pages/portfolioDetail', { portfolio, user: req.user });
    } catch (err) {
        req.flash('error_msg', 'Error: ' + err.message);
        res.redirect('/');
    }
};

// Like portfolio (fitur sederhana)
exports.likePortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id);
        if (portfolio) {
            portfolio.likes += 1;
            await portfolio.save();
        }
        res.redirect('back');
    } catch (err) {
        res.redirect('back');
    }
};

// Komentar portfolio (fitur sederhana)
exports.commentPortfolio = async (req, res) => {
    try {
        const { comment } = req.body;
        if (!comment) return res.redirect('back');
        const portfolio = await Portfolio.findById(req.params.id);
        if (portfolio) {
            portfolio.comments.push({
                userId: req.user._id,
                name: req.user.name,
                comment,
                createdAt: new Date()
            });
            await portfolio.save();
        }
        res.redirect('back');
    } catch (err) {
        res.redirect('back');
    }
};
