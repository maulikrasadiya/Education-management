const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    submissions: [
        {
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
            fileUrl: { type: String },
            submittedAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;
