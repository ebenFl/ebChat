var users = []

// function to check whether or not 
// a username is valid
// a valid username isn't already taken, empty, or greater than 20 characters
// and can only contain characters a-zA-Z0-9_-
function checkUsername(username) {
    let result = /^[a-zA-Z0-9\-\_]{1,20}$/.exec(username)
    if(result) {
        if (users.find((u) => u.toLowerCase() === username.toLowerCase()) !== undefined) {
            return true;
        }
        else {
            return false;
        }
    }
    return true;
}

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

// chat room can only have 15 users at a time
function checkFull() {
    if (users.length >= 15) {
        return true;
    }
    return false;
}

// add new user
function userJoin(username) {

    users.push(username);

    return username;
}

// remove username from users
function userLeave(username) {

    users = users.filter((u) => u !== username);

}

function getUsers() {
    return users;
}

module.exports = {
    userJoin,
    userLeave,
    checkUsername,
    getUsers,
    checkFull,
    checkMessage
}