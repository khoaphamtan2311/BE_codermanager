const mongoose = require("mongoose");

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
    },
    isDeleting: {
      type: Boolean,
      default: 0,
    },
  },
  { timestamps: true }
);

var Task = mongoose.model("Task", taskSchema);
module.exports = Task;
