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

router.get('/', list);
router.get('/new', newForm);
router.post('/', create);
router.get('/:id', show);
router.get('/:id/edit', editForm);
router.post('/:id', update);
router.post('/:id/delete', deleteReservation);

module.exports = router;
