let mongoose = require('mongoose');

let UserSchema = new  mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        require : true,
        unique : true
    },
    password : {
        type : String,
        require : true
    },
    role : {
        type : String,
        enum : ["teacher" , "student" , "admin"],
        default : "student"
    }
})

let User = mongoose.model('User', UserSchema);
module.exports  = User;
