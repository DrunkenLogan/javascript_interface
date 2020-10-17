/*************************************************************
 * USER Controllers
 *************************************************************/

/*********** Dependencies ************/
const _data = require('../lib/data');
const helpers = require('../util/helpers');
const config = require('../config');
const UserSchema = require('../models/userSchema');
const myLogger = require('../util/logger');

// Instantiate the user handlers Object
const userControllers = {};

// Create a User
// Required Fields: email, password, name, surname
userControllers.create = (reqData, callback) => {
    // Only accept POST request
    if (reqData.method === 'post') {
        // Check the required fields is provided and correct
        const userModel = new UserSchema({email, name, surname, password} = reqData.payload);

        if (userModel.email && userModel.name && userModel.surname && userModel.password) {
            userModel.register((errStatusCode,errMessage)=>{
                if(!errStatusCode) callback(200);
                else callback(errStatusCode,errMessage);
            });
        } else {
            callback(400, config.errors._400);
            myLogger('error',
                `User registration failed. 
                headers: ${JSON.stringify(reqData.headers)}
                payload: ${JSON.stringify(reqData.payload)}`
            );
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
            const email = reqData.user.email;
            const name = reqData.payload.name;
            const surname = reqData.payload.surname;
            const userModel = new UserSchema({email, name, surname});

            if (userModel.name || userModel.surname) {
                userModel.update((errStatusCode,errMessage)=>{
                    if(!errStatusCode) callback(200);
                    else callback(errStatusCode,errMessage);
                })
            } else {
                callback(400, config.errors._400);
            }
        } else {
            callback(401, config.errors._401);
            myLogger('error',
                `User update failed. 
                headers: ${JSON.stringify(reqData.headers)}
                payload: ${JSON.stringify(reqData.payload)}
                user: ${JSON.stringify(reqData.user)}`
            );
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
            myLogger('error',
                `User deletion failed. 
                headers: ${JSON.stringify(reqData.headers)}
                payload: ${JSON.stringify(reqData.payload)}
                user: ${JSON.stringify(reqData.user)}`
            );
        }
    } else {
        callback(405, config.errors._405);
    }
};

module.exports = userControllers;