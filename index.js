let express = require('express');
let app = express();
let PORT = process.env.PORT ||  5000 ;
let userRoute = require('./routes/userRoute');
let adminRoute = require('./routes/adminRoute');
let studentRoute = require('./routes/studentRoute');
let teacherRoute = require('./routes/teacherRoute');
let body_parser = require('body-parser');
let mongoose = require('./database/database');
let cookie_parser = require('cookie-parser');

app.use(body_parser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookie_parser());
app.use('/',userRoute);
app.use('/admin',adminRoute);
app.use('/student',studentRoute);
app.use('/teacher',teacherRoute);

app.listen(PORT, (req,res) =>{
    console.log(`Server is running on port ${PORT}`);
})





