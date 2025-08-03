# Secure User Dashboard

A secure web application built with Node.js, Express, and EJS that implements authentication, data encryption, and security best practices.

## Features

- JWT authentication with HTTP-only cookies
- HTTPS encryption with self-signed certificates
- Profile management with form validation
- Protection against XSS and SQL injection
- Automated security checks via GitHub Actions

## Installation

### Prerequisites
- Node.js (v14+)
- npm (comes with Node.js)
- OpenSSL (pre-installed on macOS/Linux)

### Setup Instructions

1. Clone the repository

git clone https://github.com/sourav-waj/secure-https.git
cd your-repo

2. Install dependencies

npm install

3. Run the application
node server.js

text

4. Access the application
https://localhost:3000


Ignore browser security warnings for local development

## Usage

### Test Credentials
Username: student_user
Password: student123

### Application Flow
1. Login with valid credentials
2. View dashboard with profile information
3. Update profile details

## Security Implementation

### Key Protections
- Input Validation: All user inputs are validated and sanitized
- Output Encoding: Rendered content is automatically escaped
- Data Encryption: Sensitive fields encrypted before database storage
- Secure Cookies: JWT tokens stored in HTTP-only, secure cookies
- HTTPS: All traffic encrypted with TLS

### Dependency Management
Regular security audits are performed using:

npm audit
npm audit fix

## Troubleshooting

### Common Issues
1. Certificate Warnings:
   - Expected for self-signed certs - proceed anyway in browser

2. Port Already in Use:
lsof -i :3000
kill -9 [PID]

text

3. Missing Dependencies:
rm -rf node_modules package-lock.json
npm install

## Security Techniques Used

### Input Validation Techniques

We used express-validator and validator libraries to ensure only safe and expected inputs are accepted:
Name: Must be alphabetic and between 3–50 characters.
Email: Must follow a valid email format.
Bio: Maximum 500 characters, with HTML tags and special characters removed.
This prevents injection attacks and ensures only clean data is processed.

### Output Encoding Methods

To prevent Cross-Site Scripting (XSS) attacks:
All user-generated content shown in the dashboard is escaped using the escape-html package or handled automatically by the EJS templating engine.
This ensures that code-like input (e.g., <script>) is displayed as plain text and not executed.
Example:
User input like <script>alert("XSS")</script>
will render as &lt;script&gt;alert("XSS")&lt;/script&gt;.

### Encryption Techniques Used

We used Node.js's built-in crypto module to encrypt sensitive fields before saving to the database:
Encrypted fields: Email and Bio
A secret key from the .env file is used for encryption and decryption.
Decryption is applied securely when displaying the values back to the user.
This keeps user data secure, even if the database is exposed.

### Third-Party Libraries & Dependency Management

The application uses updated, trusted libraries like express, helmet, bcrypt, validator, and more.
npm audit is used to identify and fix security vulnerabilities.
GitHub Actions can be added to automate security checks and updates for dependencies.

## Reflection

During development, I learned:
- How proper input validation prevents injection attacks
- The importance of output encoding against XSS
- Challenges of implementing encryption while maintaining usability
- How automated dependency checks help maintain long-term security

The project demonstrated how multiple security layers work together to protect user data.
