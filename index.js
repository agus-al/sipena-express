// index.js
const express = require('express');
const session = require('express-session');
const app = express();
// const port = 3000;
const port = process.env.PORT || 3000;

// ============================================================
// 1. KONEKSI MYSQL (via Sequelize)
// ============================================================
const sequelize = require('./config/database');

// Test koneksi MySQL
sequelize.authenticate()
  .then(() => {
    console.log('✅ Koneksi MySQL berhasil');
  })
  .catch((err) => {
    console.error('❌ Gagal konek MySQL:', err.message);
  });

// ============================================================
// 2. SESSION (harus sebelum middleware & routes)
// ============================================================
app.use(session({
  secret: 'sipena_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 hari
}));

// ============================================================
// 3. MIDDLEWARE
// ============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ============================================================
// 4. ROUTE /session (untuk frontend)
// ============================================================
app.get('/session', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ success: true, data: req.session.user });
  } else {
    res.status(401).json({ success: false, message: 'Belum login' });
  }
});

// ============================================================
// 5. ROUTES LAIN
// ============================================================
const homeRoutes = require('./routes/homeRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const pegawaiRoutes = require('./routes/pegawaiRoutes');
const tupoksiRoutes = require('./routes/tupoksiRoutes');
const kinerjaRoutes = require('./routes/kinerjaRoutes');
const skp_periodikRoutes = require('./routes/skp_periodikRoutes');
const penilaianRoutes = require('./routes/penilaianRoutes');

app.use('/', homeRoutes);
app.use('/about', aboutRoutes);
app.use('/contact', contactRoutes);
app.use('/auth', authRoutes);
app.use('/pegawai', pegawaiRoutes);
app.use('/tupoksi', tupoksiRoutes);
app.use('/kinerja', kinerjaRoutes);
app.use('/skp_periodik', skp_periodikRoutes);
app.use('/penilaian', penilaianRoutes);

// ============================================================
// 6. START SERVER
// ============================================================
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
