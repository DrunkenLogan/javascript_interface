/*************************************************************
 * STATIC Routes
 * Routes to serve static content
 *************************************************************/

/*********** Dependencies ************/
const staticController = require('../controllers/static');

// Instantiate the handlers object
const staticRoutes = {};

// home Handler
staticRoutes.ping = (reqData, callback) => {
  callback(200, {
    Status: `Server Ok`
  })
}

// home Handler
staticRoutes.home = (reqData, callback) => staticController.home(reqData, callback);

// signup Handler
staticRoutes.signup = (reqData, callback) => staticController.signup(reqData, callback);

// login Handler
staticRoutes.login = (reqData, callback) => staticController.login(reqData, callback);

// // logout Handler
// staticRoutes.logout = (reqData, callback) => staticController.logout(reqData, callback);

// Public Resources Handler
// Required Fields: asset
staticRoutes.assets = (reqData, callback) => staticController.assets(reqData, callback);

// Handler.notFound
staticRoutes.notFound = (reqData, callback) => staticController.notFound(reqData, callback);

// Export the handlers object
module.exports = staticRoutes;