/*************************************************************
 * SESSION Controllers
 *************************************************************/

/*********** Dependencies ************/
const _data = require('../lib/data');
const helpers = require('../util/helpers');
const config = require('../config');
const myLogger = require('../util/logger');

// Instantiate the session handlers object
const sessionControllers = {};

// Create a Session
// Required Fields: email, password
sessionControllers.createSession = (reqData, callback) => {
    // Only accept POST request
    if (reqData.method === 'post') {
        // Check that required field are provided and valid
        const email = helpers.validateEmail(reqData.payload.email) ?
            reqData.payload.email :
            false;
        const passw = helpers.validatePassword(reqData.payload.password) ?
            reqData.payload.password :
            false;

        if (email && passw) {
            // Check if the user exists
            _data.read('users', email, (err, userData) => {
                if (!err && userData) {
                    // Check that provided password is correct
                    if (helpers.hash(passw) === userData.password) {
                        // Check if the user is already logged in
                        if (!userData.sessionToken) {
                            sessionControllers.createSessionToken(userData, sessionToken => {
                                if (sessionToken) {
                                    callback(200, sessionToken);
                                } else {
                                    callback(500, config.errors._500);
                                }
                            })
                        } else {
                            // Check if the existing token is stil valid
                            sessionControllers.verifySessionValidity(userData.sessionToken.id, sessionToken => {
                                // if there is not valid session token
                                if (!sessionToken) {
                                    // Create a new one
                                    sessionControllers.createSessionToken(userData, sessionToken => {
                                        if (sessionToken) {
                                            callback(200, sessionToken);
                                        } else {
                                            callback(500, config.errors._500);
                                        }
                                    })
                                } else {
                                    // Otherwise return the existing one
                                    callback(200, sessionToken);
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
        } else {
            callback(400, config.errors._400);
            myLogger('User error',
                `Session creation failed. 
                headers: ${JSON.stringify(reqData.headers)}
                payload: ${JSON.stringify(reqData.payload)}`
            );
        }
    } else {
        callback(405, config.errors._405)
    }
};

// End a Session
// Required Fields: tokens
sessionControllers.destroySession = (reqData, callback) => {
    // Check that tokenId is provided and valid
    const tokenString = reqData.searchParam.get('tokenId');
    const tokenId = typeof tokenString === 'string' &&
        tokenString.length === 20 ?
        tokenString :
        false;

    if (tokenId) {
        // Lookup the token Id
        _data.read('tokens', tokenId, (err, tokenData) => {
            if (!err && tokenData) {
                // Delete the token
                _data.delete('tokens', tokenId, err => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, config.errors._500);
                    }
                });
            } else {
                callback(404, config.errors._404);
            }
        });
    } else {
        callback(400, config.errors._400);
    }
};

// Veryfy Session
sessionControllers.verifySessionValidity = (sessionTokenId, callback) => {
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
sessionControllers.createSessionToken = (userData, callback) => {
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

module.exports = sessionControllers;