/*************************************************************
 * USER Controllers
 *************************************************************/

/*********** Dependencies ************/
const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const config = require('../lib/config');
const sessionControllers = require('./session');

// Instantiate the user handlers Object
const userControllers = {};

// Create a User
// Required Fields: email, password, name, surname
//@TODO Implement session validation
userControllers.create = (reqData, callback) => {
    // Check the required fields is provided and correct
    const email = helpers.validateEmail(reqData.payload.email) ?
        reqData.payload.email :
        false;
    const name =
        typeof reqData.payload.name === 'string' && reqData.payload.name.length > 0 ?
            reqData.payload.name :
            false;
    const surname =
        typeof reqData.payload.surname === 'string' &&
            reqData.payload.surname.length > 0 ?
            reqData.payload.surname :
            false;
    const passw = helpers.validatePassword(reqData.payload.password) ?
        reqData.payload.password :
        false;

    if (email && name && surname && passw) {
        // Check if a user with provided email exist
        _data.read('users', email, (err, data) => {
            if (err) {
                // Hash the password
                const hashedPassword = helpers.hash(passw);
                // Form the user Object
                const user = {
                    email: email,
                    password: hashedPassword,
                    name: name,
                    surname: surname
                };
                // Stringify the data
                const userString = JSON.stringify(user);
                // Create the user
                _data.create('users', email, userString, err => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, config.errors._500);
                    }
                });
            } else {
                callback(400, config.errors._400);
            }
        });
    } else {
        callback(400, config.errors._400);
    }
};

// Get User Data
// Required Fields: email, tokenId
userControllers.read = (reqData, callback) => {
    // Check that required field are provided and valid
    const email = helpers.validateEmail(reqData.searchParam.get('email')) ?
        reqData.searchParam.get('email') :
        false;
    const tokenId =
        typeof reqData.headers.token === 'string' &&
            reqData.headers.token.length === 20 ?
            reqData.headers.token :
            false;

    if (email && tokenId) {
        // Lookup the token and check if it is valid for the given user
        if (reqData.user) {
            // Check that a the user exist
            _data.read('users', email, (err, data) => {
                if (!err && data) {
                    // delete the password
                    delete data.password;
                    callback(200, data);
                } else {
                    callback(404, config.errors._404);
                }
            });
        } else {
            callback(403, config.errors._403);
        }
    } else {
        callback(400, config.errors._400);
    }
};

// Update User Data
// Required Fields:
userControllers.update = (reqData, callback) => { };

// Delete User Data
// Required Fields:
userControllers.delete = (reqData, callback) => { };

module.exports = userControllers;