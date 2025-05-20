const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Protejăm toate rutele de user cu middleware-ul de autentificare
router.use(authenticateToken);

router.get('/', getAllUsers);
router.delete('/:id', deleteUser);

module.exports = router;
