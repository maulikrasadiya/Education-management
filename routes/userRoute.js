let express = require('express');
let route = express();
let controller = require('../controllers/userController')

route.get('/',controller.defaults);
route.post('/register',controller.register);
route.post('/login',controller.login);
route.get('/logout',controller.logout);

module.exports = route