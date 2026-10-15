const bcrypt = require('bcryptjs');
const User = require('../models/usersModel'); 

// ============================
// REGISTER
// ============================
exports.register = async (req, res) => {
    try {
        const { nip, password } = req.body;

        const existing = await User.findByNip(nip);
        if (existing) {
            return res.status(400).json({ success: false, message: 'NIP sudah dipakai!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ nip, password: hashedPassword });

        return res.json({ success: true, message: 'Registrasi berhasil' });
    } catch (err) {
        console.error('Error register:', err);
        return res.status(500).json({ success: false, message: 'Gagal register: ' + err.message });
    }
};

// ============================
// LOGIN
// ============================
exports.login = async (req, res) => {
    try {
        const { nip, password } = req.body;

        const user = await User.findByNip(nip);
        if (!user) {
            return res.status(401).json({ success: false, message: 'NIP tidak ditemukan!' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Password salah!' });
        }

        // Simpan data user ke cookie-session (otomatis terenkripsi di browser)
        req.session.user = {
            id: user.id,
            nip: user.nip,
            role: user.role
        };

        // Tentukan tujuan redirect berdasarkan role
        let redirectUrl = '/index.html'; // Default ke dashboard utama
        if (user.role === 'admin') {
            redirectUrl = '/admin.html';
        } else if (user.role === 'developer') {
            redirectUrl = '/dev.html';
        }

        // Kirim respon sukses beserta URL tujuannya ke frontend
        return res.json({ success: true, redirectUrl });

    } catch (err) {
        console.error('Error login:', err);
        return res.status(500).json({ success: false, message: 'Gagal login: ' + err.message });
    }
};

// ============================
// LOGOUT
// ============================
exports.logout = (req, res) => {
    // Menghapus cookie-session dengan set ke null
    req.session = null;
    return res.redirect('/auth/login');
};
