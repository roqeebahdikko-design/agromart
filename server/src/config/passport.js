const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const configurePassport = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          let user = await User.findOne({ email });

          if (!user) {
            user = await User.create({
              name: profile.displayName || 'Google User',
              email,
              googleId: profile.id,
              password: Math.random().toString(36)
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
};

module.exports = { configurePassport, passport };
