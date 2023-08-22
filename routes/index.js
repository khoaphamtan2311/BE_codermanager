var express = require("express");
var router = express.Router();
const { sendResponse, AppError } = require("../helpers/utils.js");
const { User } = require("../models/Task.js");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("Welcome to CoderSchool!");
});

router.get("/template/:test", async (req, res, next) => {
  const { test } = req.params;
  try {
    //turn on to test error handling
    if (test === "error") {
      throw new AppError(401, "Access denied", "Authentication Error");
    } else {
      sendResponse(
        res,
        200,
        true,
        { data: "template" },
        null,
        "template success"
      );
    }
  } catch (err) {
    next(err);
  }
});

const usersRouter = require("./user.api.js");
router.use(`/users`, usersRouter);
const tasksRouter = require("./task.api.js");
router.use("/tasks", tasksRouter);
module.exports = router;
