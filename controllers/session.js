/*************************************************************
 * SESSION Controllers
 *************************************************************/

/*********** Dependencies ************/
const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const config = require('../lib/config');

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
            _data.read('users', email, (err, data) => {
                if (!err && data) {
                    // Check that provided password is correct
                    if (helpers.hash(passw) === data.password) {
                        // Create token string
                        const tokenId = helpers.createRandomString(20);
                        // Set expiration in 1h
                        const expires = Date.now() + 1000 * 60 * 60;
                        // Instantiate the token object
                        const token = {
                            id: tokenId,
                            email: data.email,
                            validUntil: expires
                        };
                        // Stringify the token
                        const tokenStr = JSON.stringify(token);
                        // Save the token
                        _data.create('tokens', tokenId, tokenStr, err => {
                            if (!err) {
                                callback(200, token);
                            } else {
                                callback(500, config.errors._500);
                            }
                        });
                    } else {
                        callback(401, config.errors._401);
                    }
                } else {
                    callback(404, config.errors._404);
                }
            });
        } else {
            callback(400, config.errors._400);
        }
    } else {
        callback(405, config.errors._405)
    }
};

// End a Session
// Required Fields: tokens
sessionControllers.destroySession = (reqData, callback) => {
    // Check that tokenId is provided and valid
    console.log(reqData.searchParam.get('tokenId'))
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

// A function to validate a token provided through cookies
sessionControllers.validateToken = (cookies, callback) => {
    // Get the token from the cookies if provided
    const token = helpers.getTokenFromCookies(cookies);
    if (token) {
        tokenId = typeof token.id === 'string' && token.id.length > 0 ? token.id : false;
        email = helpers.validateEmail(token.email) ? token.email : false;
        if (tokenId && email) {
            // Lookup the token
            _data.read('tokens', tokenId, (err, tokenData) => {
                if (!err && tokenData) {
                    // Check tokenId / Email association & token expiration
                    if (tokenData.email === email && tokenData.validUntil > Date.now()) {
                        callback(true, email);
                    } else {
                        callback(false);
                    }
                } else {
                    callback(false);
                }
            });
        } else {
            callback(false)
        }
    } else {
        callback(false)
    }
};

module.exports = sessionControllers;