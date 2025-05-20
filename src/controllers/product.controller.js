const prisma = require('../config/db.config');

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

module.exports = {
  getLevel3Products
};
