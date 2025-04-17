const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

router.get("/", async (req, res) => {
  let messages;
  if (req.user && (req.user.membership || req.user.admin)) {
    messages = await pool.query("SELECT messages.id, messages.*, users.username FROM messages JOIN users ON messages.author_id = users.id");
  } else {
    messages = await pool.query("SELECT message FROM messages");
  }
  res.render("index", { user: req.user, messages: messages.rows });
});

module.exports = router;