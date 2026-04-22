const express = require('express');
const { passport } = require('../config/passport');
const {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  googleCallbackSuccess
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallbackSuccess
);

module.exports = router;
