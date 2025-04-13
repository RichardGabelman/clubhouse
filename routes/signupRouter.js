const { Router } = require("express");
const bcrypt = require("bcryptjs");

const signupRouter = Router();

signupRouter.get("/sign-up", (req, res) => res.render("sign-up-form"));
signupRouter.post("/sign-up", async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      req.body.username,
      hashedPassword,
    ]);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
});
