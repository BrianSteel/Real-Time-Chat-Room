//Make connection with socketio from the front end
const socket = io();


//Variables to work on DOM
const sender = document.getElementById('sender');
const messageInput = document.getElementById('message');
const btn = document.querySelector('button');
const task = document.getElementById('task');
let em = document.createElement('em');
const messages = document.getElementById('messages');
//Use params
let query = window.location.search.substring(1);
let params = JSON.parse('{"' + decodeURI(query).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g, '":"') + '"}');




//Socket connections - socket.on
//Final socket connection that affects the front end
//On connect do smth
socket.on('connect', function () {
    console.log('Connected to server')

    socket.emit('create', params, function (err) {
        if (err) {
            alert('err in joining');
            location.href = '/';
        } else {
            console.log('joined');
        }
    })
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
    if (data.sender && data.time) {
        console.log('hey')
        const span = document.createElement('span');
        const b = document.createElement('b');
        b.textContent = `${data.sender} `;
        const t = getDateFrom(data.time);
        span.textContent = t;
        p1.append(b, span)
    }
    p2.textContent = `${data.message}`;
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



//functions 
function scrollToBottom() {
    const messageContainer = document.getElementById('messages-window-wrapper')
    let scrollDiff = (messageContainer.scrollHeight - messageContainer.scrollTop) - messageContainer.clientHeight;
    if (scrollDiff < 300) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
}


//Add Users to side bar
function createUserList() {
    const userDiv = document.querySelector('.side-section-container');
    const ul = document.createElement('ul');
    const li = document.createElement('li');
    li.textContent = params.name;
    ul.append(li);
    userDiv.append(ul);
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
        sender: sender.value,
        time: new Date().getTime(),
        params
    })
    return false;
})

//Event listener for chat emit - enter
messageInput.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        //cancel any default action if any
        event.preventDefault();
        //emits to backend
        socket.emit('chat', {
            message: messageInput.value,
            sender: sender.value,
            time: new Date().getTime(),
            params
        })
    }
    return false;
})

//Event listener for endTyping emit - keyup
messageInput.addEventListener('keyup', function (event) {

    if (event.keyCode === 8 && messageInput.value === "") {
        socket.emit('endTyping', params);
    }
    return false;

})

//Event listener for Typing emit - keypress
messageInput.addEventListener('keypress', function () {
    socket.emit('typing', [sender.value, params]);
    return false;
})
