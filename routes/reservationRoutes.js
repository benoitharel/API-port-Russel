const express = require('express');
const {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
} = require('../controllers/reservationController');

const router = express.Router({ mergeParams: true });

router.get('/', getAllReservations);
router.get('/:idReservation', getReservationById);
router.post('/', createReservation);
router.put('/:idReservation', updateReservation);
router.delete('/:idReservation', deleteReservation);

module.exports = router;
