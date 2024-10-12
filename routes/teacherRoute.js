const express = require('express');
const route = express();
const controller = require('../controllers/teacherController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

route.use(authenticateUser);
route.use(authorizeRoles(['teacher', 'admin']));

route.put('/courses/:courseId/content', controller.updateCourseContent);
route.post('/courses/:courseId/grade', controller.assignGrade);
route.get('/courses/:courseId/analytics', controller.getCourseAnalytics);
route.post('/courses/:courseId/assignments', controller.createAssignment);  
route.put('/assignments/:assignmentId', controller.updateAssignment);
route.delete('/assignments/:assignmentId', controller.deleteAssignment);
route.post('/assignments/:assignmentId/grade', controller.gradeAssignment);

module.exports = route;
