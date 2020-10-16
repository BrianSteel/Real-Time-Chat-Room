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
var { Users } = require('./utils/users.js');

//Socketio setup
var io = socket(server);
var users = new Users();

//connecting to db
const { connect, connectLog } = require('./dbconnection');
const userListModel = require('../models/list');
//const { deleteOne } = require('../models/list'); <- THis is nothing ignore


//get data from server to the dashboard table
app.get('/list', (request, response) => {
    userListModel.find({}, { "name": 1, "room_name": 1 }, function (err, results) {
        if (err) {
            response.end()
            console.error(err);
            return;
        }
        //algorithm for filtering and sending only the admins/creators of the room info from db
        let obj = {}
        results = results.filter((result) => {
            let answer = (obj[result.room_name] !== 1);
            if (obj[result.room_name] !== 1) {
                obj[result.room_name] = 1;
            }
            return answer
        })
        response.json(results);
        obj = {};
    });
})


//checks for events on connection
io.on('connection', function (socket) {
    socket.on('create', (data) => {

        socket.join(data.room);
        //users.removeUser(socket.id);
        users.addUser(socket.id, data.name, data.room);
        io.to(data.room).emit('appendUser', users.getUserBasedOnRooms(data.room));
        socket.emit('Admin', { message: 'Admin created chat room ' + data.room });
        socket.to(data.room).emit('chat', { message: data.name + ' has joined ' + data.room });

        //saves to mongodb 
        connect.then(db => {
            let userList = new userListModel({ name: data.name, room_name: data.room })
            userList.save();
        })
    })

    //listening and emit to front end of other sockets
    //listening for chat event
    socket.on('chat', function (textData) {
        let user = users.getUser(socket.id)
        io.in(user.room).emit('chat', {
            user,
            textData
        });
    })

    //listening for typing event
    socket.on('typing', function () {
        let user = users.getUser(socket.id)
        socket.to(user.room).broadcast.emit('typing', user.name);
    })

    //listening for endTyping event
    socket.on('endTyping', function () {
        let user = users.getUser(socket.id)
        socket.to(user.room).broadcast.emit('endTyping');
    })


    socket.on('disconnect', function () {
        let user = users.removeUser(socket.id)
        userListModel.deleteOne({ name: user.name }).then(() => {
            socket.to(user.room).emit('appendUser', users.getUserBasedOnRooms(user.room));
            socket.to(user.room).emit('chat', { message: user.name + ' has left ' + user.room });
        })
    })
})
