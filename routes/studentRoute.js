const express = require('express');
const route = express.Router();
const controller = require('../controllers/studentController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

route.use(authenticateUser);
route.use(authorizeRoles(['student']));

route.get('/courses', controller.getCourses);
route.post('/courses/:courseId/enroll', controller.enrollInCourse);
route.get('/grades', controller.viewGrades);
route.get('/courses/:courseId/assignments', controller.getStudentAssignments);
route.post('/assignments/:assignmentId/submit', controller.submitAssignment);

module.exports = route;
