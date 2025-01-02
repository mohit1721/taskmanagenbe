const express = require('express');
const { createTask, getTasks,getDashboardStats, updateTask, deleteTask } = require('../controllers/taskController');
const authenticate = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authenticate);

router.post('/create-task',authenticate, createTask);
// router.get('/task/:id', getTaskById);
router.put('/task/:id', authenticate,updateTask);
router.delete('/task/:id',authenticate, deleteTask);

// router.put("/task/status/:id",taskStatus);


//tasklists
router.get('/tasklists',authenticate, getTasks);


// Dashboard Stats
router.get('/dashboard/stats',authenticate, getDashboardStats);

//task-lists

// router.get('/dashboard/tasks', getAllTasksForDashboard);

module.exports = router;