/*************************************************************
 * USER Routes
 *************************************************************/

/*********** Dependencies ************/
const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const config = require('../lib/config');
const path = require('path');
const pageControllers = require('../controllers/page');

// Instantiate the handlers object
const pageRoutes = {};

// home Handler
pageRoutes.ping = (reqData, callback) => {
  callback(200, {
    Status: `Server Ok`
  })
}

// home Handler
pageRoutes.home = (reqData, callback) => pageControllers.home(reqData, callback);

// signup Handler
pageRoutes.signup = (reqData, callback) => pageControllers.signup(reqData, callback);

// login Handler
pageRoutes.login = (reqData, callback) => pageControllers.login(reqData, callback);

// logout Handler
pageRoutes.logout = (reqData, callback) => pageControllers.logout(reqData, callback);

// my-profile Handler
pageRoutes.myProfile = (reqData, callback) => pageControllers.myProfile(reqData, callback);

// Public Resources Handler
// Required Fields: asset
pageRoutes.public = (reqData, callback) => pageControllers.public(reqData, callback);

// Handler.notFound
pageRoutes.notFound = (reqData, callback) => pageControllers.notFound(reqData, callback);

// Export the handlers object
module.exports = pageRoutes;