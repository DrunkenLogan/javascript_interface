/*********** Dependencies ************/
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');
const path = require('path');

// Instantiate the handlers object
const handlers = {};

// Home Handler
handlers.home = (reqData, callback) => {
  callback(200, {
    'status': "Tutt'Appo"
  });
};

// Sign-up Handler
handlers.signUp = (reqData, callback) => {
  // Only accept get requests
  if (reqData.method === 'get') {
    // Get signin template data
    _data.read('content', 'signup', (err, pageData) => {
      if (!err && pageData) {

        helpers.getTemplate('signup', pageData, (err, templateString) => {
          if (!err && templateString) {
            // Add global templates
            helpers.addGlobalTemplates(templateString, pageData, (err, finalString) => {
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

// Sign-in Handler
handlers.login = (reqData, callback) => {
  // Only accept get requests
  if (reqData.method === 'get') {
    // Get login template data
    _data.read('content', 'login', (err, pageData) => {
      if (!err && pageData) {

        helpers.getTemplate('login', pageData, (err, templateString) => {
          if (!err && templateString) {
            // Add global templates
            helpers.addGlobalTemplates(templateString, pageData, (err, finalString) => {
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

// Public Resources Handler
// Required Fields: asset
handlers.public = (reqData, callback) => {
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
        console.log(err);
      }
    });
  } else {
    callback(404, undefined, 'plain');
    console.log(err);
  }
};

// Handler.notFound
handlers.notFound = (reqData, callback) => {
  callback(404, {
    'Status': "Cazz'hai detto?"
  });
};

/*************************************************************
 * API Handlers
 *************************************************************/

// USERS Handlers
handlers.users = (reqData, callback) => {
  // Check that request method is supported
  const acceptedMethods = ['get', 'post', 'delete'];

  if (acceptedMethods.indexOf(reqData.method) > -1) {
    handlers._users[reqData.method](reqData, callback);
  } else {
    callback(405, config.errors._405, 'json');
  }
};

// Instantiate object container for user submethods
handlers._users = {};

// USERS POST (Create a User)
// Required Fields: email, name, surname
handlers._users.post = (reqData, callback) => {
  // Check the required fields is provided and correct
  const email = helpers.validateEmail(reqData.payload.email) ?
    reqData.payload.email :
    false;
  const name =
    typeof reqData.payload.name === 'string' && reqData.payload.name.length > 0 ?
    reqData.payload.name :
    false;
  const surname =
    typeof reqData.payload.surname === 'string' &&
    reqData.payload.surname.length > 0 ?
    reqData.payload.surname :
    false;
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
};

// USERS Get (Get User Data)
// Required Fields: email, tokenId
handlers._users.get = (reqData, callback) => {
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
    // Lookup the token and check if it iscalid for the given user
    handlers._tokens.validateToken(tokenId, email, isValid => {
      if (isValid) {
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
    });
  } else {
    callback(400, config.errors._400);
  }
};

// TOKENS Handlers
handlers.tokens = (reqData, callback) => {
  // Check that request method is supported
  const acceptedMethods = ['get', 'post', 'delete'];

  if (acceptedMethods.indexOf(reqData.method) > -1) {
    handlers._tokens[reqData.method](reqData, callback);
  } else {
    callback(405, config.errors._405);
  }
};

// Instantiate object container for user submethods
handlers._tokens = {};

// TOKENS Post (Log-in)
handlers._tokens.post = (reqData, callback) => {
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
          const expires = Date.now() * 1000 * 60 * 60;
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
              callback(200, token.id);
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
};

// TOKENS Get (Session Authentication)
// Required Fields: tokenId
handlers._tokens.get = (reqData, callback) => {
  // Check that tokenId is provided and valid
  const tokenId =
    typeof reqData.searchParam.get('tokenId') === 'string' &&
    reqData.searchParam.get('tokenId').length === 20 ?
    reqData.searchParam.get('tokenId') :
    false;

  if (tokenId) {
    // Lookup the token Id
    _data.read('tokens', tokenId, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404, config.errors._404);
      }
    });
  } else {
    callback(400, config.errors._400);
  }
};

// TOKENS Delete (Log-out)
handlers._tokens.delete = (reqData, callback) => {
  // Check that tokenId is provided and valid
  const tokenId =
    typeof reqData.searchParam.get('tokenId') === 'string' &&
    reqData.searchParam.get('tokenId').length === 20 ?
    reqData.searchParam.get('tokenId') :
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

// A function to validate a provided token
handlers._tokens.validateToken = (tokenId, email, callback) => {
  // Lookup the token
  _data.read('tokens', tokenId, (err, tokenData) => {
    if (!err && tokenData) {
      // Check tokenId / Email association & token expiration
      if (tokenData.email === email && tokenData.validUntil > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// Export the handlers object
module.exports = handlers;