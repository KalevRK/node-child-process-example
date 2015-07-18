/*
  Node Child Process Example project
  Kalev Roomann-Kurrik
  Last Modified: 7/17/2015 
*/

// Entry point for server
var childProcess = require('child_process');
var express = require('express');

var app = express();
var port = 3000;

// Options for processing
var options = {
  numberElements: 1000,
  useMaxCores: true,
  numberCores: 4,
};

// Array of children processes
var children = [];

// Sample data to have child processes operate on
var data = [];
for (var i = 1; i <= options.numberElements; i++) {
  data.push(i);
}

// Overall sum
var sum = 1;

// Copy of sum to send back to client
var sumCopy;

// Count of how many children have provided results
var childrenFinished = 0;

// Determine the number of cores in the system
var numCores = options.useMaxCores ? require('os').cpus().length : options.numberCores;
console.log('numCores:', numCores);

// Whenever the client sends a request to get the root directory then create new child processes
// and have them perform the required calculations, kill the child processes and return the final result
app.get('/', function(req, res) {

  // Get time when request was submitted
  console.time('Process ran with ' + numCores + ' cores in');

  // Setup one child process per core
  for (var i = 0; i < numCores; i++) {
    // Create child process for a core and have it run the code in worker.js
    children[i] = childProcess.fork('./worker.js');
    console.log('Forked child', i);
    // Send data to each child process
    children[i].send(data.slice(0+(i*(options.numberElements/numCores)),((options.numberElements/numCores)-1)+(i*(options.numberElements/numCores))));
    // Receive processed data from each child process
    // and combine to send back to client
    children[i].on('message', function(result) {
      console.log('received partial sum from worker:', result);
      sum += result;
      console.log('sum so far:', sum);
      // Update the count of child processes which have finished
      childrenFinished++;
      console.log('children finished:', childrenFinished);
      // If the last child process has finished then provide final sum and clean up
      if(childrenFinished === numCores) {
        console.log('Final sum:', sum);
        childrenFinished = 0;
        sumCopy = sum;
        sum = 1;
        this.kill();

        // Get time when response is sent
        console.timeEnd('Process ran with ' + numCores + ' cores in');

        // Calculate time taken to handle request
        // var elapsed = end - start;
        // console.log('This process took ' + elapsed + ' milliseconds to run using ' + numCores + ' cores');

        res.status(200).send('Sum from the server:' + sumCopy);
      }
      // Kill the child process after it is done processing
      this.kill();
    });
  }
});

app.listen(port);
console.log('Server is listening on port', port);
