const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

router.get('/become-a-member', (req, res) => {
  if (!req.user) {
    return res.redirect('/');
  }
  res.render('become-member', { user: req.user });
});

router.post("/become-a-member", async (req, res, next) => {
  if (!req.user) {
    res.redirect("/");
  }
  try {
    const userCode = req.body.code;
    if (userCode == process.env.MEMBER_CODE) {
      console.log("successfully became a member!");
      await pool.query("UPDATE users SET membership = true WHERE id = ($1)", [
        req.user.id,
      ]);

      const result = await pool.query("SELECT * FROM users WHERE id = $1", [
        req.user.id,
      ]);
      const updatedUser = result.rows[0];

      req.login(updatedUser, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/become-an-admin", (req, res) => {
  if (!req.user) {
    res.redirect("/");
  }
  res.render("become-admin", { user: req.user });
});

router.post("/become-an-admin", async (req, res, next) => {
  if (!req.user) {
    res.redirect("/");
  }
  try {
    const userCode = req.body.code;
    if (userCode == process.env.ADMIN_CODE) {
      console.log("successfully became an admin!");
      await pool.query("UPDATE users SET admin = true WHERE id = ($1)", [
        req.user.id,
      ]);
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [
        req.user.id,
      ]);
      const updatedUser = result.rows[0];

      req.login(updatedUser, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;

