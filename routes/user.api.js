const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers,
  searchUser,
  getUserTask,
} = require("../controllers/user.controllers.js");

//Read
/**
 * @route GET api/users
 * @description get list of users
 * @access private
 * @allowedQueries name, role, task
 */
router.get("/", getUsers);

//Create
/**
 * @route POST api/users
 * @description create a user
 * @access private, manager
 * @body name, role
 */
router.post("/", createUser);

//Search By Name
/**
 * @route GET api/users
 * @description search a user by his/her name
 * @access public
 * @params name
 */
router.get("/:name", searchUser);

//Get User's Task
/**
 * @route GET api/users
 * @description get user's task by his/her id
 * @access public
 */
router.get("/tasks/:id", getUserTask);

//export
module.exports = router;
