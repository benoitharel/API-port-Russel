const express = require('express');
const {
  list,
  show,
  newForm,
  create,
  editForm,
  update,
  deleteUser,
} = require('../../controllers/pages/userPageController');

const router = express.Router();

router.get('/', list);
router.get('/new', newForm);
router.post('/', create);
router.get('/:email', show);
router.get('/:email/edit', editForm);
router.post('/:email', update);
router.post('/:email/delete', deleteUser);

module.exports = router;
