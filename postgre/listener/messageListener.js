const db = require('../db')
const { messageSubscribers } = require('../../services/socketService')

let isListening = false

const listenForMessage = async (io) => {
  try {
    const client = await db.connectionManager.getConnection()
    await client.query('LISTEN message_channel')
    console.log('Listening for messages...')
    isListening = true

    client.on('notification', async (msg) => {
      const payload = JSON.parse(msg.payload)
      console.log('Received message: ', payload)
      const groupId = payload.data.group_id
      const sessionId = payload.data.session_id
      io.to('group ' + groupId).emit('update message', payload)
      // io.to('groups ' + sessionId).emit('update message', payload)
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
    listenForMessage(io)
  }
}

module.exports = listenForMessage