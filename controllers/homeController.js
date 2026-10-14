exports.index = async (req, res) => {
    try {
        res.redirect('/auth');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
