const path = require('path')
const express = require('express');
const http = require('http');

const app = express();
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);
const room = "mainchat"

const {
    userJoin,
    userLeave,
    checkUsername,
    getUsers,
    checkFull
} = require("./public/utils/users.js");

app.use(express.static(path.join(__dirname, 'public')));

// make sure that message is not empty
// and is not too long
function checkMessage(message) {
    if (message.length <= 0 || message.length > 300) {
        return true
    }
    else {
        return false
    }
}

io.on('connection', (socket) => {

    let name = null; // username for user in chat
    let joined = false; // true if user has joined the chat room
    var logoffTimer;
    // set up for page
    socket.emit('populate online list', getUsers());

    socket.on('join', (username) => {
        if (checkFull()) {
            socket.emit(`alert`, `The chat room is currently full, try again later.`)
        }
        else if (checkUsername(username)) {
            socket.emit('alert', `The inputted username is taken or invalid, try again!`);
        }
        else {
            joined = true;
            name = userJoin(username);
            socket.join(room);
            io.to(room).emit('server message', `${name} has joined the chat!`);
            io.emit('add to online list', name);
            socket.emit('disable username button');
            logoffTimer = setTimeout(() => {
                socket.emit('alert', 'You have been logged off for inactivity');
                socket.disconnect();
            }, 60 * 1000 * 15)
        }
    })

    socket.on('chatMessage', message => {
        if (name === null) {
            socket.emit('alert', "Must provide a username first before you can message!!!");
        }
        else {
            if (checkMessage(message)) {
                socket.emit('alert', 'Message is too long (1000 char limit) or empty!');
            }
            else {
                clearTimeout(logoffTimer);
                socket.broadcast.to(room).emit('message', name, message);
                socket.emit('self message', message)
                // after a succesfull message disable the user from sending another message for three seconds
                socket.emit('message timeout');
                // set new logoffTimer
                logoffTimer = setTimeout(() => {
                    socket.emit('alert', 'You have been logged off for inactivity');
                    socket.disconnect();
                }, 60 * 1000 * 15)
            }
        }
    })

    socket.on('retrieve username', (purpose) => {
        if (joined) {
            if (purpose === 'typing') {
                io.emit('user is typing', name);
            } else if (purpose === 'done typing') {
                io.emit('user is done typing', name);
            }
        }
    })

    socket.on('disconnect', () => {
        if (name !== null) {
            joined = false;
            io.to(room).emit('server message', `${name} has left the chat!`);
            io.emit('remove online user', name);
            userLeave(name);
        }
    });

})

// change 3000 to whatever you want host to be
server.listen(3000, () => {
    console.log('listening on *:3000');
})