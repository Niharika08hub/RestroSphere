const passport = require("passport");

const GoogleStrategy =
  require("passport-google-oauth20").Strategy;

const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const User = require("../models/User");

// =========================
// GOOGLE STRATEGY
// =========================

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET,

      callbackURL:
        "http://localhost:5000/api/auth/google/callback",
    },

    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      try {
        const email =
          profile.emails?.[0]?.value?.toLowerCase();

        if (!email) {
          return done(
            new Error("Google account has no email")
          );
        }

        let user = await User.findOne({
          email,
        });

        if (!user) {
          user = await User.create({
            fullName:
              profile.displayName || "Google User",

            email,

            role: "customer",

            googleId: profile.id,

            password: "",
          });
        }

        if (user.role !== "customer") {
          return done(
            new Error(
              "Google login is only available for customers"
            )
          );
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// =========================
// JWT STRATEGY
// =========================

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      secretOrKey: process.env.JWT_SECRET,
    },

    async (payload, done) => {
      try {
        const user = await User.findById(payload.id);

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

module.exports = passport;