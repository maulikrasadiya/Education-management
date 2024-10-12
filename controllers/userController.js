    let User = require('../models/userModel');
    let bcrypt = require('bcrypt');
    let jwt = require('jsonwebtoken');
    require('dotenv').config();

    const JWT_SECRET = process.env.JWT_SECRET ;

    let defaults = (req,res) =>{
        res.send('Hello World');
    }
    let register = async (req,res) =>{
        let {name , email , password , role} = req.body;
        if(!name || !email || !password){
        return res.status(400).json({message : "required Name , Email and Passorwd"})
        }
        try {
            let hashedPassword = await bcrypt.hash(password , 10)
            let userdata =  new User({
                name ,
                email ,
                password  :hashedPassword,
                role : !role ? "student" : role 
            })
            userdata.save()
            res.json({message : "User create successfully"})
        } catch (error) {
            return res.status(500).json({message : "Server error" , error : error.message})
        }
    }
    let login = async (req,res) =>{
        let {email , password} = req.body;
        try {
            let user = await User.findOne({email});
            if(!user){
                return res.status(400).json({message : "User not found"})
            }

            let isMatch =  await bcrypt.compare(password , user.password);
            if(isMatch)
            {
                const token = jwt.sign({ id: user._id, name: user.name, email: user.email , role: user.role}, JWT_SECRET, { expiresIn: '1h' });
                
                res.cookie('token', token, { httpOnly: true, secure: true });
                return res.json({ message: "User successfully logged in", token: token });
            }else {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

        } catch (error) {
            return res.status(500).json({message : "Server error" , error : error.message})
        }
    }
    let logout = (req,res) =>{
        res.clearCookie('token');
        res.json({message : "User logged out successfully"})

    }
    const checkRole = (roles) => (req, res, next) => {
        const userRole = req.user.role; 
        if (roles.includes(userRole)) {
            next();
        } else {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
    };

    module.exports = {
        defaults ,
        register ,
        login ,
        logout ,
        checkRole
    }