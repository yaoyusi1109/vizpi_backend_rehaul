const db = require('../db')
const { sessionSubscribers } = require('../../services/socketService')

let isListening = false

const listenForSession = async (io) => {
  try {
    const client = await db.connectionManager.getConnection()
    await client.query('LISTEN session_channel')
    console.log('Listening for sessions...')
    isListening = true

    client.on('notification', async (msg) => {
      const payload = JSON.parse(msg.payload)
      console.log('Received session: ', payload)
      const sessionId = payload.data.id
      io.to('session ' + sessionId).emit('update session', payload)
    })

    client.on('end', async () => {
      console.log('Connection ended, attempting to reconnect...')
      isListening = false
      reconnect(io)
    })

  } catch (err) {
    console.error('Error in listening for submissions: ', err)
    reconnect(io)
  }
}

const reconnect = async (io) => {
  if (!isListening) {
    await new Promise(resolve => setTimeout(resolve, 5000))
    listenForSession(io)
  }
}

module.exports = listenForSession