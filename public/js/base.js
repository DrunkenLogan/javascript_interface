/*
 * Frontend Logic for the Application
 */

// Container for the frontend application
const app = {};

// Config
app.config = {
    'host': 'http://localhost:3000',
    'sessionToken': false
};

// AJAX Client (for the restful API)
app.client = {};

// Interface for making API calls
app.client.request = (headersObject, path, method, queryStringObject, payload, callback) => {
    // Set Defaults
    headersObject = typeof (headersObject) === 'object' && headersObject !== null ? headersObject : {};
    path = typeof (path) === 'string' ? path : '/';
    method = typeof (method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) > -1 ? method.toUpperCase() : 'GET';
    queryStringObject = typeof (queryStringObject) === 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof (payload) === 'object' && payload !== null ? payload : {};
    callback = typeof (callback) === 'function' ? callback : false;

    // Instantiate the url object
    const requestUrl = new URL(path, app.config.host);
    // For each query string parameters sent, add it to the path
    for (let queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
            requestUrl.searchParams.append(queryKey, queryStringObject[queryKey])
        }
    }

    // Instantiate the headers object
    const headers = new Headers();
    // Make the request of JSON type
    headers.append('Content-Type', 'application/json');
    // For each header sent, add it to the header object
    for (let headerKey in headersObject) {
        if (headersObject.hasOwnProperty(headerKey)) {
            headers.append(headerKey, headersObject[headerKey])
        }
    }

    // if there is a current session token set, add it to the header
    if (app.config.sessionToken) {
        headers.append('token', app.config.sessionToken.id);
    }

    // If there is a payload try to stringify it
    let body;
    payload ? body = JSON.stringify(payload) : body = '';

    // Instantiate the request object
    const request = new Request(requestUrl, {
        method,
        path,
        headers,
        body
    });

    let responseStatus;
    // Send the request
    fetch(request)
        // Handle Response
        .then(res => {
            responseStatus = res.status;
            return res.json();
        })
        .then(data => {
            // Callback if requested
            if (callback) {
                if (data) {
                    callback(responseStatus, data)
                } else {
                    callback(responseStatus, false)
                }
            }
        })
        .catch(e => {
            throw new Error('Something went wrong!')
        })
}