require("dotenv").config();
const express = require("express");
const path = require("node:path");
const indexRouter = require("./routes/indexRouter");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).send(err.message);
});
app.all("*", (req, res) => {
  res.status(404).send("<h1>404! Page not found</h1>");
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Clubhouse App - listening on port ${PORT}!`);
});