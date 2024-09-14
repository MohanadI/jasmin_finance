const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const db = new sqlite3.Database(':memory:');

app.use(express.json());

const SECRET_KEY = 'your_secret_key';

db.serialize(async () => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
  db.run("CREATE TABLE payments (id INTEGER PRIMARY KEY, apartment INTEGER, amount INTEGER, date TEXT, description TEXT, status TEXT)");
  db.run("CREATE TABLE expenses (id INTEGER PRIMARY KEY, description TEXT, amount INTEGER, date TEXT)");

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin', 10);
  db.run("INSERT INTO users (username, password) VALUES (?, ?)", ['admin', hashedPassword]);
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ error: 'Invalid username or password' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Logout endpoint
app.post('/logout', (req, res) => {
  // Invalidate the token (in a real-world scenario, you might handle this differently)
  res.status(200).send({ message: 'Logged out' });
});

// Middleware to authenticate JWT
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token) {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).send('Invalid token');
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    res.status(401).send('No token provided');
  }
};

// Protected routes


app.post('/payment', authenticate, (req, res) => {
  const { apartment, amount, date, description, status } = req.body;
  db.run("INSERT INTO payments (apartment, amount, date, description, status) VALUES (?, ?, ?, ?, ?)", [apartment, amount, date, description, status], function (err) {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.send({ id: this.lastID });
  });
});

app.post('/expense', authenticate, (req, res) => {
  const { description, amount, date } = req.body;
  db.run("INSERT INTO expenses (description, amount, date) VALUES (?, ?, ?)", [description, amount, date], function (err) {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.send({ id: this.lastID });
  });
});

app.get('/payments', (req, res) => {
  db.all("SELECT * FROM payments", [], (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.send(rows);
  });
});

app.get('/payments/:id', (req, res) => {
  const paymentId = req.params.id;
  db.get("SELECT * FROM payments WHERE id = ?", [paymentId], (err, payment) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (!payment) {
      return res.status(404).send('Payment not found');
    }
    res.send(payment);
  });
});


app.get('/expenses', (req, res) => {
  db.all("SELECT * FROM expenses", [], (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.send(rows);
  });
});

app.listen(3300, () => {
  console.log('Server is running on port 3300');
});
