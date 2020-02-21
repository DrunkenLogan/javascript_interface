/* Configuration file for the server */

// Instantiate the config object

const config = {
  'port': 3000,
  'domain': 'http://localhost:3000',
  'secret': 'fanculo',
  'errors': {
    '_400': { 'Status': 'Required fields not provided' },
    '_401': { 'Status': 'Not authenticated' },
    '_403': { 'Status': "You don't have permission to access this resource" },
    '_404': { 'Status': 'Requested resource not found' },
    '_405': { 'Status': 'Method not allowed' },
    '_500': {
      'Status': 'Internal error. Something went wrong with your request'
    }
  }
};

module.exports = config;
