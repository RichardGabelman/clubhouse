const { Router } = require("express");
const { load } = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/", load);

module.exports = indexRouter;