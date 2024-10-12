const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users', 
         
    },
    course: { type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    grade: { 
        type: String, 
        required: true 
    },
    assignmentGrades: [{  
        assignmentId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Assignment' 
        },
        grade: { 
            type: String 
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Grade', gradeSchema);
