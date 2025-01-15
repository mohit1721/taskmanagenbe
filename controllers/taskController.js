const Task = require('../models/Task');
const User = require('../models/User');
const { taskValidator } = require('../utils/validators');

exports.createTask = async (req, res) => {
  const token =  req.header('Authorization')?.replace("Bearer ", "") || req.cookies.token || req.body.token;
// console.log("token in createtask controller" , token)
  try {
    const { error } = taskValidator.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: error.details[0].message,
      });
    }
    const { startDate, endDate } = req.body;

    // Check if endDate is greater than startDate
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be greater than start date",
      });
    }
// console.log("req.user.id", req.user.id);
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
    // console.log("my new task-> from FE ",newTask)
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
 

//task list..363 ms
//fine..
// exports.getTasks = async (req, res) => {
//   performance.mark('start');

//   try {
//       const { 
//           status='all',       // Filter by task status
//           priority='all',     // Filter by priority
//           sortBy='endTime',       // Sorting field (e.g., title, start_time, end_time, priority, status)
//           order='desc',
//           page = 1,     // Default page
//           limit = 10   // Default limit
//       } = req.query;
// // ✅ Explicitly Set Default Value for sortBy if Undefined or Empty
// // const finalSortBy = sortBy && sortBy.trim() !== '' ? sortBy : 'endTime_desc';
// // console.log('Raw Query:', req.query);

// // console.log("my query from fe", status , priority,sortBy,order)
//  // Ensure we have the logged-in user's ID
//  const userId = req.user.id;  // Assuming `req.user` is set by your authentication middleware
// // console.log("userId in get Stats", userId)
//       // ✅ Build Query: Filtering Logic
//       let filter = {userId};
//       if (priority && priority !== 'all') filter.priority = Number(priority); // Filter by priority
//       if (status && status !== 'all') filter.status = status; // Filter by status (e.g., Pending, Finished)

//   // ✅ Sorting Logic
//   // let sortOption = {};
//   let sortOption = { createdAt : -1 }; // Default: Sort by updatedAt Descending

//   if (sortBy) {
//     const validSortFields = ['startTime', 'endTime',  'updatedAt', 'createdAt'];

//     if (validSortFields.includes(sortBy)) {
//       sortOption[sortBy] = order === 'desc' ? -1 : 1;
//     } else {
//       return res.status(400).json({
//         message: 'Invalid sort field. Use valid fields like startTime, endTime, title, priority, or status.'
//       });
//     }
//   } else {
//     // Default sort option
//     sortOption = { createdAt : -1 }; // Default to endTime descending
//   }



//       // ✅ Pagination Logic
//       const skip = (page - 1) * limit;


//       const tasks = await Task.find(filter)
//           .sort(sortOption)
//           .skip(skip)
//           .limit(limit);

//       // ✅ Get Total Count for Pagination
//       const totalTasks = await Task.countDocuments(filter);
// // console.log("filtered tasks: " + tasks)
//         // const totalTasks = tasks.length;
//       // ✅ Response
//       performance.mark('end');
// performance.measure('Execution Time', 'start', 'end');

// const measure = performance.getEntriesByName('Execution Time')[0];
// console.log(`Execution Time: ${measure.duration.toFixed(3)} ms`);
//     return res.status(200).json({
//           tasks,
//           totalTasks,
//           currentPage: Number(page),
//           totalPages: Number(Math.ceil(totalTasks /limit)),
//       });

//   } catch (err) {
//       console.error(err.message);
//      return res.status(500).json({ message: 'Failed to fetch tasks' });
//   }
// };

// optimised version..140 ms
exports.getTasks = async (req, res) => {
  performance.mark('start');

  try {
    const { 
      status = 'all',       // Default: Fetch all statuses
      priority = 'all',     // Default: Fetch all priorities
      sortBy = 'endTime',   // Default: Sort by endTime
      order = 'desc',       // Default: Descending order
      page = 1,            // Default: First page
      limit = 10           // Default: 10 tasks per page
    } = req.query;

    const userId = req.user.id; // Ensure user is authenticated

    // ✅ Build Query Filter
    const filter = { userId };
    if (priority !== 'all') filter.priority = Number(priority);
    if (status !== 'all') filter.status = status;

    // ✅ Validate and Build Sorting Logic
    const validSortFields = ['startTime', 'endTime', 'updatedAt', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'endTime';
    const sortOption = { [sortField]: order === 'desc' ? -1 : 1 };

    // ✅ Pagination Logic
    const skip = (Number(page) - 1) * Number(limit);

    // ✅ Fetch Data and Count in Parallel for Efficiency
    const [tasks, totalTasks] = await Promise.all([
      Task.find(filter).sort(sortOption).skip(skip).limit(Number(limit)),
      Task.countDocuments(filter)
    ]);
    performance.mark('end');
    performance.measure('Execution Time', 'start', 'end');
    
    const measure = performance.getEntriesByName('Execution Time')[0];
    // console.log(`Execution Time: ${measure.duration.toFixed(3)} ms`);
    // ✅ Response
    return res.status(200).json({
      success: true,
      tasks,
      totalTasks,
      currentPage: Number(page),
      totalPages: Math.ceil(totalTasks / Number(limit)),
    });

  } catch (err) {
    console.error('Error in getTasks:', err.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch tasks' 
    });
  }
};

//424 ms
// exports.updateTask = async (req, res) => {
//   performance.mark('start');

//     try {
//       const taskId = req.params.id;
//       const  updatedData  = req.body;
      
//  // Ensure we have the logged-in user's ID
//  const userId = req.user.id;  // Assuming `req.user` is set by your authentication middleware
// // console.log("userId in get Stats", userId)
//       // Fetch the task by ID
//       // const task = await Task.findById(taskId);
//        // Fetch the task by ID and ensure it belongs to the logged-in user
//        const task = await Task.findOne({ _id: taskId, userId: userId }); // Match task with userId

//       if (!task) {
//         return res.status(404).json({ success: false, message: "Task not found" });
//       }
  
//       // Check if `updatedData` exists and is an object
//       if (!updatedData || typeof updatedData !== "object") {
//         return res.status(400).json({ success: false, message: "Invalid updatedData" });
//       }
  
//       // Apply updates to allowed fields
//       const allowedFields = ["status", "priority", "title", "startTime", "endTime"];
//       for (const field in updatedData) {
//         if (updatedData.hasOwnProperty(field) && allowedFields.includes(field)) {
//           task[field] = updatedData[field];
//         }
//       }
  
//       // Automatically update `endTime` if status is 'finished'
//       if (task.status === "finished") {
//         task.endTime = new Date();
//       }
  
//       // Save the updated task
//       await task.save();
  
//       // Fetch the updated task (No need for .populate on non-referenced fields)
//       const finalUpdatedTask = await Task.findById(taskId);
//       performance.mark('end');
//       performance.measure('Execution Time', 'start', 'end');
      
//       const measure = performance.getEntriesByName('Execution Time')[0];
//       console.log(`Execution Time: ${measure.duration.toFixed(3)} ms`);
//       res.status(200).json({
//         success: true,
//         message: "Task updated successfully",
//         data:  {
//           taskId: finalUpdatedTask._id,
//           title: finalUpdatedTask.title,
//           status: finalUpdatedTask.status,
//           priority: finalUpdatedTask.priority,
//           startTime: finalUpdatedTask.startTime,
//           endTime: finalUpdatedTask.endTime
//       },
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({
//         success: false,
//         message: "Failed to update task",
//         error: err.message,
//       });
//     }
//   };
  // optimised version-- 254 ms
  exports.updateTask = async (req, res) => {
    performance.mark('start');

    try {
      const taskId = req.params.id;
      const updatedData = req.body;
      
      const userId = req.user.id; // Get the logged-in user's ID
  
      // Validate that updatedData is an object
      if (!updatedData || typeof updatedData !== "object") {
        return res.status(400).json({ success: false, message: "Invalid updatedData" });
      }
  
      // Fetch the task by ID and ensure it belongs to the logged-in user
      const task = await Task.findOne({ _id: taskId, userId: userId });
      
      if (!task) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }
  
      // Prepare the fields to update
      const allowedFields = ["status", "priority", "title", "startTime", "endTime"];
      const updatePayload = {};
  
      // Add only allowed fields to the update payload
      for (const field in updatedData) {
        if (allowedFields.includes(field)) {
          updatePayload[field] = updatedData[field];
        }
      }
  
      // Automatically set `endTime` if the status is 'finished'
      if (updatePayload.status === "finished") {
        updatePayload.endTime = new Date(); // Auto-set endTime when status is 'finished'
      }
  
      // Update the task in the database
      const updatedTask = await Task.findByIdAndUpdate(taskId, { $set: updatePayload }, { new: true });
  
      if (!updatedTask) {
        return res.status(500).json({ success: false, message: "Failed to update task" });
      }
      performance.mark('end');
      performance.measure('Execution Time', 'start', 'end');
      
      const measure = performance.getEntriesByName('Execution Time')[0];
      // console.log(`Execution Time: ${measure.duration.toFixed(3)} ms`);
      // Return the updated task details
      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: {
          taskId: updatedTask._id,
          title: updatedTask.title,
          status: updatedTask.status,
          priority: updatedTask.priority,
          startTime: updatedTask.startTime,
          endTime: updatedTask.endTime
        }
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
  

  // good in be
  
exports.deleteTask = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming `req.user` is set by your authentication middleware
    const taskId = req.params.id;
    // console.log("taskId BE del...: " + taskId)
    // console.log("UserId BE del:", userId);
    // Find and delete the task for the logged-in user
    
     // Ensure userId is cast to ObjectId
     const task = await Task.findOne({
      _id: taskId,
      userId: userId
    });

    await Task.deleteOne({ _id: taskId});
    // console.log("deleted task be" , task)
    if (!task) {
      return res.status(404).json({  success: false,
         message: 'Task not found or you do not have permission to delete this task' });
    }
    return res.status(200).json({
      success : true,
      deletedTask :task,
      message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({     
       success: false, 
      message: 'Failed to delete task' });
  }
};

//DASHBOARD 

///-----good
// 2939.033 ms
// exports.getDashboardStats = async (req, res) => {
//   performance.mark('start');

//   try {
//       const userId = req.user.id;  // Assuming `req.user` is set by your authentication middleware
//       const tasks = await Task.find({userId}); // Fetch all tasks

//       const completedTasks = tasks.filter(task => task.status === 'finished');
//       const pendingTasks = tasks.filter(task => task.status === 'pending');
// ``
//       // Dashboard Summary Stats
//       const totalTasks = tasks.length;
//       const completedPercentage = (completedTasks.length / totalTasks) * 100 || 0;
// const pendingPercentage = totalTasks > 0 ? (100 - completedPercentage ) : 0;
// 
//       const averageCompletionTime = completedTasks.reduce((sum, task) => {
//           return sum + (new Date(task.endTime) - new Date(task.startTime));
//       }, 0) / (completedTasks.length || 1);

//       // Pending Task Summary Table
//       const priorities = [1, 2, 3, 4, 5]; // Predefined priorities (1–5)
//       const pendingSummary = priorities.map(priority => {
//           const tasksByPriority = pendingTasks.filter(task => task.priority === priority);

//           const timeLapsed = tasksByPriority.reduce((sum, task) => {
//               return sum + ((new Date() - new Date(task.startTime)) / 3600000); // in hours
//           }, 0);
// // yeh code calculate karega ki Task 1 aur Task 2 ke start time se lekar ab tak kitna time ho gaya hai in hours.
//           const timeToFinish = tasksByPriority.reduce((sum, task) => {
//               return sum + ((new Date(task.endTime) - new Date()) / 3600000); // in hours
//           }, 0);
//           // yeh code calculate karega ki Task 1 aur Task 2 ko complete hone mein kitna time bacha hai in hours./
//           return {
//               priority,
//               pendingTasks: tasksByPriority.length,
//               timeLapsed: parseFloat(timeLapsed.toFixed(2)),
//               timeToFinish: parseFloat(timeToFinish.toFixed(2))
//           };
//       });
//       // pending task summary
//       const totalPendingTasks = pendingSummary.reduce((total, priorityData) => total + priorityData.pendingTasks, 0);
//       const totalTimeLapsed = pendingSummary.reduce((total, priorityData) => total + priorityData.timeLapsed, 0).toFixed(2);
//       const totalTimeToFinish = pendingSummary.reduce((total, priorityData) => total + priorityData.timeToFinish, 0).toFixed(2);
      
//       performance.mark('end');
//       performance.measure('Execution Time', 'start', 'end');
      
//       const measure = performance.getEntriesByName('Execution Time')[0];
//       console.log(`Execution Time: ${measure.duration.toFixed(3)} ms`);
//       res.status(200).json({
//           totalTasks,
//           completedPercentage,
//           pendingPercentage,
//           averageCompletionTime: averageCompletionTime / 3600000, // in hours
//           pendingSummary ,// Table data
//           totalPendingTasks,
//           totalTimeLapsed,
//           totalTimeToFinish
//       });
//   } catch (err) {
//       res.status(500).json({ message: err.message });
//   }
// };


//optimised version // 150 ms
// exports.getDashboardStats = async (req, res) => {
//   performance.mark('start');

//   try {
//     const userId = req.user.id; // Assuming `req.user` is set by authentication middleware
    
//     // Fetch all tasks for the user
//     const tasks = await Task.find({ userId });

//     // Initialize Counters and Reducers
//     let completedCount = 0;
//     let pendingCount = 0;
//     let totalCompletionTime = 0;

//     const pendingSummary = [1, 2, 3, 4, 5].map(priority => ({
//       priority,
//       pendingTasks: 0,
//       timeLapsed: 0,
//       timeToFinish: 0,
//     }));

//     // Process Tasks in One Loop
//     tasks.forEach(task => {
//       if (task.status === 'finished') {
//         completedCount++;
//         totalCompletionTime += new Date(task.endTime) - new Date(task.startTime);
//       } else if (task.status === 'pending') {
//         pendingCount++;
//         const timeLapsed = (new Date() - new Date(task.startTime)) / 3600000; // in hours
//         const timeToFinish = (new Date(task.endTime) - new Date()) / 3600000; // in hours
        
//         // Update priority-based summary
//         const priorityIndex = task.priority - 1;
//         if (pendingSummary[priorityIndex]) {
//           pendingSummary[priorityIndex].pendingTasks++;
//           pendingSummary[priorityIndex].timeLapsed += timeLapsed;
//           pendingSummary[priorityIndex].timeToFinish += timeToFinish;
//         }
//       }
//     });

//     // Dashboard Stats Calculations
//     const totalTasks = tasks.length;
//     const completedPercentage = ((completedCount / totalTasks) * 100) || 0;
//     const pendingPercentage = totalTasks > 0 ? (100 - completedPercentage ) : 0;
//     const averageCompletionTime = (totalCompletionTime / (completedCount || 1)) / 3600000; // in hours

//     // Aggregate Pending Summary Totals
//     const totalPendingTasks = pendingSummary.reduce((sum, p) => sum + p.pendingTasks, 0);
//     const totalTimeLapsed = pendingSummary.reduce((sum, p) => sum + p.timeLapsed, 0).toFixed(2);
//     const totalTimeToFinish = pendingSummary.reduce((sum, p) => sum + p.timeToFinish, 0).toFixed(2);


//     performance.mark('end');
//     performance.measure('Execution Time', 'start', 'end');
    
//     const measure = performance.getEntriesByName('Execution Time')[0];
//     console.log(`Execution Time: ${measure.duration.toFixed(3)} ms`);
//     // Final Response
//     return res.status(200).json({
//       totalTasks,
//       completedPercentage,
//       pendingPercentage,
//       averageCompletionTime,
//       pendingSummary: pendingSummary.map(p => ({
//         ...p,
//         timeLapsed: parseFloat(p.timeLapsed.toFixed(2)),
//         timeToFinish: parseFloat(p.timeToFinish.toFixed(2)),
//       })),
//       totalPendingTasks,
//       totalTimeLapsed,
//       totalTimeToFinish,
//     });
//   } catch (err) {
//     console.error('Error in getDashboardStats:', err.message);
//     return res.status(500).json({
//       success: false,
//       message: err.message || 'Failed to fetch dashboard stats',
//     });
//   }
 
// };


// --
exports.getDashboardStats = async (req, res) => {
  performance.mark('start');

  try {
    const userId = req.user.id; // Assuming `req.user` is set by authentication middleware

    // Fetch all tasks for the user
    const tasks = await Task.find({ userId });

    // Initialize Counters and Reducers
    let completedCount = 0;
    let pendingCount = 0;
    let totalCompletionTime = 0;

    const pendingSummary = [1, 2, 3, 4, 5].map(priority => ({
      priority,
      pendingTasks: 0,
      timeLapsed: 0,
      timeToFinish: 0,
    }));

    // Process Tasks in One Loop
    tasks.forEach(task => {
      const startTime = new Date(task.startTime);
      const endTime = new Date(task.endTime);
      const now = new Date();

      if (task.status === 'finished') {
        completedCount++;
        totalCompletionTime += Math.max(0, endTime - startTime); // Ensure non-negative duration
      } else if (task.status === 'pending') {
        pendingCount++;
        // const timeLapsed = Math.max(0, (now - startTime) / 3600000); // Ensure non-negative lapsed time
       
          // Only calculate lapsed time if endTime >= startTime
          let timeLapsed = 0;
          if (endTime >= startTime) {
            timeLapsed = Math.max(0, (now - startTime) / 3600000); // Ensure non-negative lapsed time
          }
       
        const timeToFinish = Math.max(0, (endTime - now) / 3600000); // Ensure non-negative time to finish

        // Update priority-based summary
        const priorityIndex = task.priority - 1;
        if (pendingSummary[priorityIndex]) {
          pendingSummary[priorityIndex].pendingTasks++;
          pendingSummary[priorityIndex].timeLapsed += timeLapsed;
          pendingSummary[priorityIndex].timeToFinish += timeToFinish;
        }
      }
    });

    // Dashboard Stats Calculations
    const totalTasks = tasks.length;
    const completedPercentage = ((completedCount / totalTasks) * 100) || 0;
    const pendingPercentage = totalTasks > 0 ? (100 - completedPercentage) : 0;
    const averageCompletionTime = (totalCompletionTime / (completedCount || 1)) / 3600000; // in hours

    // Aggregate Pending Summary Totals
    const totalPendingTasks = pendingSummary.reduce((sum, p) => sum + p.pendingTasks, 0);
    const totalTimeLapsed = pendingSummary.reduce((sum, p) => sum + p.timeLapsed, 0).toFixed(2);
    const totalTimeToFinish = pendingSummary.reduce((sum, p) => sum + p.timeToFinish, 0).toFixed(2);

    performance.mark('end');
    performance.measure('Execution Time', 'start', 'end');

    const measure = performance.getEntriesByName('Execution Time')[0];
    // console.log(`Execution Time: ${measure.duration.toFixed(3)} ms`);

    // Final Response
    return res.status(200).json({
      totalTasks,
      completedPercentage,
      pendingPercentage,
      averageCompletionTime,
      pendingSummary: pendingSummary.map(p => ({
        ...p,
        timeLapsed: parseFloat(p.timeLapsed.toFixed(2)),
        timeToFinish: parseFloat(p.timeToFinish.toFixed(2)),
      })),
      totalPendingTasks,
      totalTimeLapsed,
      totalTimeToFinish,
    });
  } catch (err) {
    console.error('Error in getDashboardStats:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch dashboard stats',
    });
  }
};
