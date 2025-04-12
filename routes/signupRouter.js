const { Router } = require("express");

const signupRouter = Router();

signupRouter.get("/sign-up", (req, res) => res.render("sign-up-form"));
signupRouter.post("/sign-up", async (req, res, next) => {
  try {
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      req.body.username,
      req.body.password,
    ]);
    res.redirect("/");
  } catch(err) {
    return next(err);
  }
});