/*************************************************************
 * PAGE Controllers
 *************************************************************/

/*********** Dependencies ************/
const _data = require('../lib/data');
const helpers = require('../util/helpers');
const config = require('../config');
const path = require('path');
const sessionControllers = require('./session')

// Instantiate the handlers object
const pageRoutes = {};

// home Handler
pageRoutes.ping = (reqData, callback) => {
    callback(200, {
        Status: `Server Ok`
    })
}

// home Handler
pageRoutes.home = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {
        // Get signin template data
        _data.read('content', 'home', (err, contentData) => {
            if (!err && contentData) {
                helpers.getTemplate('home', contentData, (err, templateString) => {
                    if (!err && templateString) {
                        // Add global templates
                        helpers.addGlobaltemplates(templateString, contentData, (err, finalString) => {
                            if (!err && finalString) {
                                callback(200, finalString, 'html');
                            } else {
                                callback(500, undefined, 'html');
                            }
                        });
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// signup Handler
pageRoutes.signup = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {

        // Check that the user is logged in
        if (reqData.user) {
            // If User is logged in, redirect him to my-profile page
            callback(302, undefined, undefined, {
                Location: `${config.domain}/my-profile`
            })
        } else {
            // Get signup template data
            _data.read('content', 'signup', (err, contentData) => {
                if (!err && contentData) {

                    helpers.getTemplate('signup', contentData, (err, templateString) => {
                        if (!err && templateString) {
                            // Add global templates
                            helpers.addGlobaltemplates(templateString, contentData, (err, finalString) => {
                                if (!err && finalString) {
                                    callback(200, finalString, 'html');
                                } else {
                                    callback(500, undefined, 'html');
                                }
                            });
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });
                } else {
                    callback(500, undefined, 'html');
                }
            });
        }
    } else {
        callback(405, undefined, 'html');
    }
};

// login Handler
pageRoutes.login = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {
        // Check that the user is logged in
        if (reqData.user) {
            // If User is logged in, redirect him to my-profile page
            callback(302, undefined, undefined, {
                Location: `${config.domain}/my-profile`
            })
        } else {
            // Get login template data
            _data.read('content', 'login', (err, contentData) => {
                if (!err && contentData) {
                    helpers.getTemplate('login', contentData, (err, templateString) => {
                        if (!err && templateString) {
                            // Add global templates
                            helpers.addGlobaltemplates(templateString, contentData, (err, finalString) => {
                                if (!err && finalString) {
                                    callback(200, finalString, 'html');
                                } else {
                                    callback(500, undefined, 'html');
                                }
                            });
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });
                } else {
                    callback(500, undefined, 'html');
                }
            });
        }
    } else {
        callback(405, undefined, 'html');
    }
};

// logout Handler
pageRoutes.logout = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {
        // Get login template data
        _data.read('content', 'login', (err, contentData) => {
            if (!err && contentData) {

                helpers.getTemplate('login', contentData, (err, templateString) => {
                    if (!err && templateString) {
                        // Add global templates
                        helpers.addGlobaltemplates(templateString, contentData, (err, finalString) => {
                            if (!err && finalString) {
                                callback(200, finalString, 'html');
                            } else {
                                callback(500, undefined, 'html');
                            }
                        });
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// my-profile Handler
pageRoutes.myProfile = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {
        // Check that the user is logged in
        if (reqData.user) {
            // Get the user data
            _data.read('users', reqData.user.email, (err, userData) => {
                if (!err && userData) {
                    // Get login template data
                    _data.read('content', 'myprofile', (err, contentData) => {
                        if (!err && contentData) {
                            // Combine user data and Page data in one object
                            const fullPageData = {
                                ...contentData,
                                ...userData
                            };
                            helpers.getTemplate('myprofile', fullPageData, (err, templateString) => {
                                if (!err && templateString) {
                                    // Add global templates
                                    helpers.addGlobaltemplates(templateString, fullPageData, (err, finalString) => {
                                        if (!err && finalString) {
                                            callback(200, finalString, 'html');
                                        } else {
                                            callback(500, undefined, 'html');
                                        }
                                    });
                                } else {
                                    callback(500, undefined, 'html');
                                }
                            });
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });
                } else {
                    callback(500, undefined, 'html')
                }
            })
        } else {
            callback(301, undefined, undefined, {
                Location: `${config.domain}/login`
            });
        }
    } else {
        callback(405, undefined, 'html');
    }
};

// Public Resources Handler
// Required Fields: asset
pageRoutes.public = (reqData, callback) => {
    // Get asset name from route
    const assetPath = reqData.path.replace('public/', '');
    //Check that required fields are provided and valid
    if (assetPath) {
        // Get the static asset
        helpers.getStaticAsset(assetPath, (err, assetData) => {
            if (!err && assetData) {
                const parsedAssetPath = path.parse(assetPath);
                // Get the file extension
                const contentType = parsedAssetPath.ext.replace('.', '');
                callback(200, assetData, contentType);
            } else {
                callback(404, undefined, 'plain');
            }
        });
    } else {
        callback(404, undefined, 'plain');
    }
};

// Handler.notFound
pageRoutes.notFound = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {
        // Get login template data
        _data.read('content', 'notfound', (err, contentData) => {
            if (!err && contentData) {
                helpers.getTemplate('notfound', contentData, (err, templateString) => {
                    if (!err && templateString) {
                        // Add global templates
                        helpers.addGlobaltemplates(templateString, contentData, (err, finalString) => {
                            if (!err && finalString) {
                                callback(404, finalString, 'html');
                            } else {
                                callback(500, undefined, 'html');
                            }
                        });
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// Export the handlers object
module.exports = pageRoutes;