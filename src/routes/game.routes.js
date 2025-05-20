const express = require('express');
const router = express.Router();
const {
  // Game operations
  getAllGames,
  createGame,
  // House Elements operations
  getGameHouseElements,
  createHouseElement,
  // Products operations
  getLevel3Products,
  // Hierarchy
  getHierarchy
} = require('../controllers/game.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Protejăm toate rutele cu middleware-ul de autentificare
router.use(authenticateToken);

// Game routes
router.get('/', getAllGames);
router.post('/', createGame);

// House Elements routes
router.get('/:gameId/house-elements', getGameHouseElements);
router.post('/house-elements', createHouseElement);

// Products routes
router.get('/level3/:id/products', getLevel3Products);

// Hierarchy route
router.get('/hierarchy', getHierarchy);

module.exports = router;
