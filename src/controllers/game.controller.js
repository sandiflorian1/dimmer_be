const prisma = require('../config/db.config');

// Game Controllers
const getAllGames = async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      include: {
        houseElements: true
      }
    });
    res.json(games);
  } catch (error) {
    console.error('❌ Eroare la citirea din BD:', error);
    res.status(500).json({ error: 'Eroare la citirea din baza de date!' });
  }
};

const createGame = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Numele jocului este obligatoriu!' });
    }

    const newGame = await prisma.game.create({
      data: { name }
    });

    res.json(newGame);
  } catch (error) {
    console.error('❌ Eroare la salvare în BD:', error);
    res.status(500).json({ error: 'Eroare la salvare în baza de date!' });
  }
};

// House Elements Controllers
const getGameHouseElements = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await prisma.game.findUnique({
      where: { id: parseInt(gameId) },
      include: {
        houseElements: true
      }
    });

    if (!game) {
      return res.status(404).json({ error: 'Jocul nu a fost găsit!' });
    }

    res.json(game.houseElements);
  } catch (error) {
    console.error('❌ Eroare la citirea din BD:', error);
    res.status(500).json({ error: 'Eroare la citirea din baza de date!' });
  }
};

const createHouseElement = async (req, res) => {
  try {
    const { house_element_name, game_id } = req.body;

    if (!house_element_name || !game_id) {
      return res.status(400).json({ error: 'Numele elementului și ID-ul jocului sunt obligatorii!' });
    }

    const newHouseElement = await prisma.houseElement.create({
      data: {
        house_element_name,
        games: {
          connect: { id: parseInt(game_id) }
        }
      }
    });

    res.json(newHouseElement);
  } catch (error) {
    console.error('❌ Eroare la salvare în BD:', error);
    res.status(500).json({ error: 'Eroare la salvare în baza de date!' });
  }
};

// Products Controllers
const getLevel3Products = async (req, res) => {
  try {
    const { id } = req.params;
    const level3 = await prisma.level3.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: true
      }
    });

    if (!level3) {
      return res.status(404).json({ error: 'Level 3 nu a fost găsit!' });
    }

    res.json(level3.products);
  } catch (error) {
    console.error('❌ Eroare la citirea din BD:', error);
    res.status(500).json({ error: 'Eroare la citirea din baza de date!' });
  }
};

// Hierarchy Controller
const getHierarchy = async (req, res) => {
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
};

module.exports = {
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
};
