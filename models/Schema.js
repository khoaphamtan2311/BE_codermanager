const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "employee",
    enum: ["employee", "manager"],
  },
  task: { type: [mongoose.Schema.Types.ObjectId], ref: "Task", default: [] },
});
const taskSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "working", "review", "done", "archive"],
      default: "pending",
    },
    asignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: "none",
    },
    isDeleting: {
      type: Boolean,
      default: 0,
    },
  },
  { timestamps: true }
);

var User = mongoose.model("User", userSchema);
var Task = mongoose.model("Task", taskSchema);
module.exports = { User, Task };
