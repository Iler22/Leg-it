const router = require('express').Router();
const User = require('../../models/User');
const bcrypt = require('bcrypt');

// Get one user
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({
      raw: true,
      where: { username: req.body.name },
    });
    console.log(user);
    if (!user) {
      res.status(404).json({ message: 'Login failed. Please try again!' });
      return;
    }
    console.log(req.body.password);
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    console.log(validPassword);
    if (!validPassword) {
      res.status(400).json({ message: 'Login failed. Please try again!' });
      return;
    }
    req.session.save(() => {
      req.session.loggedIn = true;
      req.session.user = {
        id: user.id,
        username: user.username,
      };
      res.json({ success: true });
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// CREATE a new user
router.post('/register', async (req, res) => {
  try {
    const userData = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    req.session.save(() => {
      req.session.loggedIn = true;
      res.status(200).json(userData);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.post('/logout', (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
