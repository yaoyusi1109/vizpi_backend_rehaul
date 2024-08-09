const { setGroupSocket } = require("../socket/groupSocket")
const { setGroupsSocket } = require("../socket/groupsSocket")
const { setSessionSocket } = require("../socket/sessionSocket")
const { setSubmissionSocket } = require("../socket/submissionSocket")
const { setupDeepgram, setTranscribeSocket } = require("../socket/transcribeSocket")
const { setRTCSocket } = require("../socket/webRTCSocket")

const socketManager = io => {
  io.on('connect', socket => {
    console.log('New client connected:', socket.id)

    setGroupsSocket(socket)
    setGroupSocket(socket)
    setSessionSocket(socket)
    setSubmissionSocket(socket)
    setRTCSocket(socket)

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })
}

module.exports = { socketManager }
