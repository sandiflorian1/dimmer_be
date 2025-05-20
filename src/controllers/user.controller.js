const prisma = require('../config/db.config');

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('❌ Eroare la citirea utilizatorilor:', error);
    res.status(500).json({ error: 'Eroare la citirea din baza de date!' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilizatorul nu a fost găsit!' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Utilizatorul a fost șters cu succes!' });
  } catch (error) {
    console.error('❌ Eroare la ștergerea utilizatorului:', error);
    res.status(500).json({ error: 'Eroare la ștergerea din baza de date!' });
  }
};

module.exports = {
  getAllUsers,
  deleteUser
};
