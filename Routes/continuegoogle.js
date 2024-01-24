// Continue with Google route
const passport = require("passport");
module.exports = (app) => {
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  const loginwithgoogleCallback = passport.authenticate("google", {
    failureRedirect: "/login",
  });
  app.get("/auth/google/callback", loginwithgoogleCallback, (req, res) => {
    res.redirect("/");
  });
};
