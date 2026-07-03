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

/** GET /dashboard/users — liste des utilisateurs. */
router.get('/', list);
/** GET /dashboard/users/new — formulaire de création. */
router.get('/new', newForm);
/** POST /dashboard/users — soumission du formulaire de création. */
router.post('/', create);
/** GET /dashboard/users/:email — détail d'un utilisateur. */
router.get('/:email', show);
/** GET /dashboard/users/:email/edit — formulaire d'édition. */
router.get('/:email/edit', editForm);
/** POST /dashboard/users/:email — soumission du formulaire d'édition. */
router.post('/:email', update);
/** POST /dashboard/users/:email/delete — suppression d'un utilisateur. */
router.post('/:email/delete', deleteUser);

module.exports = router;
