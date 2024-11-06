<template>
  <div id="app">
    <canvas ref="gameCanvas" width="600" height="400"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import socket from './socket'

const gameCanvas = ref(null)
let animationFrameId

const players = {}

onMounted(() => {
    const canvas = gameCanvas.value
    const ctx = canvas.getContext('2d')

    socket.on('playersUpdate', (data) => {
        Object.assign(players, data)
    })

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        let playerNumber = 1 // To assign player numbers

        for (const id in players) {
            const player = players[id]

            // Draw the player's square
            ctx.fillStyle = player.color
            ctx.fillRect(player.x, player.y, 20, 20)

            // Draw the player label
            ctx.fillStyle = 'black'
            ctx.font = '12px Arial'
            ctx.fillText(`Goparityriano ${playerNumber}`, player.x, player.y - 5)

            playerNumber += 1
        }
    }


    const gameLoop = () => {
        draw()
        animationFrameId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    const handleKeyDown = (event) => {
        switch (event.key) {
            case 'ArrowUp':
                socket.emit('move', 'up')
                break
            case 'ArrowDown':
                socket.emit('move', 'down')
                break
            case 'ArrowLeft':
                socket.emit('move', 'left')
                break
            case 'ArrowRight':
                socket.emit('move', 'right')
                break
        }
    }

    window.addEventListener('keydown', handleKeyDown)

    onUnmounted(() => {
        cancelAnimationFrame(animationFrameId)
        socket.off('playersUpdate')
        window.removeEventListener('keydown', handleKeyDown)
    })
})
</script>

<style scoped>
#app {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
canvas {
  border: 1px solid #000;
  background-color: white;
}
</style>
