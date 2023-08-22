const { sendResponse, AppError } = require("../helpers/utils.js");

const { Task } = require("../models/Schema.js");
const { User } = require("../models/Schema.js");

const taskController = {};

//Create a Task
taskController.createTask = async (req, res, next) => {
  const options = { new: true };
  try {
    const info = req.body;
    if (!info) throw new AppError(402, "Bad Request", "Create task Error");
    if (!info.status) {
      info.status = "pending";
    }
    const created = await Task.create(info).populate("asignee");
    let callUser;
    if (info.asignee) {
      console.log(info.asignee);
      const getUser = await User.findById(info.asignee);
      console.log(getUser);
      const taskUpdate = [...getUser?.task, created._id];
      callUser = await User.findByIdAndUpdate(
        info.asignee,
        {
          task: taskUpdate,
        },
        options
      );
    }
    sendResponse(
      res,
      200,
      true,
      { task: created, user: callUser || {} },
      null,
      "Create Task Successfully"
    );
  } catch (error) {
    next(error);
  }
};
//get Task with filter
taskController.getTask = async (req, res, next) => {
  const allowedFilter = ["name", "status", "createdAt", "updatedAt", "status"];
  let newFilter = {};
  const isDeleted = { isDeleting: false };
  try {
    if (Object.keys(req.query).lengths > 0) {
      const query = req.query;
      var checkFilter = Object.keys(query);
      const checkedFilter = checkFilter.filter((filter) =>
        allowedFilter.includes(filter)
      );
      if (checkedFilter.length === 0) {
        throw new AppError(402, "Bad Request", "Invalid Query");
      }
      let replacedFilters = Object.keys(query).map((key) => {
        const newKey = checkedFilter[key] || key;
        return { [newKey]: query[key] };
      });
      newFilter = replacedFilters.reduce((a, b) => Object.assign({}, a, b));
    }
    const filteredField = Object.assign(newFilter, isDeleted);
    const listOfFound = await Task.find(filteredField).populate("asignee");
    if (listOfFound.length === 0) {
      sendResponse(res, 200, true, null, "Couldn't find task ");
    }
    sendResponse(
      res,
      200,
      true,
      { task: listOfFound },
      null,
      "Get User List Successfully!"
    );
  } catch (error) {
    next(error);
  }
};

//get Task by it ID
taskController.getTaskById = async (req, res, next) => {
  const id = req.params.id;

  try {
    const found = await Task.find({ _id: id, isDeleting: false });
    if (found.length === 0) {
      sendResponse(res, 200, true, null, "Couldn't find task ");
    }
    sendResponse(
      res,
      200,
      true,
      { user: found },
      null,
      "Get Task Successfully!"
    );
  } catch (error) {
    next(error);
  }
};
//Assign a task to a user
taskController.assignTask = async (req, res, next) => {
  const _id = req.body.userId;
  const taskId = req.body.taskId;
  const options = { new: true };
  try {
    const found = await User.findById(_id);
    if (found.task.includes(taskId)) {
      throw new AppError(402, "Bad Request", "Already assigned to this user");
    }
    const taskList = [...found.task, taskId];
    const update = await User.findByIdAndUpdate(
      _id,
      { task: taskList },
      options
    );
    const checkTaskAsignee = await Task.findById(taskId);
    if (
      checkTaskAsignee.asignee !== _id &&
      checkTaskAsignee.asignee !== "none"
    ) {
      const deleteTaskInOldUser = await User.findByIdAndUpdate(
        checkTaskAsignee.asignee,
        { task: [] },
        options
      );
      console.log(deleteTaskInOldUser);
    }
    const updateInTask = await Task.findByIdAndUpdate(
      taskId,
      { asignee: _id, status: "working" },
      options
    );
    sendResponse(
      res,
      200,
      true,
      { task: updateInTask, user: update },
      null,
      "Get Task Successfully!"
    );
  } catch (error) {
    next(error);
  }
};

//update a status
taskController.updateStatus = async (req, res, next) => {
  const taskId = req.params.id;
  const taskStatus = req.body;
  const options = { new: true };
  try {
    const checking = await Task.findById(taskId);
    console.log(checking);
    if (checking.status === "done" && taskStatus.status !== "archive") {
      throw new AppError(
        402,
        "Bad Request",
        "Cannot update status when it's done"
      );
    }
    if (checking.status === "archive") {
      throw new AppError(402, "Bad Request", "This is archive");
    }
    const updateStatus = await Task.findByIdAndUpdate(
      taskId,
      taskStatus,
      options
    );
    sendResponse(
      res,
      200,
      true,
      { task: updateStatus },
      null,
      "Update Task Status Successfully!"
    );
  } catch (error) {
    next(error);
  }
};

//delete Task
taskController.deleteTask = async (req, res, next) => {
  const taskId = req.params.id;
  const options = { new: true };
  const softDelete = { isDeleting: true };
  try {
    const updated = await Task.findByIdAndUpdate(taskId, softDelete, options);
    console.log("updated", updated);
    const getUser = await User.findOne({ task: taskId });
    const newTask = getUser.task.filter((el) => !el.equals(taskId));
    console.log(newTask);
    const updateUser = await User.findOneAndUpdate(
      { _id: getUser._id },
      { task: newTask },
      options
    );
    console.log(updateUser);
    sendResponse(
      res,
      200,
      true,
      { task: updated, user: updateUser },
      null,
      "Delete Task Successfully!"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = taskController;
