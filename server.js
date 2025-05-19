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

// Get all games (game)
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
        houseElementName,
        gamaId
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
        gamaId: parseInt(gameId)
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

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

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
        houseElementName,
        gamaId
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
        gamaId: parseInt(gameId)
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

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));