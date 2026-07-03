const express = require('express');
const {
  list,
  show,
  newForm,
  create,
  editForm,
  update,
  deleteCatway,
} = require('../../controllers/pages/catwayPageController');

const router = express.Router();

/** GET /dashboard/catways — liste des catways. */
router.get('/', list);
/** GET /dashboard/catways/new — formulaire de création. */
router.get('/new', newForm);
/** POST /dashboard/catways — soumission du formulaire de création. */
router.post('/', create);
/** GET /dashboard/catways/:id — détail d'un catway. */
router.get('/:id', show);
/** GET /dashboard/catways/:id/edit — formulaire d'édition. */
router.get('/:id/edit', editForm);
/** POST /dashboard/catways/:id — soumission du formulaire d'édition. */
router.post('/:id', update);
/** POST /dashboard/catways/:id/delete — suppression d'un catway. */
router.post('/:id/delete', deleteCatway);

module.exports = router;
