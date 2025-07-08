const express = require('express');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit'); 

const app = express();
const port = 3573;

app.use(express.json());
app.use(helmet());

// Rate limiter for login attempts 
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts
  message: 'Too many login attempts, please try again later'
});

// FAKE DATABASE 
const userAccounts = [
  {
    id: 1,
    username: 'game_lover42',
    password: bcrypt.hashSync('p@ssword123', 12), 
    role: 'student'
  },
  {
    id: 2,
    username: 'admin_john',
    password: bcrypt.hashSync('secureAdmin456', 12),
    role: 'admin'
  }
];

// Sample social media posts 
const socialPosts = [
  { 
    id: 1, 
    user: 'game_lover42', 
    content: 'Just beat God Of War!', 
    likes: 42 
  },
  { 
    id: 2, 
    user: 'admin_john', 
    content: 'Working on our final project.', 
    likes: 10 
  }
];

// AUTHENTICATION
const SECRET_KEY = 'SuperSecretKey';

// Login route 
app.post('/login', loginLimiter, async (req, res) => { 
  try {
    const { username, password } = req.body;
    
    const user = userAccounts.find(u => u.username === username);
    if (!user) return res.status(401).send('Wrong username or password');
    
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).send('Wrong username or password');
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    
    res.json({ 
      message: 'Login success!', 
      token, 
      user: { username: user.username, role: user.role } 
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Oops, something broke');
  }
});

// MIDDLEWARE
function checkAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('No token provided');
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).send('Invalid token');
  }
}

function isAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).send('Admins only!');
  }
  next();
}

// ROUTES
app.get('/posts', (req, res) => {
  res.json({
    message: 'Latest posts',
    posts: socialPosts
  });
});

app.get('/my-profile', checkAuth, (req, res) => {
  res.json({
    message: `Welcome ${req.user.username}!`,
    yourData: {
      role: req.user.role,
      lastLogin: new Date().toLocaleTimeString()
    }
  });
});

app.get('/admin-dashboard', checkAuth, isAdmin, (req, res) => {
  res.json({
    message: 'Secret admin stuff',
    serverStats: {
      users: userAccounts.length,
      posts: socialPosts.length
    }
  });
});

// Error handlers 
app.use((req, res) => {
  res.status(404).send("Oops! That page doesn't exist.");
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Something broke!');
});

// HTTPS setup 
const serverOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(serverOptions, app).listen(port, () => {
  console.log(`Server running on https://localhost:${port}`);
  console.log('all available routes:');
  console.log(`- POST /login (body: {username, password})`);
  console.log(`- GET /posts (public)`);
  console.log(`- GET /my-profile (requires login)`);
  console.log(`- GET /admin-dashboard (admin only)`);
});