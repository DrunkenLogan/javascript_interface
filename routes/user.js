/*************************************************************
 * USER Routes
 *************************************************************/

/*********** Dependencies ************/
const userControllers = require('../controllers/user')

// Instantiate the user handlers Object
const userRoutes = {};

// Create a User
// Required Fields: email, password, name, surname
//@TODO Implement session validation
userRoutes.signup = (reqData, callback) => userControllers.create(reqData, callback);

// Get User Data
// Required Fields: email, tokenId
userRoutes.profile = (reqData, callback) => userControllers.read(reqData, callback);

// Update User Data
// Required Fields:
userRoutes.update = (reqData, callback) => userControllers.update(reqData, callback);

// Delete User Data
// Required Fields:
userRoutes.delete = (reqData, callback) => userControllers.delete(reqData, callback);

// If the user is authenticated
userRoutes.verifyToken = (reqData, callback) => {
    if (reqData.user) callback(200);
    else callback(401)
}

module.exports = userRoutes;