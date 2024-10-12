const Course = require('../models/courseModel');
const Enrollment = require('../models/enrollmentModel');
const Assignment = require('../models/assignmentModel');

const updateCourseContent = async (req, res) => {
    const { courseId } = req.params;
    const { title, description, topics } = req.body;
    if (!title && !description && !topics) {
        return res.status(400).json({ message: 'At least one field must be provided for update.' });
    }
    try {
        const course = await Course.findByIdAndUpdate(courseId, { title, description, topics }, { new: true });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error updating course content', error: error.message });
    }
};

const assignGrade = async (req, res) => {
    try {
        const { studentId, grade } = req.body;
        if (!grade || (typeof grade !== 'number' && !Array.isArray(grade))) {
            return res.status(400).json({ message: "Invalid or missing grade." });
        }
        const gradesArray = Array.isArray(grade) ? grade : [grade];
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }
        if (!Array.isArray(student.grades)) {
            student.grades = [];
        }
        const submissionExists = await Assignment.findOne({ "submissions.studentId": studentId });
        if (!submissionExists) {
            return res.status(404).json({ message: "No submitted assignments found for this student." });
        }
        student.grades.push(...gradesArray);
        await student.save();
        res.status(200).json({ message: "Grades updated successfully.", grades: student.grades });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getCourseAnalytics = async (req, res) => {
    const { courseId } = req.params;
    try {
        const analytics = await Enrollment.aggregate([
            { $match: { course: courseId } },
            {
                $group: {
                    _id: "$course",
                    averageGrade: { $avg: "$assignments.grade" },
                    totalStudents: { $sum: 1 },
                    studentsPassed: { $sum: { $cond: [{ $gte: [{ $avg: "$assignments.grade" }, 50] }, 1, 0] } },
                    studentsFailed: { $sum: { $cond: [{ $lt: [{ $avg: "$assignments.grade" }, 50] }, 1, 0] } },
                    highestGrade: { $max: "$assignments.grade" },
                    lowestGrade: { $min: "$assignments.grade" },
                    gradeDistribution: { $push: "$assignments.grade" }
                }
            }
        ]);
        if (analytics.length === 0) {
            return res.status(404).json({ message: 'No analytics found for this course' });
        }
        res.status(200).json({
            courseId,
            averageGrade: analytics[0].averageGrade,
            totalStudents: analytics[0].totalStudents,
            studentsPassed: analytics[0].studentsPassed,
            studentsFailed: analytics[0].studentsFailed,
            highestGrade: analytics[0].highestGrade,
            lowestGrade: analytics[0].lowestGrade,
            gradeDistribution: analytics[0].gradeDistribution
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course analytics', error: error.message });
    }
};

const createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        const { courseId } = req.params;
        const teacherId = req.user.id;
        if (!title || !courseId || !dueDate) {
            return res.status(400).json({ message: 'Title, courseId, and dueDate are required.' });
        }
        const assignment = new Assignment({ title, description, courseId, dueDate, teacherId });
        await assignment.save();
        await Course.findByIdAndUpdate(courseId, { $push: { assignments: assignment._id } });
        await Enrollment.updateMany(
            { course: courseId },
            { $push: { assignments: { assignmentId: assignment._id, submitted: false } } }
        );
        res.status(201).json({ message: "Assignment created and added to enrollments", assignment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const teacherId = req.user.id;
        const assignment = await Assignment.findOne({ _id: assignmentId, teacherId });
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found or not authorized.' });
        }
        const updatedAssignment = await Assignment.findByIdAndUpdate(assignmentId, req.body, { new: true });
        if (!updatedAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        await Enrollment.updateMany(
            { course: updatedAssignment.courseId, 'assignments.assignmentId': assignmentId },
            { $set: { 'assignments.$.title': updatedAssignment.title, 'assignments.$.dueDate': updatedAssignment.dueDate } }
        );
        res.status(200).json(updatedAssignment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const teacherId = req.user.id;
        const assignment = await Assignment.findOne({ _id: assignmentId, teacherId });
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found or not authorized.' });
        }
        const deletedAssignment = await Assignment.findByIdAndDelete(assignmentId);
        if (!deletedAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        await Course.findByIdAndUpdate(deletedAssignment.courseId, { $pull: { assignments: assignmentId } });
        await Enrollment.updateMany(
            { course: deletedAssignment.courseId },
            { $pull: { assignments: { assignmentId } } }
        );
        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const gradeAssignment = async (req, res) => {
    try {
        const { assignmentId, studentId, grade } = req.body;
        const teacherId = req.user.id;
        const assignment = await Assignment.findOne({ _id: assignmentId, teacherId });
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found or not authorized.' });
        }
        const submission = assignment.submissions.find(sub => sub.studentId.toString() === studentId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        submission.grade = grade;
        await assignment.save();
        await Enrollment.updateOne(
            { student: studentId, course: assignment.courseId, 'assignments.assignmentId': assignmentId },
            { $set: { 'assignments.$.grade': grade } }
        );
        res.status(200).json({ message: 'Grade assigned successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    updateCourseContent,
    assignGrade,
    getCourseAnalytics,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    gradeAssignment
};
