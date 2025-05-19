const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Get all users
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Add a new user
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    console.log("Data:", name, email);

    if (!name || !email) {
      return res.status(400).json({ error: "Name și email sunt obligatorii!" });
    }

    const newUser = await prisma.user.create({
      data: { name, email },
    });

    res.json(newUser);
  } catch (error) {
    console.error("❌ Eroare la salvare în BD:", error);
    res.status(500).json({ error: "Eroare la salvare în baza de date!" });
  }
});

// Get all games
app.get('/games', async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      include: {
        houseElements: true
      }
    });
    res.json(games);
  } catch (error) {
    console.error("❌ Eroare la citirea din BD:", error);
    res.status(500).json({ error: "Eroare la citirea din baza de date!" });
  }
});

// Add a new game
app.post("/games", async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Numele gamei este obligatoriu!" });
    }

    const newGame = await prisma.game.create({
      data: { name }
    });

    res.json(newGame);
  } catch (error) {
    console.error("❌ Eroare la salvare în BD:", error);
    res.status(500).json({ error: "Eroare la salvare în baza de date!" });
  }
});

// Get all house elements
app.get('/house-elements', async (req, res) => {
  try {
    const houseElements = await prisma.houseElement.findMany({
      include: {
        game: true
      }
    });
    res.json(houseElements);
  } catch (error) {
    console.error("❌ Eroare la citirea din BD:", error);
    res.status(500).json({ error: "Eroare la citirea din baza de date!" });
  }
});

// Add a new house element
app.post("/house-elements", async (req, res) => {
  try {
    const { houseElementName, gamaId } = req.body;
    
    if (!houseElementName || !gamaId) {
      return res.status(400).json({ error: "Numele elementului și ID-ul gamei sunt obligatorii!" });
    }

    const newHouseElement = await prisma.houseElement.create({
      data: {
        house_element_name: houseElementName,
        gama_id: parseInt(gamaId)
      },
      include: {
        game: true
      }
    });

    res.json(newHouseElement);
  } catch (error) {
    console.error("❌ Eroare la salvare în BD:", error);
    res.status(500).json({ error: "Eroare la salvare în baza de date!" });
  }
});

// Get house elements by game ID
app.get('/games/:gameId/house-elements', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const houseElements = await prisma.houseElement.findMany({
      where: {
        gama_id: parseInt(gameId)
      },
      include: {
        game: true
      }
    });
    
    res.json(houseElements);
  } catch (error) {
    console.error("❌ Eroare la citirea din BD:", error);
    res.status(500).json({ error: "Eroare la citirea din baza de date!" });
  }
});

// Get complete hierarchy
app.get('/api/hierarchy', async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      include: {
        houseElements: {
          include: {
            level1s: {
              include: {
                level2s: {
                  include: {
                    level3s: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const hierarchy = games.map(game => ({
      id: game.id,
      name: game.name,
      houseElements: game.houseElements.map(he => ({
        id: he.id,
        name: he.house_element_name,
        level1s: he.level1s.map(l1 => ({
          id: l1.id,
          name: l1.name,
          level2s: l1.level2s.map(l2 => ({
            id: l2.id,
            name: l2.name,
            level3s: l2.level3s.map(l3 => ({
              id: l3.id,
              name: l3.name
            }))
          }))
        }))
      }))
    }));

    res.json(hierarchy);
  } catch (error) {
    console.error('Error fetching hierarchy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));