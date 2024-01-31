const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users-names');

// Get userName and room from url
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const socket = io()

// join chatroom

socket.emit('joinroom', { username, room })


socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})

// Message from server
socket.on('message', message => {
    outputMessage(message)

    chatMessages.scrollTop = chatMessages.scrollHeight

})

// msg sumbit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const msg = e.target.elements.msg.value

    // clear the input
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()

    // emit the message to the server
    socket.emit('ChatMessage', msg)

})

outputMessage = (message) => {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
            <p class="text">
                ${message.text}
            </p>`
    document.querySelector('.chat-messages').appendChild(div)

}


// add room name to dom
outputRoomName = (room) => {
    roomName.innerText = room.room
}

// add users to dom
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}
