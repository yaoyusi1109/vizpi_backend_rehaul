const setGroupSocket = (socket) => {
  socket.on('subscribe group', (groupId) => {
    console.log('Subscribing to group ' + groupId)
    socket.join("group " + groupId)
    socket.join("group " + -1)
  })

  socket.on('unsubscribe group', (groupId) => {
    if (socket.rooms.has("group " + groupId))
      socket.leave("group " + groupId)
  })
}

module.exports = { setGroupSocket }
