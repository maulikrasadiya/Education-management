const express = require('express');
const route = express();
const controller = require('../controllers/adminController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

route.use(authenticateUser);
route.use(authorizeRoles(['admin']));

route.post('/courses', controller.createCourse);
route.put('/courses/:courseId', controller.updateCourse);
route.delete('/courses/:courseId', controller.deleteCourse);
route.get('/courses', controller.getCourses);
route.post('/courses/:courseId/enroll', controller.enrollStudent);
route.delete('/courses/:courseId/unenroll', controller.unenrollStudent);

module.exports = route;
