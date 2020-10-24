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
app.client.request = function (headersObject, path, method, queryStringObject, payload, callback) {
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
        .then(function(res) {
            responseStatus = res.status;
            return res.json();
        })
        .then(function(data) {
            // Callback if requested
            if (callback) {
                if (data) {
                    callback(responseStatus, data)
                } else {
                    callback(responseStatus, false)
                }
            }
        })
        .catch(function(e) {
            console.log(e);
            throw new Error('Something went wrong!')
        })
}

// Automatically bind forms on page if found
app.bindForms = function() {
    // Get all form elements
    if (document.querySelector('form')) {
        const allForms = document.querySelectorAll('form');

        // Loop through the form arrays
        for (const form of allForms) {
            form.addEventListener('submit', function (e) {
                // Prevent form default behaviour
                e.preventDefault();

                // Gather Form Data
                const formId = this.id;
                const path = this.action;
                const method = this.method.toUpperCase();

                // Turn the inputs into payload
                const payload = {};
                const formElements = this.elements;
                for (const el of formElements) {
                    if (el.name) {
                        payload[el.name] = el.value;
                    }
                }

                // Send form data to server
                app.client.request(undefined, path, method, undefined, payload, function(statusCode, resPayload) {
                    if (statusCode !== 200) {
                    } else {
                        // Send to form response processor
                        app.formResponseProcessor(formId, payload, resPayload);
                    }
                })
            })
        }
    }
}

// Process the data coming back from a successful form submission
app.formResponseProcessor = function(formId, reqPayload, resPayload) {
    // Handle form submission response based on form data
    if (formId === 'signup') {
        // Take the email and the password and use it to log the user in
        const newPayload = {
            email: reqPayload.email,
            password: reqPayload.password
        }
        app.client.request(undefined, 'user/login', 'POST', undefined, newPayload, function(statusCode, newResPayload) {
            if (statusCode !== 200) {
                console.log(statusCode, newResPayload.Error)
            } else {
                // handle session data
                app.setSession(newResPayload)
                // Automatically redirect the user to it's profile page
                window.location = '/my-profile';
            }
        })
    }

    if (formId === 'signin') {
        // handle session data
        app.setSession(resPayload)
        // Automatically redirect the user to it's profile page
        window.location = '/my-profile';
    }
}

// Set a cookie and save the token data to local storage
app.setSession = function(tokenData) {
    const tokenString = JSON.stringify(tokenData);
    // Set a cookie
    document.cookie = `token=${tokenString}; path="/"; expires=${new Date(tokenData.expires)}`
    // Persist to session storage
    sessionStorage.setItem('token', tokenString);
}

// Bind Logout buttons
app.bindLogoutButtons = function() {
    const logOutButton = document.querySelector('.logout');

    // If there are logout buttons on page
    if (logOutButton) {
        // Check if there is an active Session
        const tokenStr = sessionStorage.getItem('token');

        // Try to parse the token to an object
        try {
            const tokenObj = JSON.parse(tokenStr)
            if (tokenObj) {
                const queryStringObj = { 'tokenId': tokenObj.id }
                logOutButton.addEventListener('click', function() {
                    app.client.request(undefined, 'user/logout', 'POST', queryStringObj, undefined, function(statusCode) {
                        if (statusCode === 200) {
                            // Redirect the User to the homepage
                            window.location = '/'
                        } else {
                            console.log(statusCode)
                        }
                    })
                })
            }
        } catch (e) {
            throw new Error('Could not find an active Session Token')
        }
    }
}

// Redirect to /my-profile if a valid session already exists
app.verifyToken = function() {
    // Check if there is an active Session
    const tokenStr = sessionStorage.getItem('token');

    if (tokenStr) {
        app.client.request(undefined, 'user/verifyToken', 'POST', undefined, undefined, function(statusCode, newResPayload) {
            if (statusCode === 200) {
                if (window.location.pathname === '/login' || window.location.pathname === '/sign-up') {
                    window.location = '/my-page';
                }
            }
        })
    }
}

app.init = function() {
    app.verifyToken();

    app.bindForms();

    app.bindLogoutButtons();
}

app.init();

