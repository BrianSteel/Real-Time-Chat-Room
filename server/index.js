require('dotenv').config();
//export express
var express = require('express')

//export socketio
var socket = require('socket.io')

//App setup for express
var app = express();
var helmet = require('helmet');
app.use(helmet({ contentSecurityPolicy: false }));

var server = app.listen(process.env.PORT || 4000, function () {
    console.log('Listening at port ' + (process.env.PORT || 4000))
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
const messageModel = require('../models/message');


//get data from server to the dashboard table
app.get('/list', async (request, response) => {
    try {
        let results = await userListModel.find({}, { "name": 1, "room_name": 1 });
        let obj = {};
        results = results.filter((result) => {
            let answer = (obj[result.room_name] !== 1);
            if (obj[result.room_name] !== 1) {
                obj[result.room_name] = 1;
            }
            return answer;
        });
        response.json(results);
    } catch (err) {
        console.error(err);
        response.status(500).end();
    }
})


//checks for events on connection
io.on('connection', function (socket) {
    socket.on('create', async (data) => {
        const name = (data.name || '').trim();
        const room = (data.room || '').trim();

        if (!name || !room) {
            socket.emit('joinError', { message: 'Name and room cannot be empty.' });
            return;
        }

        const duplicate = users.getUserBasedOnRooms(room).find(u => u.name.toLowerCase() === name.toLowerCase());
        if (duplicate) {
            socket.emit('joinError', { message: `"${name}" is already taken in this room.` });
            return;
        }

        socket.join(room);
        users.addUser(socket.id, name, room);
        io.to(room).emit('appendUser', users.getUserBasedOnRooms(room));
        socket.emit('Admin', { message: 'Admin created chat room ' + room });
        socket.to(room).emit('chat', { message: name + ' has joined ' + room });

        // load message history for this room
        const history = await messageModel.find({ room }).sort({ time: 1 }).limit(50);
        socket.emit('history', history);

        // save to mongodb
        connect.then(() => {
            let userList = new userListModel({ name, room_name: room });
            userList.save();
        });
    })

    //listening and emit to front end of other sockets
    //listening for chat event
    socket.on('chat', function (textData) {
        if (!textData.message || !textData.message.trim()) return;
        let user = users.getUser(socket.id);
        io.in(user.room).emit('chat', { user, textData });

        // persist message
        connect.then(() => {
            new messageModel({ name: user.name, message: textData.message, room: user.room, time: textData.time }).save();
        });
    })

    //listening for typing event
    socket.on('typing', function () {
        let user = users.getUser(socket.id)
        socket.to(user.room).emit('typing', user.name);
    })

    //listening for endTyping event
    socket.on('endTyping', function () {
        let user = users.getUser(socket.id)
        socket.to(user.room).emit('endTyping');
    })


    socket.on('disconnect', function () {
        let user = users.removeUser(socket.id)
        if (!user) return;
        userListModel.deleteOne({ name: user.name }).then(() => {
            socket.to(user.room).emit('appendUser', users.getUserBasedOnRooms(user.room));
            socket.to(user.room).emit('chat', { message: user.name + ' has left ' + user.room });
        })
    })
})
