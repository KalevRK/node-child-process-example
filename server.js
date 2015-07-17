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

app.get('/', function(req, res) {
  res.status(200).send('Hello, World');
});

app.listen(port);
console.log('Server is listening on port', port);
