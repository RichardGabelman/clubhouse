const pool = require("../db/pool");
const db = require("../db/queries");

async function addNewUser(username, password) {
  await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
    req.body.username,
    req.body.password,
  ]);
  res.redirect("/");
}