const express = require('express');
const {
  getAllUsers,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:email', getUserByEmail);
router.post('/', createUser);
router.put('/:email', updateUser);
router.delete('/:email', deleteUser);

module.exports = router;
