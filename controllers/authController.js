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
            return res.send('NIP sudah dipakai!');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
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

        const user = await User.findByNip(nip);
        if (!user) {
            return res.status(401).json({ message: 'NIP tidak ditemukan!' });
        }

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

        // Simpan session dengan aman sebelum redirect di Vercel
        req.session.save((err) => {
            if (err) {
                console.error('Gagal menyimpan session:', err);
                return res.status(500).json({ message: 'Gagal memproses login session' });
            }

            // Redirect ke halaman dashboard yang sesuai (tanpa ekstensi .html jika dilayani static/route)
            if (user.role === 'admin') return res.redirect('/admin.html');
            if (user.role === 'developer') return res.redirect('/dev.html');
            res.redirect('/'); // Mengarahkan ke halaman utama/dashboard umum
        });

    } catch (err) {
        console.error('Error login:', err);
        res.status(500).json({ message: 'Gagal login: ' + err.message });
    }
};

// ============================
// LOGOUT
// ============================
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
};
