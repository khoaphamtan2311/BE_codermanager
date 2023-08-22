const express = require("express");
const router = express.Router();
const {
  createTask,
  getTask,
  getTaskById,
  assignTask,
  updateStatus,
  deleteTask,
} = require("../controllers/task.controllers.js");

//Read
/**
 * @route GET api/tasks
 * @description get list of tasks
 * @access private
 */
router.get("/", getTask);

//Write
/**
 * @route POST api/tasks
 * @description create a new task
 * @access private
 * @allowedQueries name, status, createdAt, updatedAt, status
 */
router.post("/", createTask);
//Read
/**
 * @route GET api/tasks
 * @description get tasks by its Id
 * @access private
 */
router.get("/:id", getTaskById);
//Update
/**
 * @route put api/tasks
 * @description assign task to a user
 * @access private
 * @requiredBody taskId, userId
 */
router.put("/", assignTask);
//Update
/**
 * @route GET api/tasks
 * @description get list of tasks
 * @access private
 * @requiredBody status
 */
router.put("/:id", updateStatus);
/**
 * @route DELETE api/tasks
 * @description get list of tasks
 * @access private
 */
router.delete("/:id", deleteTask);

//export
module.exports = router;
