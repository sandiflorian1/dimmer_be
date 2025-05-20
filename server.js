const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const gameRoutes = require('./src/routes/game.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/api', gameRoutes); // Toate rutele legate de games, products și ierarhie sunt sub /api

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log('You can access it from other devices using your IP address');
});

// Get products for a specific level3
app.get('/api/level3/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const products = await prisma.product.findMany({
      where: {
        level_3_id: parseInt(id)
      },
      select: {
        id: true,
        name: true,
        category: true,
        depth: true,
        mp: true,
        price: true
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));