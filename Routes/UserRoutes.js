const express = require("express");
const router = express.Router();

const usercontroller = require("../Controllers/user-controller");

router.route("/register").post(usercontroller.register);
router.route("/login").post(usercontroller.login);
router.route("/changepassword").post(usercontroller.changePassword);
router.route("/resetpassword").post(usercontroller.forgetpassword);

module.exports = router;
