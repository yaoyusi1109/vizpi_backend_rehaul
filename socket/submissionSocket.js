const setSubmissionSocket = (socket) => {
  socket.on('subscribe submissions', (sessionId) => {
    socket.join("submission " + sessionId)
  })

  socket.on('unsubscribe submissions', () => {
    if (socket.rooms.has("submission"))
      socket.leave("submission")
  })
}

module.exports = { setSubmissionSocket }
