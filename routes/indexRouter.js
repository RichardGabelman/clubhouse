const { Router } = require("express");

const indexRouter = Router();

indexRouter.get("/", () => {
  console.log("got index page");
});

module.exports = indexRouter;