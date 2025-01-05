const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true , minlength: 3},
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  priority: { type: Number, min: 1, max: 5, required: true },
  status: { type: String, enum: ['pending', 'finished'],default: 'pending', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
},{ timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);

