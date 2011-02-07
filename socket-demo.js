var http = require('http');
var fs = require('fs');
var io = require('socket.io');
var express = require('express');

var app = express.createServer();

app.configure(function(){
  app.use(express.staticProvider(__dirname + '/public'));
});

app.get('/', function(req, res, next){
  res.render('./public/index.html');
});
app.listen(process.ENV['app_port'], process.ENV['app_host']);

var socket = io.listen(app, {
  flashPolicyServer: false,
  // transports: ['websocket', 'flashsocket', 'htmlfile', 'xhr-multipart', 'xhr-polling', 'jsonp-polling']
  // transports: ['websocket', 'flashsocket', 'htmlfile', 'xhr-multipart', 'jsonp-polling']
  transports: ['websocket']
});

socket.on('connection', function(client) {
  var my_timer;
  var my_client = client;
  my_timer = setInterval(function () {
    my_client.send(JSON.stringify({ timestamp: (new Date()).getTime() }));
  }, 1000);
  
  client.on('message', function(data) {
    console.log(data);
  });

  client.on('disconnect', function() {
    clearTimeout(my_timer);
    console.log('disconnect');
  });
});
