/* CRUD Library to work with data */
const fs = require('fs');
const path = require('path');

// Instantiate the data object
const data = {};

// Current directory
const baseDir = path.join(__dirname, '../data');

// Create Data
data.create = (dir, fileName, dataObj, callback) => {
  // Open the file for writing
  fs.open(`${baseDir}/${dir}/${fileName}.json`, 'wx', (err, fd) => {
    if (!err && fd) {
      // Write to the file
      fs.write(fd, dataObj, err => {
        if (!err) {
          // Close the file
          fs.close(fd, err => {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing the file after writing');
              console.log(err);
            }
          });
        } else {
          callback('Error Writing to the file');
          console.log(err);
        }
      });
    } else {
      callback('Error Opening the file. It might already exist');
      console.log(err);
    }
  });
};

// Read Data
data.read = (dir, fileName, callback) => {
  // Open the file for reading
  fs.readFile(`${baseDir}/${dir}/${fileName}.json`, 'utf8', (err, data) => {
    if (!err && data) {
      callback(false, JSON.parse(data));
    } else {
      callback('Could not find the file');
      console.log('Could not find the file', err);
    }
  });
};

// Delete Data
data.delete = (dir, fileName, callback) => {
  // Unlink (deleted) a file
  fs.unlink(`${baseDir}/${dir}/${fileName}.json`, err => {
    if (!err) {
      callback(false);
    } else {
      callback('Error Deleting the file');
    }
  });
};

module.exports = data;
