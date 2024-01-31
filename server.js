require('dotenv').config()
const path = require('path')
const express = require("express")
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server);


// set static files
app.use(express.static(path.join(__dirname, '_html_css')))


// run when clients connect
io.on('connection',
    socket => {

        socket.on('joinroom', ({ username, room }) => {
            const user = userJoin(socket.id, username, room)

            socket.join(user.room)

            // welcome current user
            socket.emit('message', formatMessage('ChatCord Bot', 'Welcome to ChatCord'))

            // broadcast when a user connect
            socket.broadcast.to(user.room).emit('message', formatMessage('ChatCord Bot', `${user.username} has joined the room`))

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })


        })


        // runs when clients disconnects
        socket.on('disconnect', () => {
            const user = userLeave(socket.id)
            console.log(user)
            if (user) {
                io.to(user.room).emit('message', formatMessage('ChatCord', `${user.username} has left the room`))
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                })
            }

        })

        // Listen for chatmessage
        socket.on('ChatMessage', (msg) => {

            const user = getCurrentUser(socket.id)


            io.to(user.room).emit('message', formatMessage(user.username, msg))
        })
    }

)


server.listen(process.env.PORT, () => { console.log(`Server running in PORT ${process.env.PORT}`) })