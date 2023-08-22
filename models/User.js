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

var User = mongoose.model("User", userSchema);

module.exports = User;
