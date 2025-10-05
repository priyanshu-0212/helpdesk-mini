// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

const router = express.Router();

// ## Endpoint for User Registration ##
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the new user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // By default, new users get the 'USER' role from our schema
      },
    });

    // 4. Send back the created user (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    res.status(500).json({ error: 'Registration failed.', details: error.message });
  }
});

// ## Endpoint for User Login ##
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by their email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 2. Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 3. If password is valid, create a JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role }, // Payload
      process.env.JWT_SECRET, // Your secret key
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // 4. Send the token back to the client
    res.status(200).json({ token });

  } catch (error) {
    res.status(500).json({ error: 'Login failed.', details: error.message });
  }
});

module.exports = router;