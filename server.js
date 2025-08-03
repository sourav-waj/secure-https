const express = require('express');
const https = require('https');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const { body, validationResult } = require('express-validator');
const CryptoJS = require('crypto-js');
const cookieParser = require('cookie-parser');


const app = express();
const db = new Database('users.db');

// Setup database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    name TEXT,
    email TEXT,
    bio TEXT
  )
`);

// Insert test user if none exists
if (!db.prepare("SELECT * FROM users").get()) {
  const hashedPass = bcrypt.hashSync('student123', 10);
  db.prepare("INSERT INTO users (username, password, name, email, bio) VALUES (?, ?, ?, ?, ?)")
    .run('student_user', hashedPass, 'Student', 'student@school.edu', 'Computer Science major');
}

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => res.render('login'));

app.post('/login', [
  body('username').trim().escape(),
  body('password').notEmpty()
], (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(req.body.username);
  
  if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(401).send('Invalid credentials');
  }

  const token = jwt.sign({ id: user.id }, 'school_secret', { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true, secure: true }).redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, 'school_secret');
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.id);
    
    res.render('dashboard', { 
      user: {
        username: user.username,
        name: user.name,
        email: CryptoJS.AES.decrypt(user.email, 'school_key').toString(CryptoJS.enc.Utf8),
        bio: user.bio
      }
    });
  } catch (err) {
    res.redirect('/login');
  }
});

const { check } = require('express-validator');

app.post('/update-profile', [
  check('name')
    .isLength({ min: 3, max: 50 }).withMessage('Name must be 3-50 characters.')
    .matches(/^[A-Za-z\s]+$/).withMessage('Name must contain only letters and spaces.')
    .trim().escape(),

  check('email')
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail(),

  check('bio')
    .isLength({ max: 500 }).withMessage('Bio must be less than 500 characters.')
    .trim().escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).send('Invalid input');
  
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, 'school_secret');
    
    const encryptedEmail = CryptoJS.AES.encrypt(req.body.email, 'school_key').toString();
    
    db.prepare("UPDATE users SET name = ?, email = ?, bio = ? WHERE id = ?")
      .run(req.body.name, encryptedEmail, req.body.bio, decoded.id);
      
    res.send('Profile updated successfully!');
  } catch (err) {
    res.status(401).send('Unauthorized');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token').redirect('/login');
});

// Start HTTPS server
https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}, app).listen(3000, () => {
  console.log('Secure server running on https://localhost:3000');
});