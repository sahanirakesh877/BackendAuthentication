const Usergoogle = require("../Models/googleContinue");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID:
        process.env.clientID,
      clientSecret:process.env.clientSecret,
      callbackURL: "http://localhost:5000/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('profile', profile)
      try {
        let user = await Usergoogle.findOne({ googleId: profile.id });
        if (!user) {
          // If the user doesn't exist, create a new user in your database
          user = new Usergoogle({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            image: profile.photos[0].value,
          });
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(null, profile);
      }
    }
  )
);

// Serialize user information into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Usergoogle.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
