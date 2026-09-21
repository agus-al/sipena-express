exports.index = async (req, res) => {
    try {
        res.send('Halaman About dari Controller');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
