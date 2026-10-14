exports.index = async (req, res) => {
    try {
        res.redirect('/auth/login');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

