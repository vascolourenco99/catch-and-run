const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
})

const PORT = 3000
const colors = ['red', 'blue', 'yellow', 'brown']
const players = {}
const initialPosition = {
    x: 50,
    y: 50
}

const MOVE_AMOUNT = 10
const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 400
const PLAYER_SIZE = 20

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    const playerCount = Object.keys(players).length
    const color = colors[playerCount] || 'gray'
    const position = {
        x: initialPosition.x + playerCount * 20,
        y: initialPosition.y + playerCount * 20
    }
    players[socket.id] = { ...position, color }

    // Send the current game state to the new player
    socket.emit('playersUpdate', players)
    io.emit('playersUpdate', players)

    // Handle player movement
    socket.on('move', (direction) => {
        const player = players[socket.id]
        if (!player) return

        // Check boundaries based on the direction
        switch (direction) {
            case 'up':
                if (player.y - MOVE_AMOUNT >= 0) {
                    player.y -= MOVE_AMOUNT
                }
                break
            case 'down':
                if (player.y + MOVE_AMOUNT + PLAYER_SIZE <= CANVAS_HEIGHT) {
                    player.y += MOVE_AMOUNT
                }
                break
            case 'left':
                if (player.x - MOVE_AMOUNT >= 0) {
                    player.x -= MOVE_AMOUNT
                }
                break
            case 'right':
                if (player.x + MOVE_AMOUNT + PLAYER_SIZE <= CANVAS_WIDTH) {
                    player.x += MOVE_AMOUNT
                }
                break
        }

        // Update all players with the new position
        io.emit('playersUpdate', players)
    })

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`)
        delete players[socket.id]

        // Reassign colors
        const remainingPlayers = Object.keys(players)
        remainingPlayers.forEach((id, index) => {
            players[id].color = colors[index] || 'gray'
        })

        io.emit('playersUpdate', players)
    })
})

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
