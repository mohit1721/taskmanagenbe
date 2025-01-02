const Task = require('../models/Task');
const User = require('../models/User');
const { taskValidator } = require('../utils/validators');

exports.createTask = async (req, res) => {
  const token =  req.header('Authorization')?.replace("Bearer ", "") || req.cookies.token || req.body.token;
console.log("token in createtask controller" , token)
  try {
    const { error } = taskValidator.validate(req.body);
console.log("req.user.id", req.user.id);
    const newTask = await Task.create({ ...req.body, userId: req.user.id });
    await User.findByIdAndUpdate(
        {
            _id: req.user.id,

        },
        {
            $push:{
                tasks:newTask._id,
            }
        }
    )
    console.log("my new task-> from FE ",newTask)
   return res.status(201).json({
    
    success: true,
    data: newTask,
    message: "Task Created Successfully",

   });
  } catch (err) {
   return res.status(500).json({ 
     success: false,
    message: "Failed to create task",
    error: err.message, });
  }
};
 

//task list
//fine..
exports.getTasks = async (req, res) => {
  try {
      const { 
          status='all',       // Filter by task status
          priority='all',     // Filter by priority
          sortBy='endTime',       // Sorting field (e.g., title, start_time, end_time, priority, status)
          order='desc',
          page = 1,     // Default page
          limit = 10   // Default limit
      } = req.query;
// ✅ Explicitly Set Default Value for sortBy if Undefined or Empty
// const finalSortBy = sortBy && sortBy.trim() !== '' ? sortBy : 'endTime_desc';
console.log('Raw Query:', req.query);

console.log("my query from fe", status , priority,sortBy,order)
 // Ensure we have the logged-in user's ID
 const userId = req.user.id;  // Assuming `req.user` is set by your authentication middleware
console.log("userId in get Stats", userId)
      // ✅ Build Query: Filtering Logic
      let filter = {userId};
      if (priority && priority !== 'all') filter.priority = Number(priority); // Filter by priority
      if (status && status !== 'all') filter.status = status; // Filter by status (e.g., Pending, Finished)

  // ✅ Sorting Logic
  // let sortOption = {};
  let sortOption = { createdAt : -1 }; // Default: Sort by updatedAt Descending

  if (sortBy) {
    const validSortFields = ['startTime', 'endTime',  'updatedAt', 'createdAt'];

    if (validSortFields.includes(sortBy)) {
      sortOption[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      return res.status(400).json({
        message: 'Invalid sort field. Use valid fields like startTime, endTime, title, priority, or status.'
      });
    }
  } else {
    // Default sort option
    sortOption = { createdAt : -1 }; // Default to endTime descending
  }



      // ✅ Pagination Logic
      const skip = (page - 1) * limit;

      // ✅ Fetch Data from the Database
  // const users_tasks = await User.find(tasks)

      const tasks = await Task.find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(limit);

      // ✅ Get Total Count for Pagination
      const totalTasks = await Task.countDocuments(filter);
console.log("filtered tasks: " + tasks)
        // const totalTasks = tasks.length;
      // ✅ Response
    return res.status(200).json({
          tasks,
          totalTasks,
          currentPage: Number(page),
          totalPages: Number(Math.ceil(totalTasks /limit)),
      });

  } catch (err) {
      console.error(err.message);
     return res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};



exports.updateTask = async (req, res) => {
    try {
      const taskId = req.params.id;
      const  updatedData  = req.body;
      const { status } = req.body; // New status from request body
 // Ensure we have the logged-in user's ID
 const userId = req.user.id;  // Assuming `req.user` is set by your authentication middleware
console.log("userId in get Stats", userId)
      // Fetch the task by ID
      // const task = await Task.findById(taskId);
       // Fetch the task by ID and ensure it belongs to the logged-in user
       const task = await Task.findOne({ _id: taskId, userId: userId }); // Match task with userId

      if (!task) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }
  
      // Check if `updatedData` exists and is an object
      if (!updatedData || typeof updatedData !== "object") {
        return res.status(400).json({ success: false, message: "Invalid updatedData" });
      }
  
      // Apply updates to allowed fields
      const allowedFields = ["status", "priority", "title", "startTime", "endTime"];
      for (const field in updatedData) {
        if (updatedData.hasOwnProperty(field) && allowedFields.includes(field)) {
          task[field] = updatedData[field];
        }
      }
  
      // Automatically update `endTime` if status is 'finished'
      if (task.status === "finished") {
        task.endTime = new Date();
      }
  
      // Save the updated task
      await task.save();
  
      // Fetch the updated task (No need for .populate on non-referenced fields)
      const finalUpdatedTask = await Task.findById(taskId);
  
      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data:  {
          taskId: finalUpdatedTask._id,
          title: finalUpdatedTask.title,
          status: finalUpdatedTask.status,
          priority: finalUpdatedTask.priority,
          startTime: finalUpdatedTask.startTime,
          endTime: finalUpdatedTask.endTime
      },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Failed to update task",
        error: err.message,
      });
    }
  };
  

  
exports.deleteTask = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming `req.user` is set by your authentication middleware
    const taskId = req.params.id
    console.log("taskId BE del...: " + taskId)
    // Find and delete the task for the logged-in user
    const task = await Task.findOneAndDelete({ _id: taskId, userId: userId });
    console.log("deleted task" , task)
    if (!task) {
      return res.status(404).json({ message: 'Task not found or you do not have permission to delete this task' });
    }
    return res.json({ task ,message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
};
//DASHBOARD 

///-----good
exports.getDashboardStats = async (req, res) => {
  try {
      const userId = req.user.id;  // Assuming `req.user` is set by your authentication middleware
      const tasks = await Task.find({userId}); // Fetch all tasks

      const completedTasks = tasks.filter(task => task.status === 'finished');
      const pendingTasks = tasks.filter(task => task.status === 'pending');
``
      // Dashboard Summary Stats
      const totalTasks = tasks.length;
      const completedPercentage = (completedTasks.length / totalTasks) * 100 || 0;
      const pendingPercentage = 100 - completedPercentage;

      const averageCompletionTime = completedTasks.reduce((sum, task) => {
          return sum + (new Date(task.endTime) - new Date(task.startTime));
      }, 0) / (completedTasks.length || 1);

      // Pending Task Summary Table
      const priorities = [1, 2, 3, 4, 5]; // Predefined priorities (1–5)
      const pendingSummary = priorities.map(priority => {
          const tasksByPriority = pendingTasks.filter(task => task.priority === priority);

          const timeLapsed = tasksByPriority.reduce((sum, task) => {
              return sum + ((new Date() - new Date(task.startTime)) / 3600000); // in hours
          }, 0);

          const timeToFinish = tasksByPriority.reduce((sum, task) => {
              return sum + ((new Date(task.endTime) - new Date()) / 3600000); // in hours
          }, 0);

          return {
              priority,
              pendingTasks: tasksByPriority.length,
              timeLapsed: parseFloat(timeLapsed.toFixed(2)),
              timeToFinish: parseFloat(timeToFinish.toFixed(2))
          };
      });
      // pending task summary
      const totalPendingTasks = pendingSummary.reduce((total, priorityData) => total + priorityData.pendingTasks, 0);
      const totalTimeLapsed = pendingSummary.reduce((total, priorityData) => total + priorityData.timeLapsed, 0).toFixed(2);
      const totalTimeToFinish = pendingSummary.reduce((total, priorityData) => total + priorityData.timeToFinish, 0).toFixed(2);
      
      res.status(200).json({
          totalTasks,
          completedPercentage,
          pendingPercentage,
          averageCompletionTime: averageCompletionTime / 3600000, // in hours
          pendingSummary ,// Table data
          totalPendingTasks,
          totalTimeLapsed,
          totalTimeToFinish
      });
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};


// Get all tasks for dashboard with detailed stats

// TASK-LISTS
exports.getAllTasksForDashboard = async (req, res) => {
    try {
        const tasks = await Task.find();

        const detailedTasks = tasks.map(task => {
            const currentTime = new Date();
            let timeLapsed = 0;
            let balanceTime = 0;

            if (task.status === 'Pending') {
                timeLapsed = currentTime > task.startTime ? (currentTime - task.startTime) / 3600000 : 0;
                balanceTime = currentTime < task.endTime ? (task.endTime - currentTime) / 3600000 : 0;
            } else if (task.status === 'Finished') {
                timeLapsed = (task.endTime - task.startTime) / 3600000;
            }

            return {
                ...task.toObject(),
                timeLapsed: timeLapsed.toFixed(2),
                balanceTime: balanceTime.toFixed(2)
            };
        });

        res.status(200).json(detailedTasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};