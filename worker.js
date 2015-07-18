/*
  Node Child Process Example project
  Kalev Roomann-Kurrik
  Last Modified: 7/18/2015 
*/

// Worker code to handle processing of a task

// Have the worker process data when it is passed in
process.on('message', function(data) {
  // Sum all of the numbers in the data array
  var result = data.reduce(function(sum, value) {
    return sum + value;
  });
  
  // Send the sum back to the main thread
  process.send(result);
});
