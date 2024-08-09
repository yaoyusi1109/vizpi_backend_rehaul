const setGroupsSocket = (socket) => {
	socket.on('subscribe groups', (sessionId) => {
		socket.join("groups " + sessionId)
	})

	socket.on('unsubscribe groups', (sessionId) => {
		if (socket.rooms.has("groups " + sessionId))
			socket.leave("groups " + sessionId)
	})
}

module.exports = { setGroupsSocket }