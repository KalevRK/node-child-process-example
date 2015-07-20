/*
  Node Child Process Example project
  Kalev Roomann-Kurrik
  Last Modified: 7/18/2015 
*/

// Entry point for server
var childProcess = require('child_process');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var port = 3000;

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Options for processing
var options = {
  numberElements: 1000000,
  numberCores: 4,
};

// Number of cores available in system
var availableCores = require('os').cpus().length;

// Array of children processes
var children = [];

// Whenever the client sends a request to get the root directory then create new child processes
// and have them perform the required calculations, kill the child processes and return the final result
app.post('/', function(req, res) {

  // Overall sum
  var sum = 1;

  // Count of how many children have provided results
  var childrenFinished = 0;

  // Get data from body of POST request
  var numElementsInput = req.body.numberElements;
  var numCoresInput = req.body.numberCores;
  var maxCoresInput = req.body.useMaxCores;

  // Set options based on data passed in on the request
  // If values were not provided default to the values already set on the options object
  options.numberElements = numElementsInput ? parseInt(numElementsInput) : options.numberElements;
  options.numberCores = numCoresInput ? Math.min(parseInt(numCoresInput), 4) : options.numberCores;

  // Check whether the program should be run with the maximum number of available cores
  var numCores = maxCoresInput === 'true' ? availableCores : options.numberCores;

  // Determine the amount of data to send to each core
  var dataSlice = options.numberElements/numCores;

  // Sample data to have child processes operate on
  var data = [];
  for (var i = 1; i <= options.numberElements; i++) {
    data.push(i);
  }

  // Get time when request was submitted
  var startTime = process.hrtime();

  // Setup one child process per core
  for (var i = 0; i < numCores; i++) {
    // Create child process for a core and have it run the code in worker.js
    children[i] = childProcess.fork('./worker.js');
    console.log('Forked child ' + i + ' with pid ' + children[i].pid);
    // Send data to each child process
    children[i].send(data.slice(0+(i*dataSlice),dataSlice+(i*dataSlice)));
    // Receive processed data from each child process
    // and combine to send back to client
    children[i].on('message', function(result) {
      // Append the sum calculated by the child process to the overall sum
      sum += result;
      // Update the count of child processes which have finished
      childrenFinished++;
      // If the last child process has finished then provide final sum and clean up
      if(childrenFinished === numCores) {
        // Kill the child process after it is done processing
        this.kill();

        // Log time taken to handle request
        var endTime = process.hrtime(startTime);
        console.log('Process ran with %s cores in %dms', numCores, endTime[1]/1000000);

        // Package up calculated sum and the time taken to do the processing
        var result = {
          sum: sum,
          time: (endTime[1] - (endTime[1] % 1000))/1000000
        };

        // Send result to client
        res.json(result);
      }
      // Kill the child process after it is done processing
      this.kill();
    });
  }
});

app.listen(port);
console.log('Server is listening on port', port);
