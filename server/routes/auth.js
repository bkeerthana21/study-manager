const r = require('express').Router(), bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const { User } = require('../models'), auth = require('../middleware/auth');
const send = (res, u, code = 200) => res.status(code).json({
  token: jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' }), user: { id: u._id, name: u.name, email: u.email } });
r.post('/register', async (req, res, next) => { try {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ message: 'Enter a name, an email and a password of at least 6 characters' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ message: 'This email is already registered' });
  send(res, await User.create({ name, email, password: await bcrypt.hash(password, 10) }), 201);
} catch (e) { next(e); } });
r.post('/login', async (req, res, next) => { try {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) return res.status(400).json({ message: 'Email or password is incorrect' });
  send(res, u);
} catch (e) { next(e); } });
r.get('/me', auth, async (req, res) => res.json(await User.findById(req.user.id).select('-password')));
module.exports = r;
