const Course = require('../models/courseModel');
const Enrollment = require('../models/enrollmentModel');
const User = require('../models/userModel');

let createCourse = async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

let getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('teacher', 'name');
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

let updateCourse = async (req, res) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });
        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found.' });
        }
        res.status(200).json(updatedCourse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

let deleteCourse = async (req, res) => {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.courseId);
        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found.' });
        }
        res.status(200).json({ message: 'Course deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

let enrollStudent = async (req, res) => {
    try {
        const { studentIds } = req.body;
        const courseId = req.params.courseId;

        const idsToEnroll = Array.isArray(studentIds) ? studentIds : [studentIds];
        const results = [];
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        for (const studentId of idsToEnroll) {
            const student = await User.findById(studentId);
            if (!student || student.role !== 'student') {
                results.push({ studentId, message: 'Student not found or not a student role.' });
                continue;
            }

            const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
            if (existingEnrollment) {
                results.push({ studentId, message: 'Student is already enrolled in this course.' });
                continue;
            }

            const enrollment = new Enrollment({ student: studentId, course: courseId });
            await enrollment.save();

            if (!course.students.includes(studentId)) {
                course.students.push(studentId);
            }
            results.push({ studentId, message: 'Enrollment successful.', enrollment });
        }

        await course.save();
        res.status(201).json({ results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

let unenrollStudent = async (req, res) => {
    try {
        const { studentId } = req.body;
        const courseId = req.params.courseId;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        if (!course.students.includes(studentId)) {
            return res.status(404).json({ message: 'Student is not enrolled in this course.' });
        }

        course.students = course.students.filter(id => id.toString() !== studentId);
        await course.save();
        await Enrollment.findOneAndDelete({ student: studentId, course: courseId });

        res.status(200).json({ message: 'Student unenrolled successfully from the course.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createCourse,
    getCourses,
    updateCourse,
    deleteCourse,
    enrollStudent,
    unenrollStudent
};
