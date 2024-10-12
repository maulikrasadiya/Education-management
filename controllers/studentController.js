const Enrollment = require('../models/enrollmentModel');
const Course = require('../models/courseModel');
const Assignment = require('../models/assignmentModel');

let enrollInCourse = async (req, res) => {
    try {
        const studentId = req.user.id; 
        const courseId = req.params.courseId; 

        const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
        if (existingEnrollment) {
            return res.status(400).json({ message: "Student is already enrolled in this course." });
        }

        const enrollment = new Enrollment({ student: studentId, course: courseId });
        await enrollment.save();

        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $addToSet: { students: studentId } },
            { new: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ message: "Course not found." });
        }

        res.status(201).json({ message: "Enrolled successfully", enrollment, course: updatedCourse });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

let getCourses = async (req, res) => {
    try {
        const studentId = req.user.id;

        const courses = await Enrollment.find({ student: studentId }).populate('course', 'title description');
        if (!courses.length) {
            return res.status(404).json({ message: 'No courses found for the student.' });
        }

        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching courses', message: err.message });
    }
};

let viewGrades = async (req, res) => {
    try {
        const studentId = req.user.id;

        const grades = await Enrollment.find({ student: studentId, grade: { $exists: true } })
            .populate('course', 'title')
            .select('course grade');

        if (!grades.length) {
            return res.status(404).json({ message: 'No grades found for the student.' });
        }

        res.status(200).json(grades);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching grades', message: err.message });
    }
};

const getStudentAssignments = async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.id;

    try {
        const isEnrolled = await Enrollment.findOne({ student: studentId, course: courseId });
        if (!isEnrolled) {
            return res.status(403).json({ message: 'You are not enrolled in this course.' });
        }

        const assignments = await Assignment.find({ courseId });

        if (!assignments.length) {
            return res.status(404).json({ message: 'No assignments found for this course.' });
        }

        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignments', error: error.message });
    }
};

const submitAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    const { fileUrl } = req.body;

    try {
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const isEnrolled = await Enrollment.findOne({
            student: req.user.id,
            course: assignment.courseId
        });
        if (!isEnrolled) {
            return res.status(403).json({ message: 'You are not enrolled in this course' });
        }

        assignment.submissions.push({
            studentId: req.user.id,
            fileUrl,
            submissionDate: new Date()
        });

        await assignment.save();
        res.status(200).json({ message: 'Assignment submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting assignment', error: error.message });
    }
};

module.exports = {
    enrollInCourse,
    getCourses,
    viewGrades,
    submitAssignment,
    getStudentAssignments
};
