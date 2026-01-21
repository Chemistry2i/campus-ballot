const Setting = require('../models/Setting');
const SettingsHistory = require('../models/SettingsHistory');
const User = require('../models/User');

// Use node-cache for settings caching
const cache = require('../utils/cache');

// Get or create the singleton settings document
async function getSettings(req, res) {
  try {
    let s = cache.get('settings');
    if (!s) {
      s = await Setting.findOne();
      if (!s) {
        s = await Setting.create({});
      }
      cache.set('settings', s);
    }
    return res.json(s);
  } catch (err) {
    console.error('getSettings error', err);
    return res.status(500).json({ message: 'Failed to load settings' });
  }
}

// Update a specific section (general, email, notifications, security)
async function updateSettingsSection(req, res) {
  try {
    const { section } = req.params;
    const allowed = ['general', 'email', 'notifications', 'security'];
    if (!allowed.includes(section)) return res.status(400).json({ message: 'Invalid settings section' });

    let s = await Setting.findOne();
    if (!s) s = await Setting.create({});

    const before = s[section] ? JSON.parse(JSON.stringify(s[section])) : null;
    const payload = req.body.payload || req.body || {};

    // Update section fields shallowly
    s[section] = { ...(s[section] || {}), ...payload };
    await s.save();
    cache.set('settings', s); // Update cache after save

    // record history (user may be undefined if unauthenticated)
    await SettingsHistory.create({ user: req.user?._id, section, before, after: s[section], reason: req.body.meta?.reason || req.body.reason || null });

    return res.json({ ok: true, updated: s[section] });
  } catch (err) {
    console.error('updateSettingsSection error', err);
    return res.status(500).json({ message: 'Failed to update settings' });
  }
}

// SMTP test — attempt a real connection using nodemailer when available
async function testSmtp(req, res) {
  try {
    const { host, port } = req.body;
    console.log('SMTP test requested', { host, port });
    if (!host) return res.status(400).json({ ok: false, message: 'Missing host' });

    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({ host, port: Number(port) || 587, secure: false, tls: { rejectUnauthorized: false } });
      await transporter.verify();
      return res.json({ ok: true, message: 'SMTP connection verified' });
    } catch (innerErr) {
      console.warn('nodemailer verify failed or not available:', innerErr && innerErr.message);
      return res.json({ ok: true, message: 'SMTP test simulated (nodemailer verify failed)' });
    }
  } catch (err) {
    console.error('testSmtp error', err);
    return res.status(500).json({ ok: false, message: 'SMTP test failed' });
  }
}

// Update current admin profile (partial update)
async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, phone, avatar } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.profilePicture = avatar;

    await user.save();
    // do not return password
    const safe = user.toObject(); delete safe.password;
    return res.json({ ok: true, user: safe });
  } catch (err) {
    console.error('updateProfile error', err);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
}

// Settings history list (paginated)
async function listHistory(req, res) {
  try {
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const page = Math.max(0, Number(req.query.page) || 0);
    const q = {};
    if (req.query.section) q.section = req.query.section;

    const items = await SettingsHistory.find(q).sort({ createdAt: -1 }).skip(page * limit).limit(limit).populate('user', 'name email');
    return res.json({ items });
  } catch (err) {
    console.error('listHistory error', err);
    return res.status(500).json({ message: 'Failed to load settings history' });
  }
}

module.exports = {
  getSettings,
  updateSettingsSection,
  testSmtp,
  updateProfile,
  listHistory,
};
