
# Secure Express Server Implementation

This project demonstrates a secure Express.js server with HTTPS, security headers via Helmet, and smart caching for select API routes.

---

##  1. Project Setup

### Requirements
- Node.js 
- OpenSSL (pre-installed on mac)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sourav-waj/secure-https.git
   cd your-repo
   ```

2. **Install dependencies:**
   ```bash
   npm install express helmet
   ```

3. **Generate SSL certificates:**

   Run in your terminal:
   ```bash
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
   ```

   Press Enter through all prompts to accept default values.

4. **Start the server:**
   ```bash
   node server.js
   ```

   Server will run at: `https://localhost:3571`

---

## 2. SSL/TLS & Security Headers

### Helmet Configuration

Security headers are applied using Helmet middleware:

```js
app.use(helmet());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.hsts({ maxAge: 31536000 }));
```

These headers help protect against:
- Clickjacking (`frameguard`)
- Protocol downgrade attacks (`HSTS`)

---

##  3. Caching Strategy


### Verification

Check response headers:

```bash
curl -I -k https://localhost:3571/posts
```

**Expected Output:**
```
HTTP/1.1 200 OK
Cache-Control: public, max-age=300
```

---

##  4. Implementation Challenges

###  Challenge 1: Browser SSL Warnings

- **Problem**: Browsers block self-signed certificates.
- **Solution**: Used `curl -k` for testing and documented user bypass procedure.



###  Challenge 2: To ensure caching is working properly

- **Problem**: `Cache-Control` headers were missing.
- **Solution**: Used `curl -i` to confirm headers are working. 

---

##  5. Testing Procedure

###  Verify HTTPS Connection:
```bash
openssl s_client -connect localhost:3571 -showcerts
```

###  Test Routes:
```bash
curl -k https://localhost:3571/posts
curl -k https://localhost:3571/posts/1
```

###  Check Caching:
1. Make an initial request.
2. Wait 1 minute.
3. Make another request.
4. Observe headers and response time to verify caching.

---

##  6. Key Learnings

- Proper middleware order is critical in Express.
- Self-signed vs trusted certs behave differently in browsers.
- Security headers provide important protection with minimal setup.

---

 Built with Express, Helmet, and HTTPS for a secure Node.js foundation.
