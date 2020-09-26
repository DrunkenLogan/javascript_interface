/* Dependencies */
const http = require('http');
const { StringDecoder } = require('string_decoder');
const handlers = require('./routes/page');
const helpers = require('./lib/helpers');
const config = require('./lib/config');

// Routes
const userRoutes = require('./routes/user');
const sessionRoutes = require('./routes/session');
const pageRoutes = require('./routes/page');

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

    // console.log(reqObj);

    // Figure out which path was requested
    let chosenHandler =
      typeof router[reqObj.path] !== 'undefined' ?
        router[reqObj.path] :
        handlers.notFound;

    console.log(router);

    // Figure out if the request is for a public resource
    chosenHandler =
      trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

    chosenHandler(reqObj, (statusCode, payload, contentType, headersObj = {}) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 200;
      contentType = typeof contentType === 'string' ? contentType : 'json';
      headersObj = typeof headersObj === 'object' ? headersObj : {};

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
      res.writeHead(statusCode, headersObj);
      res.end(stringPayload);
    });
  });
});

// Instantiate req router object
const router = {
  'ping': pageRoutes.ping,
  '': pageRoutes.home,
  'login': pageRoutes.login,
  'signup': pageRoutes.signup,
  'notFound': pageRoutes.notFound,
  'public': pageRoutes.public,
  'my-profile': pageRoutes.myProfile,
  'user/login': sessionRoutes.login,
  'user/logout': sessionRoutes.logout,
  'user/signup': userRoutes.signup,
  'user/profile': userRoutes.profile
};

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});