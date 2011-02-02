var http = require('http');
var fs = require('fs');
var io = require('socket.io');

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  fs.readFile('index.html', function (err, data) {
    if (err) res.end(err.toString());
    else res.end(data);
  });
});
server.listen(8051);

var socket = io.listen(server, {
  flashPolicyServer: false,
  transports: ['htmlfile', 'xhr-multipart', 'xhr-polling', 'jsonp-polling']
});
var clients = [];
socket.on('connection', function (client) {
  for(var i in clients) {
    clients[i].send("Conn count: " + clients.length);
  }
  clients.push(client);
});
socket.on('disconnect', function (client) {

});


var clients = [];
clients.usernames = function(client) {
  return client.username;
}

socket.on('connection', function(client) {

  client.on('message', function(data) {
    if ((/^(USERNAME:).*$/ig).test(data)) {
      var parts = data.split(":");
      var username = parts[1];

      if (!username || username == '') {
        client.send(json({announcement:"You must specify a username. Please reload the app."}));
        return;
      }

      var usernames = clients.map(clients.usernames);
      if (usernames.indexOf(username) >= 0) {
        client.send(json({announcement:"Username in use"}));
        return;
      }

      client.username = username;

      client.broadcast(json({announcement:client.username+' joined'}));
      console.log(client.sessionId + " = " + client.username);
      client.send(json({messages:buffer}));
      client.send(json({userlist:usernames}));
      client.send(json({announcement:"Connected!"}));

      clients.push(client);
      return;
    } 

    if (!client.username) {
      client.send(json({announcement:"You must specify a username. Please reload the app."}));
      return;
    }

    var message = {'user':client.sessionId, 'username':client.username, 'message':data};
    buffer.push(message);
    if (buffer.length > MAXBUF) {
      buffer.shift();
    }
    client.broadcast(json(message));
  });

  client.on('disconnect', function() {
    if (client.username) {
      client.broadcast(json({announcement:(client.username)+' left chat'}));
    }
    var pos = clients.indexOf(client);
    if (pos >= 0) {
      clients.splice(pos, 1);
    }
  });
});
