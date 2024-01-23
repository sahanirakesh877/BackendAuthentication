const User = require("../Models/UserSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const JWT_SECRETE_KEY = process.env.JWT_SECRETE_KEY || rolexbhai123;


// -----registration process-----------
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with the hashed password
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    await newUser.save(); // Save the user to the database

    // Send a success message with the created user details (excluding the password)
    res.status(201).json({
      message: "User created successfully",
      user: { name, email, phone },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// -----------login processs-------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Password matches, create a JWT token
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRETE_KEY,
      {
        expiresIn: "1h", // Token expiration time
      }
    );

    // Password matches, successful login
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// change password functioality password
const changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    // find user by ID
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }
    // Compare the provided old password with the stored hashed password
    const passwordMatch = await bcrypt.compare(
      oldPassword,
      existingUser.password
    );
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid old password" });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password with the new hashed password
    existingUser.password = hashedNewPassword;
    await existingUser.save(); // Save the updated user to the database

    // Send a success message
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//  reset or forget password  logic
const forgetpassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Set up Node Mailer transport
    const transporter = nodemailer.createTransport({
      // Specify your email service details (SMTP or other service)
      service: "gmail",
      auth: {
        user: "sahanirakesh877@gmail.com",
        pass: "pnvh gmbs hzrd wdzc",
      },
    });
    // Compose email message
    const mailOptions = {
      from: "sahanirakesh877@gmail.com",
      to: email,
      subject: " sending email for Password Reset Request",
      // text: ` http://yourdomain.com/reset/${resetToken}`,
      html: "<h1>congrats  you successfully send email</h1>",
    };
    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: "Email could not be sent" });
      }
      console.log("Email sent: " + info.response);
      res
        .status(200)
        .json({ message: "Password reset link sent successfully" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// continue with google
const loginwithgoogle = async () => {
  // Set up Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID:
          "799798754225-9a0pt4jik57ll5nls2fiift6594i5rge.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "http://localhost:5000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log('accessToken',accessToken)
        console.log('refreshToken',refreshToken)
        console.log('profile',profile)
        console.log('done',done)
        try {
          // Check if the user with the Google profile ID already exists in your database
          let user = await User.findOne({ googleId: profile.id });
          console.log(user);

          if (!user) {
            // If the user doesn't exist, create a new user in your database
            user = new User({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
            });
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
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
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // In your login route, use passport.authenticate('google') to initiate the Google OAuth flow
  const loginwithgoogle = passport.authenticate("google", {
    scope: ["profile", "email"],
  });

  // Google OAuth callback route
  const loginwithgoogleCallback = passport.authenticate("google", {
    failureRedirect: "/login",
  });

  // Handle the callback and redirect accordingly
  app.get("/auth/google/callback", loginwithgoogleCallback, (req, res) => {
    // Successful authentication, redirect to the desired page
    res.redirect("/");
  });

};

module.exports = {
  register,
  login,
  changePassword,
  forgetpassword,
  loginwithgoogle,
};
