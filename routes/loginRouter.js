const { Router } = require("express");
const passport = require("passport");

const loginRouter = Router();

loginRouter.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

module.exports = loginRouter;
