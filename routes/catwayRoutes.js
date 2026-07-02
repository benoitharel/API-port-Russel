const express = require('express');
const {
  getAllCatways,
  getCatwayById,
  createCatway,
  updateCatwayState,
  deleteCatway,
} = require('../controllers/catwayController');

const router = express.Router();

router.get('/', getAllCatways);
router.get('/:id', getCatwayById);
router.post('/', createCatway);
router.put('/:id', updateCatwayState);
router.delete('/:id', deleteCatway);

module.exports = router;
