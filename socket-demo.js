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
clients.usernames = function(client) {
  return client.username;
}

socket.on('connection', function(client) {

  client.on('message', function(data) {
    if ((/^(USERNAME:).*$/ig).test(data)) {
      var parts = data.split(":");
      var username = parts[1];

      if (!username || username == '') {
        client.send(JSON.stringify({announcement:"You must specify a username. Please reload the app."}));
        return;
      }

      var usernames = clients.map(clients.usernames);
      if (usernames.indexOf(username) >= 0) {
        client.send(JSON.stringify({announcement:"Username in use"}));
        return;
      }

      client.username = username;

      client.broadcast(JSON.stringify({announcement:client.username+' joined'}));
      console.log(client.sessionId + " = " + client.username);
      client.send(JSON.stringify({messages:buffer}));
      client.send(JSON.stringify({userlist:usernames}));
      client.send(JSON.stringify({announcement:"Connected!"}));

      clients.push(client);
      return;
    } 

    if (!client.username) {
      client.send(JSON.stringify({announcement:"You must specify a username. Please reload the app."}));
      return;
    }

    var message = {'user':client.sessionId, 'username':client.username, 'message':data};
    buffer.push(message);
    if (buffer.length > MAXBUF) {
      buffer.shift();
    }
    client.broadcast(JSON.stringify(message));
  });

  client.on('disconnect', function() {
    if (client.username) {
      client.broadcast(JSON.stringify({announcement:(client.username)+' left chat'}));
    }
    var pos = clients.indexOf(client);
    if (pos >= 0) {
      clients.splice(pos, 1);
    }
  });
});
