const express = require('express');
const router = express.Router();
const penilaianController = require('../controllers/penilaianController');

// CRUD penilaian (tidak perlu route /skp_periodik lagi)
router.get('/', penilaianController.getAll);
router.get('/skp_list', penilaianController.getListSkpPeriodik);
router.get('/:id', penilaianController.getById);
router.get('/skp/:skp_id', penilaianController.getBySkpId);
router.post('/', penilaianController.create);
router.put('/:id', penilaianController.update);
router.delete('/:id', penilaianController.delete);

module.exports = router;
