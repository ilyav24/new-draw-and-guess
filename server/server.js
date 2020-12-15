var port = 8000;

// Server code
 var WebSocketServer = require('ws').Server;
 var server = new WebSocketServer({ port: port });
 var User = require('./rules').User;
 var GameRoom = require('./rules').GameRoom;
 var room1=new GameRoom();

server.on('connection', function(socket) {
  var user=new User(socket);
  console.log("A connection has been established");
  room1.addUser(user);
});

console.log("WebSocket server is running.");
console.log("Listening to port " + port + ".");