const express = require('express');
const router = express.Router();
const controller = require('../controllers/tupoksiController');

router.get('/', controller.getAllTupoksi);
router.post('/', controller.createTupoksi);
router.put('/:id', controller.updateTupoksi);
router.delete('/:id', controller.deleteTupoksi);

module.exports = router;