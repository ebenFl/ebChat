const socket = io();
const chatForm = document.getElementById("messageForm");
const messages = document.getElementById("messages");
const usernameForm = document.getElementById("usernameEntry");
const onlineList = document.getElementById("onlineUsers");
const messageBox = document.getElementById("userMsgBox")
const messageButton = document.getElementById("messageButton");
const usernameBox = document.getElementById("username");
const usernameButton = document.getElementById("usernameButton");

socket.on('message', (username, message) => {
    addMessage(username + ': ' + message);

    var box = document.getElementById("messageBox");

    box.scrollTop = box.scrollHeight;
})

socket.on('server message', (message) => {
    addServerMessage(message);

    var box = document.getElementById("messageBox");

    box.scrollTop = box.scrollHeight;
})

socket.on('self message', (message) => {
    addSelfMessage(message);

    var box = document.getElementById("messageBox");

    box.scrollTop = box.scrollHeight;
})

socket.on('message timeout', () => {
    messageButton.disabled = true;
    setTimeout(() => { messageButton.disabled = false; }, 3000);
})

socket.on('disable username button', () => {
    usernameButton.disabled = true;
    usernameBox.disabled = true;
})

socket.on('alert', (m) => {
    alert(m);
})

socket.on('add to online list', (name) => {
    addUser(name);
})

socket.on('populate online list', (activeUsers) => {
    for (let i = 0; i < activeUsers.length; i += 1) {
        addUser(activeUsers[i]);
    }
})

socket.on('remove online user', (name) => {
    removeUser(name);
})

socket.on('user is typing', (name) => {
    let user = document.getElementById(name);
    user.textContent = name + " (typing)";
})

socket.on('user is done typing', (name) => {
    let user = document.getElementById(name);
    user.textContent = name;
})

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.userMsgBox.value;

    socket.emit("chatMessage", msg);

    // clear message when user tries to submit
    e.target.elements.userMsgBox.value = '';
    e.target.elements.userMsgBox.focus();
})

usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = e.target.elements.username.value;
    socket.emit("join", name);
})

// when a user focuses on the message box we 
// signal to update their status in the online list as typing
messageBox.addEventListener('focus', (e) => {
    socket.emit('retrieve username', 'typing');
})

// when a user unfocuses from the message box
// we remove their typing status
messageBox.addEventListener('blur', (e) => {
    socket.emit('retrieve username', 'done typing');
})

// adds a user with username to the online list
function addUser(username) {
    var u = document.createElement('li');
    u.textContent = username;
    u.id = username;
    u.classList.add("list-group-item");
    u.classList.add("border-0");
    onlineList.appendChild(u);
}

// removes a user with username from the online list
function removeUser(username) {
    let u = document.getElementById(username);
    if (u !== null) {
        onlineList.removeChild(u);
    }
}

// adds a message to the chat box
function addMessage(message) {
    var m = document.createElement('li');
    m.textContent = message;
    m.classList.add("list-group-item");
    m.classList.add("border-0");
    messages.appendChild(m);
}

function addSelfMessage(message) {
    var d = document.createElement('div');
    d.classList.add('d-flex');
    d.classList.add('justify-content-end');
    var m = document.createElement('li');
    m.textContent = message;
    m.classList.add("list-group-item");
    m.classList.add("border-0")
    d.appendChild(m)
    messages.appendChild(d);
}

function addServerMessage(message) {
    var m = document.createElement('li');
    m.textContent = message;
    m.classList.add("list-group-item");
    m.classList.add("list-group-item-info");
    m.classList.add("border-0")
    messages.appendChild(m);
}
