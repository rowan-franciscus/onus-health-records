// config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { User, Patient, HealthProvider } = require('../models');

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy for email/password authentication
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      
      // If user not found or password doesn't match
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      
      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      
      // If provider, check verification status
      if (user.role === 'provider' && user.verificationStatus === 'rejected') {
        return done(null, false, { message: 'Your provider account has been rejected.' });
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// JWT Strategy for token authentication
passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  },
  async (jwtPayload, done) => {
    try {
      // Find user by id from JWT payload
      const user = await User.findById(jwtPayload.id);
      
      if (!user) {
        return done(null, false);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          // Update last login
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }
        
        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }
        
        // Get the role from the request or use default
        const role = req.session.registrationType || 'patient';
        
        // Create a new user
        if (role === 'patient') {
          user = new Patient({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            role: 'patient',
            isVerified: true, // Auto-verify with OAuth
            profileImage: profile.photos[0]?.value
          });
        } else if (role === 'provider') {
          user = new HealthProvider({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            role: 'provider',
            isVerified: true, // Auto-verify with OAuth
            profileImage: profile.photos[0]?.value,
            verificationStatus: 'pending' // Still need admin approval for provider
          });
        }
        
        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'photos', 'email'],
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Facebook ID
        let user = await User.findOne({ facebookId: profile.id });
        
        if (user) {
          // Update last login
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }
        
        // Check if user exists with the same email
        if (profile.emails && profile.emails[0]) {
          user = await User.findOne({ email: profile.emails[0].value });
          
          if (user) {
            // Link Facebook account to existing user
            user.facebookId = profile.id;
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }
        }
        
        // If no email from Facebook, can't proceed
        if (!profile.emails || !profile.emails[0]) {
          return done(null, false, { message: 'No email found in Facebook profile' });
        }
        
        // Get the role from the request or use default
        const role = req.session.registrationType || 'patient';
        
        // Create a new user
        if (role === 'patient') {
          user = new Patient({
            name: profile.displayName,
            email: profile.emails[0].value,
            facebookId: profile.id,
            role: 'patient',
            isVerified: true, // Auto-verify with OAuth
            profileImage: profile.photos[0]?.value
          });
        } else if (role === 'provider') {
          user = new HealthProvider({
            name: profile.displayName,
            email: profile.emails[0].value,
            facebookId: profile.id,
            role: 'provider',
            isVerified: true, // Auto-verify with OAuth
            profileImage: profile.photos[0]?.value,
            verificationStatus: 'pending' // Still need admin approval for provider
          });
        }
        
        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));
}

module.exports = passport;