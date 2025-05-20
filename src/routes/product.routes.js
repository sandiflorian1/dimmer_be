const express = require('express');
const router = express.Router();
const { getLevel3Products } = require('../controllers/product.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Protejăm toate rutele cu middleware-ul de autentificare
router.use(authenticateToken);

router.get('/level3/:id/products', getLevel3Products);

module.exports = router;
