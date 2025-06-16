// Basic server setup with HTTPS and security headers

const express = require('express');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');


const app = express();
const port = 3571; 


app.use(express.json()); 


app.use(helmet());

app.use(helmet.frameguard({ action: 'deny' })); 
app.use(helmet.hsts({ maxAge: 31536000 })); 


function setCache(time) {
  return (req, res, next) => {
    res.set('Cache-Control', `public, max-age=${time}`);
    next();
  };
}

app.get('/', (req, res) => {
  res.send('Hello from my secure server!');
});


app.get('/posts', setCache(300), (req, res) => {
  const posts = [
    { id: 1, title: 'My first post', content: 'Learning about security' },
    { id: 2, title: 'HTTPS is cool', content: 'Setting up certificates' }
  ];
  res.json(posts);
});


app.get('/posts/:id', setCache(300), (req, res) => {
  const post = { 
    id: req.params.id, 
    title: `Post ${req.params.id}`, 
    content: 'URL is working properly!' ,
  };
  res.json(post);
});

app.post('/posts', (req, res) => {
  console.log('Would create post:', req.body);
  res.send('Post created (not really)');
});


app.use((req, res) => {
  res.status(404).send("Oops! That page doesn't exist.");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};


https.createServer(options, app).listen(port, () => {
  console.log(`Server running on https://localhost:${port}`);
  console.log('Note: please allow continue if u get warning pop-screen');
});

