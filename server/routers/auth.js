const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { User } = require('../database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(406).json({ error: 'All fields are required.' });
    const user = await User.findOne({ email: email }, { email: 1, password: 1, salt: 1, userId: 1 });
    if (!user)
      return res.status(406).json({
        error: 'We cannot find an account with that email address.',
      });
    const passwordHash = crypto.createHmac('sha256', user.salt).update(password).digest('hex');
    const verifyPassword = passwordHash === user.password;
    if (!verifyPassword) return res.status(406).json({ error: 'Incorrect password.' });
    const refreshToken = crypto.randomBytes(32).toString('hex');
    await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          refreshToken: { refreshToken, issued: Date.now() },
        },
      }
    );
    res
      .status(200)
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ success: 'Logged in successfully.' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'Something went wrong!' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, username, password, confirmPassword } = req.body;
    const dateOfBirth = Date.now();

    if (username.length > 15) return res.status(406).json({ error: 'Username can not be longer than 15 characters.', type: 'username' });
    if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) return res.status(406).json({ error: 'Email does not match the required pattern.', type: 'email' });
    if (!password.match(/^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/))
      return res.status(406).json({ error: 'Password should have at least one alphabetic letter, one capital letter and one numeric letter.', type: 'password' });
    if (password !== confirmPassword) return res.status(406).json({ error: 'Passwords do not match.', type: 'confirmPassword' });

    const usernameExists = await User.findOne({ username: username }, { username: 1 });
    if (usernameExists) return res.status(406).json({ error: 'Username is already taken.', type: 'username' });
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.createHmac('sha256', salt).update(password).digest('hex');
    const userId = crypto.randomBytes(32).toString('hex');

    await User.create({
      username: username,
      email: email,
      password: passwordHash,
      salt: salt,
      userId: userId,
      userImage: '',
      status: 'Online',
      bio: '',
      friends: [],
      friendRequests: [],
      blockedUsers: [],
      serverList: [],
      refreshToken: { refreshToken: 'none', issued: Date.now() },
      dateOfBirth: dateOfBirth,
    });
    return res.status(200).json({ success: 'Successfully Registered!' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'Something went wrong!' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const user = await User.findOneAndUpdate(
      {
        'refreshToken.refreshToken': refreshToken,
      },
      {
        $set: {
          refreshToken: { refreshToken: 'none', issued: Date.now() },
        },
      }
    );
    if (!user)
      return res.status(401).json({
        error: 'You are not logged in!',
      });
    return res
      .status(200)
      .cookie('refreshToken', '', {
        httpOnly: true,
        maxAge: 1,
      })
      .json({ success: 'Logged out successfully.' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'Something went wrong!' });
  }
});

router.post('/refreshtoken', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const user = await User.findOne(
      {
        'refreshToken.refreshToken': refreshToken,
      },
      { username: 1, userId: 1, refreshToken: 1 }
    );
    if (!user) return res.status(401).json({ error: 'You are not logged in.' });

    const currentTime = new Date();
    const timePassed = (currentTime - user.refreshToken.issued) / 3600000;
    if (timePassed > 24) return res.status(401).json({ error: 'You are not logged in.' });

    const userObject = { userId: user.userId, name: user.username };
    const accessToken = jwt.sign(userObject, JWT_SECRET, { expiresIn: '30m' });
    return res.status(200).json({ accessToken: accessToken });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'Something went wrong!' });
  }
});

module.exports = router;
