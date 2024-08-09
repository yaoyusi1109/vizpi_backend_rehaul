const db = require('../db')

const listenForSubmissions = async (io) => {
  try {
    const client = await db.connectionManager.getConnection()
    await client.query('LISTEN submission_channel')
    console.log('Listening for submissions...')
    let isListening = true

    client.on('notification', async (msg) => {
      const payload = JSON.parse(msg.payload)
      console.log('Received submission: ', payload)
      const sessionId = payload.data.session_id
      io.to('submission ' + sessionId).emit('update submission', payload)
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
  await new Promise(resolve => setTimeout(resolve, 5000)) // Wait for 5 seconds before reconnecting
  listenForSubmissions(io)

}

module.exports = listenForSubmissions