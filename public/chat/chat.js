//const e = require("express");

(function(){
//Make connection with socketio from the front end
const socket = io();


//Variables to work on DOM
const sender = document.getElementById('sender');
const messageInput = document.getElementById('message');
const btn = document.querySelector('#text-msg-btn');
const task = document.getElementById('task');
let em = document.createElement('em');
const messages = document.getElementById('messages');
const returnBtn = document.querySelector('.return-btn');




//Socket connections - socket.on
//Final socket connection that affects the front end
//On connect do smth
socket.on('connect', function () {
    //Use params
    let query = window.location.search.substring(1);
    let params = JSON.parse('{"' + decodeURI(query).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g, '":"') + '"}');
    socket.emit('create', params)
});

socket.on('Admin', (data) => {
    const p = document.getElementById('user-log');
    p.innerText = data.message;
})

//Listen for backend socket event and add messages
socket.on('chat', (data) => {
    //removes the typing tag
    em.textContent = "";
    //appends the message
    const p1 = document.createElement('p');
    const p2 = document.createElement('p');
    if (data.user) {
        const span = document.createElement('span');
        const b = document.createElement('b');
        b.textContent = `${data.user.name} `;
        const t = getDateFrom(data.textData.time);
        span.textContent = t;
        p1.append(b, span)
        p2.textContent = `${data.textData.message}`;
        p2.classList.add('new-text');
        
    }else{
        p2.textContent = data.message;
        p2.classList.add('user-log');
    }
    messages.append(p1, p2)
    scrollToBottom()
    //This is the chat message input field going empty after hit enter or click
    message.value = "";
})

//Listen for backend socket event and typing of user
socket.on('typing', (data) => {
    em.textContent = `${data} is now typing...`;
    task.append(em);
    scrollToBottom()
})

//Listen for backend socket event and deleting typed words
socket.on('endTyping', () => {
    em.textContent = '';
    task.append(em);
})

socket.on('appendUser', function(users){
    let user_list = document.getElementById('user-list-wrapper');
    user_list.innerHTML="";
    for(let user of users){
        const li = document.createElement('li');
        li.innerText = user.name;
        user_list.append(li);
    }
})



//functions 
function scrollToBottom() {
    const messageContainer = document.getElementById('messages-window-wrapper')
    let scrollDiff = (messageContainer.scrollHeight - messageContainer.scrollTop) - messageContainer.clientHeight;
    if (scrollDiff < 300) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
}

function getDateFrom(time) {
    const newDate = new Date(time)
    const t = `${newDate.getHours()} : ${newDate.getMinutes()}`
    return t;
}










//Event listeners
//Event listener for chat emit - click
btn.addEventListener('click', function () {
    socket.emit('chat', {
        message: messageInput.value,
        time: new Date().getTime(),
    })
    return false;
})

returnBtn.addEventListener('click', (e) => {
    window.location.href = "../index.html"
})

//Event listener for chat emit - enter
messageInput.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        //cancel any default action if any
        event.preventDefault();
        //emits to backend
        socket.emit('chat', {
            message: messageInput.value,
            time: new Date().getTime(),
        })
    }
    return false;
})

//Event listener for endTyping emit - keyup
messageInput.addEventListener('keyup', function (event) {

    if (event.keyCode === 8 && messageInput.value === "") {
        socket.emit('endTyping');
    }
    return false;

})

//Event listener for Typing emit - keypress
messageInput.addEventListener('keypress', function () {
    socket.emit('typing');
    return false;
})

})()