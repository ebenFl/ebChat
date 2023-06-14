const path = require('path')
const express = require('express');
const http = require('http');

const app = express();
const socketio = require('socket.io');

const NodeCache = require("node-cache");
const msgCache = new NodeCache({stdTTL: 60 * 15, checkperiod: 120});

const server = http.createServer(app);
const io = socketio(server);
const room = "mainchat"

const {
    userJoin,
    userLeave,
    checkUsername,
    getUsers,
    checkFull,
    checkMessage
} = require("./public/utils/users.js");

app.use(express.static(path.join(__dirname, 'public')));



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
            // populate message history here
            let msgs = msgCache.keys();
            for (const k of msgs) {
                let msg = msgCache.get(k);
                if (msg !== undefined) {
                    socket.emit('message', msg.name, msg.msg);
                }
            }
            // initial inactivity timer set
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
                socket.emit('alert', 'Message is too long (300 char limit) or empty!');
            }
            else {
                clearTimeout(logoffTimer);
                socket.broadcast.to(room).emit('message', name, message);
                socket.emit('self message', message)
                // cache message on success 
                let curTime = new Date();
                msgCache.set(curTime.getTime().toString(), {'name': name, 'msg': message});
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