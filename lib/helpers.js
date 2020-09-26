/* Dependencies */
const config = require('./config');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

/* Various function helpers */

//Instantiate the helpers object
const helpers = {};

// A function to validate an email
helpers.validateEmail = email => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// A function to validate a password:
// Password between 7 to 15 characters which contain at least one numeric digit and a special character
// test password: ase34d@
helpers.validatePassword = pw => {
  const re = /^^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;
  return re.test(String(pw));
};

// A function to hash a string
helpers.hash = str => {
  const hashedStr = crypto
    .createHmac('sha256', config.secret)
    .update(str)
    .digest('hex');

  return hashedStr;
};

// A function to create a random mix of letters and number string
helpers.createRandomString = n => {
  const acceptedCharacters = 'abcdefghijklmnopqrstuvwzxy0123456789';
  let randomString = '';
  for (let i = 0; i < n; i++) {
    randomString += acceptedCharacters.charAt(
      Math.floor(Math.random() * acceptedCharacters.length)
    );
  }
  return randomString;
};

// Parse JSON Object without throwing in case of errors
helpers.parseJsonToObject = json => {
  try {
    const obj = JSON.parse(json);
    return obj;
  } catch {
    return {};
  }
};

// A function to fill in page templates with page specific content
helpers.interpolate = (templateString, templateDataObject) => {
  // Validate arguments
  templateString =
    typeof templateString === 'string' && templateString.length > 0 ?
      templateString :
      '';
  templateDataObject =
    typeof templateDataObject === 'object' && templateDataObject !== null ?
      templateDataObject : {};

  for (let keyName in templateDataObject) {
    if (
      templateDataObject.hasOwnProperty(keyName) &&
      typeof keyName === 'string'
    ) {
      const find = new RegExp(`{${keyName}}`, 'g');
      const replace = templateDataObject[keyName];
      templateString = templateString.replace(find, replace);
    }
  }
  return templateString;
};

// A function to get a specific html template
helpers.getTemplate = (templateName, templateDataObject, callback) => {
  // Validate arguments
  templateName =
    typeof templateName === 'string' && templateName.length > 0 ?
      templateName :
      '';
  templateDataObject =
    typeof templateDataObject === 'object' && templateDataObject !== null ?
      templateDataObject : {};
  if (templateName && templateDataObject) {
    // Lookup the requested template
    const pathName = path.join(__dirname, '../html');
    fs.readFile(
      `${pathName}/${templateName}.html`,
      'utf8',
      (err, templateString) => {
        if (!err && templateString) {
          // Interpolate the string
          const finaltemplateString = helpers.interpolate(
            templateString,
            templateDataObject
          );
          callback(false, finaltemplateString);
        } else {
          console.log(err);
          callback('The template could not be found');
        }
      }
    );
  } else {
    callback('A valid template name was not specified');
  }
};

// A function to add global templates to a given template
helpers.addGlobaltemplates = (templateString, templateDataObject, callback) => {
  // Validate arguments
  templateString =
    typeof templateString === 'string' && templateString.length > 0 ?
      templateString :
      '';
  templateDataObject =
    typeof templateDataObject === 'object' && templateDataObject !== null ?
      templateDataObject : {};

  if (templateString && templateDataObject) {
    // Get the header
    helpers.getTemplate('_header', templateDataObject, (err, headerString) => {
      if (!err && headerString) {
        // Get the footer
        helpers.getTemplate(
          '_footer',
          templateDataObject,
          (err, footerString) => {
            if (!err && footerString) {
              const finalString = headerString + templateString + footerString;
              callback(false, finalString);
            } else {
              callback('Could not fetch the footer');
            }
          }
        );
      } else {
        callback('Could not fetch the header');
      }
    });
  } else {
    callback('A valid template name was not specified');
  }
};

helpers.getStaticAsset = (asset, callback) => {
  asset = typeof asset === 'string' && asset.length > 0 ? asset : false;
  if (asset) {
    const pathName = path.join(__dirname, '../public');
    fs.readFile(`${pathName}/${asset}`, (err, data) => {
      if (!err && data) {
        callback(false, data);
      } else {
        callback('Could not find specified asset');
      }
    });
  } else {
    callback('Asset Name provided not valid');
  }
};

helpers.parseCookiesToObject = (cookieString) => {
  try {
    const cookieArr = cookieString.split(';');
    const cookieObj = {};
    cookieArr.forEach(cookie => {
      const keyValue = cookie.split('=');
      cookieObj[keyValue[0]] = keyValue[1];
    })
    return cookieObj;
  } catch (e) {
    return false
  }
}

helpers.getTokenFromCookies = (cookieString) => {
  // Check if there are cookies
  cookieString = typeof cookieString === 'string' && cookieString.length > 0 ? cookieString : false;
  if (cookieString) {
    // Parse the cookies into an object
    const cookieObject = helpers.parseCookiesToObject(cookieString);
    // Check that a token was passed through cookies
    if (cookieObject.token) {
      // Try to parse the token
      const token = helpers.parseJsonToObject(cookieObject.token);
      if (token.id && token.email) {
        return token
      } else return false
    } else return false
  } else return false
}

module.exports = helpers;