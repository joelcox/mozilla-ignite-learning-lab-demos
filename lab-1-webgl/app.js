
var express = require("express");
var io = require('socket.io');
var app = express()
  , server = require('http').createServer(app)
  , io = io.listen(server);

var csv = require('csv');
var fs  = require('fs');

server.listen(8080);

// Load datasets into memory

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.set('log level', 0);

io.sockets.on('connection', function (socket) {
  
  // Make sure once the stream is started,
  //  it can't be restarted
  var started = false;

  socket.on('startStream', function(data) {

  	// Check the flag
  	if(started) return; else started = true;

  	// TODO: Base this off the level-of-detail param
  	var path = __dirname + '/datasets/1-percent/frames.csv';

  	// The current frame count
  	var count = 0;

  	// The frame buffer, which holds the data
  	var rows = [];

  	// How often we send a frame to the client
  	// Ideally, we'd like to stay at 30 fps
  	var throttle = 10; 

    console.log('Beginning frame sending (unthrottled)');

    // Open the CSV, parse it
     csv().fromPath(path)
     .on('data', function(data,index){
        if(data[0] === 'eof') {
          //console.log('Sending frame from');
          //console.log(rows);
          socket.emit('frame', {index: count, frame: rows});

          count++;
          rows = [];
        }

        rows.push(data);
     })
     .on('end', function() {
        console.log('Done sending rows')
     });
  });
 
});
