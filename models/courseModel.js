const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    teacher: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users'
    },
    students: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users' 
    }],
    assignments: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Assignment' 
    }]
}, { timestamps: true });

let Course = mongoose.model('Course', courseSchema);
module.exports = Course