const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key'; // în producție ar trebui să fie într-un .env

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token-ul de autentificare lipsește' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalid' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken, JWT_SECRET };
