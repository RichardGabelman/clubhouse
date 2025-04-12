const { Router } = require("express");

const loginRouter = Router();

loginRouter.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

module.exports = loginRouter;
