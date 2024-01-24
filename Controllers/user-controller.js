const User = require("../Models/UserSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

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

module.exports = {
  register,
  login,
  changePassword,
  forgetpassword,
};
