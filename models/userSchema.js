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

    getUserDetails = callback => {
        _data.read('users', this.email, (err, data) => {
            if (!err && data) {
                // delete the password && session data
                delete data.password;
                delete data.sessionToken;
                callback(data);
            } else {
                callback(null, 404, config.errors._404);
            }
        });
    };
    
    register = callback => {
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
    
    update = callback => {
        _data.read('users', this.email,(err,userData)=>{
            if(!err && userData) {
                if (this.name) userData.name = this.name;
                if (this.surname) userData.surname = this.surname;
                _data.update('users', this.email, JSON.stringify(userData), (err) => {
                    if (!err) callback(false);
                    else callback(500, config.errors._500);
                })
            } else {
                callback(500, config.errors._500);
            }
        })
    };
    
    delete = callback => {
        _data.delete('users', this.email, (err) => {
            if (!err) callback(false);
            else callback(500, config.errors._500);
        })
    };
    
    login = callback => {
        // Check if the user exists
        _data.read('users', this.email, (err, userData) => {
            if (!err && userData) {
                // Check that provided password is correct
                if (helpers.hash(this.password) === userData.password) {
                    // Check if the user is not already logged in
                    if (!userData.sessionToken) {
                        // then create a new session token
                        this.createSessionToken(userData, sessionToken => {
                            if (sessionToken) {
                                callback(sessionToken);
                            } else {
                                callback(null, 500, config.errors._500);
                            }
                        });
                    } else {
                        // If there already is a session token
                        // Check if the existing token is stil valid
                        this.verifySessionValidity(userData.sessionToken.id, sessionToken => {
                            // if there is not valid session token
                            if (!sessionToken) {
                                // Create a new one
                                this.createSessionToken(userData, sessionToken => {
                                    if (sessionToken) {
                                        callback(sessionToken);
                                    } else {
                                        callback(null, 500, config.errors._500);
                                    }
                                })
                            } else {
                                // Otherwise return the existing one
                                callback(sessionToken);
                            }
                        })
                    }
                } else {
                    callback(401, config.errors._401);
                }
            } else {
                callback(404, config.errors._404);
            }
        });
    };
    
    logout = callback => {
        _data.read('users', this.email, (err,userData)=>{
            if(!err && userData) {
                const tokenId = userData.sessionToken.id;
                if(tokenId) {
                    // Lookup the token Id
                    _data.read('tokens', tokenId, (err, tokenData) => {
                        if (!err && tokenData) {
                            // Delete the token
                            _data.delete('tokens', tokenId, err => {
                                if (!err) {
                                    // Delete sessionToken from user object
                                    delete userData.sessionToken;
                                    // Update user data
                                    _data.update('users', userData.email, JSON.stringify(userData),(err)=>{
                                        if(!err) {
                                            callback(false)
                                        } else {
                                            callback(500, config.errors._500);
                                        }
                                    })
                                } else {
                                    callback(500, config.errors._500);
                                }
                            });
                        } else {
                            callback(404, config.errors._404);
                        }
                    });
                } else {
                    callback(500, config.errors._500);
                }
            }
        })
    }

    // Veryfy Session
    verifySessionValidity = (sessionTokenId, callback) => {
        // Check if session exists
        _data.read('tokens', sessionTokenId, (err, sessionToken) => {
            if (!err, sessionToken) {
                // Check if token is valid
                if (sessionToken.validUntil < Date.now()) callback(false);
                else callback(sessionToken);
            } else {
                callback(false);
            }
        })
    }

    // Create Session Token
    createSessionToken = (userData, callback) => {
        // Create session token string
        const sessionTokenId = helpers.createRandomString(20);
        // Set expiration in 1h
        const expires = Date.now() + 1000 * 60 * 60;
        // Instantiate the session token object
        const sessionToken = {
            id: sessionTokenId,
            email: userData.email,
            validUntil: expires
        };
        // Stringify the token
        const sessionTokenStr = JSON.stringify(sessionToken);
        // Save the token
        _data.create('tokens', sessionTokenId, sessionTokenStr, err => {
            if (!err) {
                // Update the user data with the session token data
                userData.sessionToken = sessionToken;
                _data.update('users', userData.email, JSON.stringify(userData), err => {
                    if (!err) {
                        callback(sessionToken);
                    } else {
                        callback(false);
                    }
                })
            } else {
                callback(false);
            }
        });
    }
}

module.exports = UserSchema;



