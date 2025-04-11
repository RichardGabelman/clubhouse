const db = require("../db/queries");

async function load(req, res) {
  res.render("index");
}

module.exports = {
  load
};