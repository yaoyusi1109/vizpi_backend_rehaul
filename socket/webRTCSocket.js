const setRTCSocket = (socket) => {
  // Subscribe to RTC group
  socket.on('subscribe RTC', (userId, peerId, groupId) => {
    const room = `RTC ${groupId}`
    socket.to(room).emit('RTC-connection', userId, peerId)
    socket.join(room)
    console.log(`User ${userId} subscribed to RTC group ${groupId}`)
  })

  // Unsubscribe from RTC group
  socket.on('unsubscribe RTC', (userId, peerId, groupId) => {
    const room = `RTC ${groupId}`
    if (socket.rooms && socket.rooms.has(room)) {
      socket.to(room).emit('RTC-disconnection', userId, peerId)
      socket.leave(room)
    }
    console.log(`User ${userId} unsubscribed from RTC group ${groupId}`)
  })
}

module.exports = { setRTCSocket }
