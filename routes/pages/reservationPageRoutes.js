const express = require('express');
const {
  list,
  show,
  newForm,
  create,
  editForm,
  update,
  deleteReservation,
} = require('../../controllers/pages/reservationPageController');

const router = express.Router();

/** GET /dashboard/reservations — liste des réservations. */
router.get('/', list);
/** GET /dashboard/reservations/new — formulaire de création. */
router.get('/new', newForm);
/** POST /dashboard/reservations — soumission du formulaire de création. */
router.post('/', create);
/** GET /dashboard/reservations/:id — détail d'une réservation. */
router.get('/:id', show);
/** GET /dashboard/reservations/:id/edit — formulaire d'édition. */
router.get('/:id/edit', editForm);
/** POST /dashboard/reservations/:id — soumission du formulaire d'édition. */
router.post('/:id', update);
/** POST /dashboard/reservations/:id/delete — suppression d'une réservation. */
router.post('/:id/delete', deleteReservation);

module.exports = router;
