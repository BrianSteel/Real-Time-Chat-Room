//const e = require('express');

(function () {
    const addBtn = document.querySelector('.btn');
    const backIcon = document.querySelector('.back-icon');
    const joinRoomBox = document.querySelector('#join-room-container');
    const chatListBox = document.querySelector('#chat-list-container');
    const room_input = document.getElementById('room-name-input');
    //const joinBtn = document.querySelector('.submit-btn');

    //fetch data from db to table
    async function getData() {
        const response = await fetch('/list');
        const list_data = await response.json();
        if (list_data) {
            const table = document.getElementById('table');
            const tr1 = document.createElement('tr');
            const th1 = document.createElement('th');
            const th2 = document.createElement('th');
            const th3 = document.createElement('th');
            table.append(tr1)
            th1.textContent = "Room Name";
            th2.textContent = "Admin";
            th3.textContent = "Action";
            tr1.append(th1, th2, th3);
            let count = 0;
            list_data.forEach((data) => {
                const tr2 = document.createElement('tr');
                const td1 = document.createElement('td');
                td1.classList.add('room-col');
                const td2 = document.createElement('td');
                const td3 = document.createElement('td');
                const green_icon_div = document.createElement('div');
                green_icon_div.classList.add('green-icon')
                const room_name_span = document.createElement('span');
                room_name_span.textContent = data.room_name;
                td2.textContent = data.name;
                td3.textContent = "JOIN";
                td3.id = count.toString();
                td3.classList.add('join-button');
                td1.append(green_icon_div, room_name_span);
                tr2.append(td1, td2, td3);
                table.append(tr2);
                count++;
                //event listener for join
                td3.addEventListener('click', () => {
                    chatListBox.classList.add('display');
                    joinRoomBox.classList.remove('display');
                    let joinInputValue = list_data.filter((data, i) => {
                        return (i.toString() === td3.id);
                    })
                    room_input.value = joinInputValue[0].room_name;
                })
            })
        } else {
            const div_no_table = document.getElementById('no-table');
            const p = document.createElement('p');
            p.innerText = "Not a single room created yet";
            div_no_table.append(p)
            div_no_table.classList.add('center-no-table');
        }
    }

    getData()

    //controller for the join room window -> login room window
    addBtn.addEventListener('click', () => {
        chatListBox.classList.add('display');
        joinRoomBox.classList.remove('display');
    })

    //controller for the login room window -> join room window
    backIcon.addEventListener('click', () => {
        room_input.value = "";
        chatListBox.classList.remove('display');
        joinRoomBox.classList.add('display');
    })

    //prevents enter to go to chat html from login due to enter on the form
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    })
})();

