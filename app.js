require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const connectDB = require('./config/db');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');

// ======= Koneksi Database =======
connectDB()
  .then(() => console.log('Koneksi MongoDB berhasil!'))
  .catch(err => {
    console.error('Koneksi MongoDB gagal:', err);
    process.exit(1);
  });

// ======= Setup View Engine =======
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ======= Middleware =======
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// ======= Session & Passport =======
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key-superaman',
    resave: false,
    saveUninitialized: false
}));

// Passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// ======= Flash Message =======
app.use(flash());

// ======= Global Variables =======
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// ======= Routing =======
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/portfolio', require('./routes/portfolio'));
app.use('/', require('./routes/user'));

// Tambahkan route user/profile jika sudah dibuat:
// app.use('/user', require('./routes/user'));

// ======= Error Handling (404) =======
app.use((req, res) => {
    res.status(404).render('pages/404', {
        title: "404 Not Found",
        user: req.user || null
    });
});

// ======= Start Server =======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
