/*********** Dependencies ************/
const myLogger = require('../util/logger');
const _data = require('../lib/data');
const helpers = require('../util/helpers');
const config = require('../config');

class UserSchema {
    constructor(userData) {
        this.name = helpers.validateString(userData.name);
        this.surname = helpers.validateString(userData.surname);
        this.password = helpers.validatePassword(userData.password) ? userData.password : false;
        this.email = helpers.validateEmail(userData.email) ? userData.email : false;
    }

    getUserDetails = userId => {
        return new Promise(async (resolve, reject) => {
            try {
                const userData = await mongooseUserModel.findById(userId);
                if (userData) resolve(userData);
                else resolve(false)
            } catch (e) {
                myLogger(
                    'error',
                    `Could not run getUserDetils. 
                User id: ${userId}
                Error at: ${__filename}:20`
                );
    
                reject(e);
            }
        });
    };
    
    register = (callback) => {
        // Check if a user with provided email exist
        _data.read('users', this.email, (err, data) => {
            // if there is an error then a user with that email is not found
            // which means it doesn't exist
            if (err) {
                // Hash the password
                const hashedPassword = helpers.hash(this.password);
                // Form the user Object
                const user = {
                    email: this.email,
                    password: hashedPassword,
                    name: this.name,
                    surname: this.surname
                };
                // Stringify the data
                const userString = JSON.stringify(user);
                // Create the user
                _data.create('users', this.email, userString, err => {
                    if (!err) {
                        callback(false);
                    } else {
                        callback(500, config.errors._500);
                    }
                });
            } else {
                callback(400, config.errors._400);
            }
        });
    };
    
    update = (callback) => {
        _data.read('users', this.email,(err,userData)=>{
            if(!err && userData) {
                if (this.name) userData.name = this.name;
                if (this.surname) userData.surname = this.surname;
                _data.update('users', this.email, JSON.stringify(userData), (err) => {
                    console.log('update');
                    if (!err) callback(false);
                    else callback(500, config.errors._500);
                })
            } else {
                console.log('read');
                callback(500, config.errors._500);
            }
        })
    };
    
    delete = (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(id);
                const result = await UserModel.findByIdAndDelete(id);
                resolve(result)
            } catch (err) {
                myLogger(
                    'error',
                    `Could not run getUserDetils. 
                User id: ${userId}
                Error at: ${__filename}:20`
                );
                reject(err)
            }
        })
    };
    
    login = (req, res) => {
        return new Promise((resolve, reject) => {
            passport.authenticate('local', (err, user, info) => {
                // If there is an error or If user not found return false
                if (!err) {
                    // Try to log in the user
                    req.logIn(user, (err) => {
                        if (!err) {
                            const userData = {email : user.email, username : user.username}
                            resolve({
                                error: false,
                                userData : userData,
                            })
                        } else {
                            myLogger(
                                'error:',
                                `Could not login the user. 
                                Error: ${err}`
                            );
                            console.log(err);
    
                            reject(err);
                        }
                    });
                } else {
                    console.log(err);
    
                    resolve({
                        error: true,
                        message: info.message
                    });
                }
            })(req, res);
        })
    };
    
    logout = req => {
        return new Promise((resolve, reject) => {
            try {
                // Passport automatically adds a function logout to the request object. 
                // Calling it and it will log the user out clearing the login session
                req.logout();
                resolve(true)
            } catch (e) {
    
                myLogger(
                    'error',
                    `Could not run getUserDetils. 
                    User id: ${userId}
                    Error at: ${__filename}:20`
                );
    
                reject(false)
            }
        })
    }

}

module.exports = UserSchema;



