/*************************************************************
 * STATIC Controllers
 *************************************************************/

/*********** Dependencies ************/
const helpers = require('../util/helpers');
const config = require('../config');
const path = require('path');
const StaticPageSchema = require('../models/staticPageSchema');

// Instantiate the handlers object
const staticController = {};

// home Handler
staticController.ping = (reqData, callback) => {
    callback(200, {
        Status: `Server Ok`
    })
}

// home Handler
staticController.home = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {
        const staticPageModel = new StaticPageSchema('home');
        staticPageModel.getView((errStatusCode,view)=>{
            if(!errStatusCode && view) callback(200,view,'html');
            else callback(errStatusCode, undefined, 'html');
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// signup Handler
staticController.signup = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {

        // Check that the user is logged in
        if (reqData.user) {
            // If User is logged in, redirect him to my-profile page
            callback(301, undefined, undefined, {
                Location: `${config.domain}/my-profile`
            })
        } else {
            const staticPageModel = new StaticPageSchema('signup');
            staticPageModel.getView((errStatusCode,view)=>{
                if(!errStatusCode && view) callback(200,view,'html');
                else callback(errStatusCode, undefined, 'html');
            });
        }
    } else {
        callback(405, undefined, 'html');
    }
};

// login Handler
staticController.login = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {
        // Check that the user is logged in
        if (reqData.user) {
            // If User is logged in, redirect him to my-profile page
            callback(301, undefined, undefined, {
                Location: `${config.domain}/my-profile`
            })
        } else {
            const staticPageModel = new StaticPageSchema('login');
            staticPageModel.getView((errStatusCode,view)=>{
                if(!errStatusCode && view) callback(200,view,'html');
                else callback(errStatusCode, undefined, 'html');
            });
        }
    } else {
        callback(405, undefined, 'html');
    }
};

// Public Resources Handler
// Required Fields: asset
staticController.public = (reqData, callback) => {
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
staticController.notFound = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {
        const staticPageModel = new StaticPageSchema('notFound');
        staticPageModel.getView((errStatusCode,view)=>{
            if(!errStatusCode && view) callback(200,view,'html');
            else callback(errStatusCode, undefined, 'html');
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// Export the handlers object
module.exports = staticController;