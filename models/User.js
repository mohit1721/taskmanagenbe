const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
    type: String,
    required: true,
    trim: true, //trim..
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
  token: {
    type: String, //
  },
  image:{
    type: String,
  }
});

module.exports = mongoose.model('User', UserSchema);
