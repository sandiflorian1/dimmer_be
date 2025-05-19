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

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

// test
// curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name": "Test", "email": "test@email.com"}'