const express = require("express");
const app = express();
const session = require('express-session');
const passport = require('passport');

const PORT = process.env.PORT || 5000;

// databases connections
const ConnectDB = require("./DataBase/ConnectDb");
ConnectDB();

// middleware
app.use(express.json());
app.use(session({ secret: 'kjhgju7658gfgh', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

//routes defined
const userrouter = require("./Routes/UserRoutes");
app.use("/api", userrouter);

// continue with google routes
require('./service/passport');
app.get('/auth/google', passport.authenticate('google',{scope:['profile','email']}))
app.get('/auth/google/callback', passport.authenticate('google',{
  successRedirect:'http://localhost:5173',
  failureRedirect:'http://localhost:5173/login'

}))




app.listen(PORT, () => {
  console.log(` Server listening on ${PORT}`);
});
