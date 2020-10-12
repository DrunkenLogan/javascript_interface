/*************************************************************
 * USER Routes
 *************************************************************/

/*********** Dependencies ************/
const userControllers = require('../controllers/user')

// Instantiate the user handlers Object
const userRoutes = {};

// Create a User
userRoutes.signup = (reqData, callback) => userControllers.create(reqData, callback);

// Get User Data
userRoutes.profile = (reqData, callback) => userControllers.read(reqData, callback);

// Update User Data
userRoutes.update = (reqData, callback) => userControllers.update(reqData, callback);

// Delete User Data
userRoutes.delete = (reqData, callback) => userControllers.delete(reqData, callback);

// If the user is authenticated
userRoutes.verifyToken = (reqData, callback) => {
    if (reqData.user) callback(200);
    else callback(401)
}

module.exports = userRoutes;