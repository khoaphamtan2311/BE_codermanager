const { default: mongoose } = require("mongoose");
const { sendResponse, AppError } = require("../helpers/utils.js");

const Task = require("../models/Task.js");
const User = require("../models/User.js");

const taskController = {};

//Create a Task
taskController.createTask = async (req, res, next) => {
  const options = { new: true };
  try {
    const info = req.body;
    if (!info) throw new AppError(402, "Bad Request", "Create task Error");
    if (!info.name || !info.description) {
      throw new AppError(402, "Bad Request", "Missing name and/or description");
    }
    const created = await Task.create(info);
    let callUser;
    if (info.asignee) {
      const getUser = await User.findById(info.asignee);
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
  const allowedFilter = ["name", "status", "status"];
  let newFilter = {};
  const isDeleted = { isDeleting: false };
  let sort = {};
  try {
    const query = req.query;
    if (query.sortByCreatedDay || query.sortByUpdatedDay) {
      if (query.sortByCreatedDay === "1") {
        sort = { createdAt: 1 };
      }
      if (query.sortByCreatedDay === "-1") {
        sort = { createdAt: -1 };
      }
      if (query.sortByUpdatedDay === "1") {
        sort = { updatedAt: 1 };
      }
      if (query.sortByUpdatedDay === "-1") {
        sort = { updatedAt: -1 };
      }
      delete query.sortByCreatedDay;
      delete query.sortByUpdatedDay;
    }
    if (Object.keys(query).length > 0) {
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
    const listOfFound = await Task.find(filteredField)
      .sort(sort)
      .populate("asignee");
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(420, "Bad Request", "Invalid ID");
    }
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
    const findUser = await User.findById(_id);
    if (findUser.length === 0) {
      throw new AppError(410, "Bad Request", "Cannot find User");
    }
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
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError(420, "Bad Request", "Invalid ID");
    }
    const checking = await Task.findById(taskId);

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
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError(420, "Bad Request", "Invalid ID");
    }
    const updated = await Task.findByIdAndUpdate(taskId, softDelete, options);

    const getUser = await User.findOne({ task: taskId });
    const newTask = getUser.task.filter((el) => !el.equals(taskId));

    const updateUser = await User.findOneAndUpdate(
      { _id: getUser._id },
      { task: newTask },
      options
    );

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
