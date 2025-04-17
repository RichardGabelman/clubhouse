const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

router.get("/create-message", (req, res) => {
  if (!req.user) {
    res.redirect("/");
  }
  res.render("create-message", { user: req.user });
});

router.post("/create-message", async (req, res, next) => {
  if (!req.user) {
    return res.status(403).send("Forbidden");
  }
  try {
    await pool.query("INSERT INTO messages (author_id, message) VALUES ($1, $2)", [
      req.user.id,
      req.body.message,
    ]);
    console.log("Successfully created new message!");
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/delete-message/:id", async (req, res, next) => {
  if (!(req.user && req.user.admin)) {
    return res.status(403).send("Forbidden");
  }
  const messageId = req.params.id;
  try {
    await pool.query("DELETE FROM messages WHERE id = $1", [messageId]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;