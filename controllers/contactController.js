exports.index = async (req, res) => {
    try {
        res.send('Halaman Contact dari Controller');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
