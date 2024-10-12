const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users', 
        required: true  
    },  
    course: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['enrolled', 'completed', 'withdrawn'], 
        default: 'enrolled' 
    },
    assignments: [{
        assignmentId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Assignment' 
        },   
        submitted: { 
            type: Boolean, 
            default: false 
        },
        submissionDate: { 
            type: Date 
        },
        grade: { 
            type: String 
        }
    }]
}, { timestamps: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
