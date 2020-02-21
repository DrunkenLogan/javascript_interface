/* Dependencies */
const http = require('http');
const {
  StringDecoder
} = require('string_decoder');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');
const config = require('./lib/config');

// Globals
const decoder = new StringDecoder('utf8');
const PORT = config.port;
const domain = config.domain;

// Instantiate the server object
const server = http.createServer((req, res) => {
  // Get the url from the incoming req Object
  const reqUrl = new URL(domain + req.url);

  // Get the path
  const path = reqUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/, '');

  // Get the method
  const method = req.method.toLowerCase();

  // Get the headers
  const headers = req.headers;

  // Buffer for incoming data stroning
  let buffer = '';

  // Listen for incoming data
  req.on('data', data => {
    buffer += decoder.write(data);
  });

  req.on('end', data => {
    buffer += decoder.end(data);

    // Instantiate the reqObject
    const reqObj = {
      path: trimmedPath,
      method: method,
      headers: headers,
      searchParam: reqUrl.searchParams,
      payload: helpers.parseJsonToObject(buffer)
    };

    console.log(reqObj);

    // Figure out with path was requested
    let chosenHandler =
      typeof router[reqObj.path] !== 'undefined' ?
      router[reqObj.path] :
      handlers.notFound;

    // Figure out if the request is for a public resource
    chosenHandler =
      trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

    chosenHandler(reqObj, (statusCode, payload, contentType) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 200;
      contentType = typeof contentType === 'string' ? contentType : 'json';

      // Return the response parts that are content specific
      let stringPayload = '';
      if (contentType === 'json') {
        res.setHeader('Content-Type', 'application/json');
        payload =
          typeof payload === 'object' && payload !== null ? payload : {};
        stringPayload = JSON.stringify(payload);
      }
      if (contentType === 'html') {
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        stringPayload = typeof payload === 'string' ? payload : '';
      }
      if (contentType === 'css') {
        res.setHeader('Content-Type', 'text/css');
        stringPayload = typeof payload !== 'undefined' ? payload : '';
      }
      if (contentType === 'js') {
        res.setHeader('Content-Type', 'text/javascript');
        stringPayload = typeof payload !== 'undefined' ? payload : '';
      }
      if (contentType === 'jpg') {
        res.setHeader('Content-Type', 'image/jpg');
        stringPayload = typeof payload !== 'undefined' ? payload : '';
      }
      if (contentType === 'png') {
        res.setHeader('Content-Type', 'image/png');
        stringPayload = typeof payload !== 'undefined' ? payload : '';
      }

      // Return the global response parts
      res.writeHead(statusCode);
      res.end(stringPayload);
    });
  });
});

// Instantiate req router object
const router = {
  '': handlers.home,
  'login': handlers.login,
  'logout': handlers.logout,
  'account/sign-up': handlers.signUp,
  'account/delete': handlers.deleteAccount,
  'notFound': handlers.notFound,
  'public': handlers.public,
  'api/users': handlers.users,
  'api/tokens': handlers.tokens
};

server.listen(PORT, () => {
  console.log(`Listenign on port ${PORT}`);
});