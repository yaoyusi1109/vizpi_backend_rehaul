const setSessionSocket = (socket) => {
  socket.on('subscribe session', (sessionId) => {
    socket.join("session " + sessionId)
  })

  socket.on('unsubscribe session', (sessionId) => {
    if (socket.rooms.has("session " + sessionId))
      socket.leave("session " + sessionId)
  })
}

module.exports = { setSessionSocket }