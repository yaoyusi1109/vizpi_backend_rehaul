const db = require('../db')
const { sessionSubscribers } = require('../../services/socketService')

let isListening = false

const listenForGroup = async (io) => {
  try {
    const client = await db.connectionManager.getConnection()
    await client.query('LISTEN group_channel')
    console.log('Listening for groups...')
    isListening = true

    client.on('notification', async (msg) => {
      const payload = JSON.parse(msg.payload)
      console.log('Received group: ', payload)
      const groupId = payload.data.id
      const sessionId = payload.data.session_id
      io.to('group ' + groupId).emit('update group', payload)
      io.to('groups ' + sessionId).emit('update group', payload)
    })

    client.on('end', async () => {
      console.log('Connection ended, attempting to reconnect...')
      isListening = false
      reconnect(io)
    })

  } catch (err) {
    console.error('Error in listening for groups: ', err)
    reconnect(io)
  }
}

const reconnect = async (io) => {
  if (!isListening) {
    await new Promise(resolve => setTimeout(resolve, 5000))
    listenForGroup(io)
  }
}

module.exports = listenForGroup