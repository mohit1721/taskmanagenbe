const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true , minlength: 3},
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  priority: { type: Number, min: 1, max: 5, required: true },
  status: { type: String, enum: ['pending', 'finished'],default: 'Pending', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
},{ timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);


// const mongoose = require('mongoose');
// const AutoIncrement = require('mongoose-sequence')(mongoose); // Import AutoIncrement plugin

// const TaskSchema = new mongoose.Schema({
//   taskId: { type: Number }, // Auto-incremented task ID
//   title: { type: String, required: true, minlength: 3 },
//   startTime: { type: Date, required: true },
//   endTime: { type: Date, required: true },
//   priority: { type: Number, min: 1, max: 5, required: true },
//   status: { 
//     type: String, 
//     enum: ['pending', 'finished'], 
//     default: 'pending', 
//     required: true 
//   },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
// }, { timestamps: true });

// // ✅ Add Auto-Increment plugin for taskId
// TaskSchema.plugin(AutoIncrement, { inc_field: 'taskId' });

// const Task = mongoose.model('Task', TaskSchema);

// module.exports = Task;
