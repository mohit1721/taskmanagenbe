const Joi = require('joi');

const taskValidator = Joi.object({
    title: Joi.string().min(3).required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    priority: Joi.number().integer().min(1).max(5).required(),
    status: Joi.string().valid('Pending', 'Finished')
});

module.exports = { taskValidator };
