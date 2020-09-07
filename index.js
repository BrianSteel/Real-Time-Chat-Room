//export express
var express = require('express')

//export socketio
var socket = require('socket.io')

//App setup for express
var app = express();
var server = app.listen(4000, function () {
    console.log('Listening at port 4000')
})


//Serving the static to server
app.use(express.static('public'));


//Socketio setup
var io = socket(server);

//checks for events on connection
io.on('connection', function (socket) {

    socket.on('create', (data, callback) => {
        socket.join(data.room);
        io.to(data.room).emit('Admin', { message: 'Admin ' + data.name + ' created chat room ' + data.room });
        socket.to(data.room).emit('chat', { message: data.name + ' has joined ' + data.room })
        callback();
    })

    //listening and emit to front end of other sockets
    //listening for chat event
    socket.on('chat', function (data) {
        io.in(data.params.room).emit('chat', data);

    })

    //listening for typing event
    socket.on('typing', function (data) {
        socket.to(data[1].room).broadcast.emit('typing', data[0]);
    })

    //listening for endTyping event
    socket.on('endTyping', function (data) {
        socket.to(data.room).broadcast.emit('endTyping');
    })

    socket.on('disconnect', function () {
        console.log('Disconnected')
    })
})









































/*

socket.emit('message', "this is a test"); //sending to sender-client only
socket.broadcast.emit('message', "this is a test"); //sending to all clients except sender
socket.broadcast.to('game').emit('message', 'nice game'); //sending to all clients in 'game' room(channel) except sender
socket.to('game').emit('message', 'enjoy the game'); //sending to sender client, only if they are in 'game' room(channel)
socket.broadcast.to(socketid).emit('message', 'for your eyes only'); //sending to individual socketid
socket.emit(); //send to all connected clients
socket.broadcast.emit(); //send to all connected clients except the one that sent the message
socket.on(); //event listener, can be called on client to execute on server
io.sockets.socket(); //for emiting to specific clients
io.sockets.emit(); //send to all connected clients (same as socket.emit)
io.sockets.on() ; //initial connection from a client.
io.emit('message', "this is a test"); //sending to all clients, include sender
io.in('game').emit('message', 'cool game'); //sending to all clients in 'game' room(channel), include sender
io.of('myNamespace').emit('message', 'gg'); //sending to all clients in namespace 'myNamespace', include sender
*/