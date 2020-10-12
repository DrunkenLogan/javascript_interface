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
userControllers.create = (reqData, callback) => {
    // Only accept POST request
    if (reqData.method === 'post') {
        // Check the required fields is provided and correct
        const email = helpers.validateEmail(reqData.payload.email) ?
            reqData.payload.email :
            false;
        const name = helpers.validateString(reqData.payload.name);
        const surname = helpers.validateString(reqData.payload.surname);
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
    } else {
        callback(405, config.errors._405);
    }
};

// Get User Data
// Required Fields: email, tokenId
userControllers.read = (reqData, callback) => {
    // Only accept GET request
    if (reqData.method === 'get') {
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
    } else {
        callback(405, config.errors._405);
    }
};

// Update User Data
// Required Fields: either name or surname
userControllers.update = (reqData, callback) => {
    // Only accept PUT request
    if (reqData.method === 'put') {
        // if the user is authenticated
        if (reqData.user) {
            // Check the required fields is provided and correct
            const name = helpers.validateString(reqData.payload.name);
            const surname = helpers.validateString(reqData.payload.surname);

            if (name || surname) {
                if (name) reqData.user.name = name;
                if (surname) reqData.user.surname = surname;

                const userString = JSON.stringify(reqData.user);
                _data.update('users', reqData.user.email, userString, (err) => {
                    if (!err) callback(200);
                    else callback(500, config.errors._500);
                })
            } else {
                callback(400, config.errors._400);
            }
        } else {
            callback(401, config.errors._401);
        }
    } else {
        callback(405, config.errors._405);
    }
};

// Delete User Data
// Required Fields: email
userControllers.delete = (reqData, callback) => {
    // Only accept DELETE request
    if (reqData.method === 'delete') {
        if (reqData.user) {
            const userEmail = reqData.user.email
            _data.delete('users', userEmail, (err) => {
                if (!err) callback(200);
                else callback(500, config.errors._500);
            })
        } else {
            callback(401, config.errors._401);
        }
    } else {
        callback(405, config.errors._405);
    }
};

module.exports = userControllers;