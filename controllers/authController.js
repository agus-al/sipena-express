// controllers/authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/usersModel'); // ⚠️ Pastikan nama file-nya 'usersModel', bukan 'userModel'

// ============================
// REGISTER
// ============================
exports.register = async (req, res) => {
  try {
    const { nip, password } = req.body;

    // Cek apakah NIP sudah terdaftar (pake await!)
    const existing = await User.findByNip(nip);
    if (existing) {
      return res.send('NIP sudah dipakai!');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke MySQL (pake await!)
    await User.create({ nip, password: hashedPassword });

    res.redirect('/auth/login');
  } catch (err) {
    console.error('Error register:', err);
    res.status(500).send('Gagal register: ' + err.message);
  }
};

// ============================
// LOGIN
// ============================
exports.login = async (req, res) => {
  try {
    const { nip, password } = req.body;

    // Cari user di MySQL (pake await!)
    const user = await User.findByNip(nip);
    if (!user) {
      return res.status(401).json({ message: 'NIP tidak ditemukan!' });
    }

    // Cek password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Password salah!' });
    }

    // Simpan session
    req.session.user = {
      id: user.id,
      nip: user.nip,
      role: user.role
    };

    // Redirect sesuai role
    if (user.role === 'admin') return res.redirect('/admin.html');
    if (user.role === 'developer') return res.redirect('/dev.html');
    res.redirect('/index.html');

  } catch (err) {
    console.error('Error login:', err);
    res.status(500).json({ message: 'Gagal login: ' + err.message });
  }
};

// ============================
// LOGOUT
// ============================
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
};
