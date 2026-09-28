const Server = require('./models/server')

require('dotenv').config()

// Log stray rejections instead of crashing; a restart loop multiplies processes on shared hosting
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
})

const server = new Server()

server.listen()