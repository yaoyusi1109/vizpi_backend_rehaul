const express = require('express')
const session = require('express-session')
const https = require('https')
const http = require('http')
const fs = require('fs')
const socketIo = require('socket.io')
const db = require('./postgre/db')
const VERSION = 'v1'
const listenForSubmissions = require('./postgre/listener/submissionListener')
const listenForSession = require('./postgre/listener/sessionListener')
const listenForMessage = require('./postgre/listener/messageListener')
const listenForGroup = require('./postgre/listener/groupListener')
const { socketManager } = require('./services/socketService')
const setupSwagger = require('./services/swaggerService')
const passport = require('./general/passportConfig')

const cors = require('cors')
const { setTranscribeSocket } = require('./socket/transcribeSocket')

const app = express()

app.use(cors({
  origin: ['https://localhost:3000', 'http://localhost:3000', 'https://vizpi.org', 'https://vizpin.netlify.app', 'https://vizpi.netlify.app', 'https://vizpin.netlify.app', 'https://vizpi.netlify.app', 'https://vizpi-testing.netlify.app'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}))
app.use(express.json())
app.use((error, req, res, next) => {
  console.error(error.stack)
  res.status(500).send('Something broke!')
})
app.get('/', (req, res) => res.send('INDEX'))
app.use('/api/' + VERSION + '/chat', require('./routes/chatRoute'))
app.use('/api/' + VERSION + '/codes', require('./routes/codesRoute'))
app.use('/api/' + VERSION + '/groups', require('./routes/groupsRoute'))
app.use('/api/' + VERSION + '/instructors', require('./routes/instructorsRoute'))
app.use('/api/' + VERSION + '/sessions', require('./routes/sessionsRoute'))
app.use('/api/' + VERSION + '/users', require('./routes/usersRoute'))
app.use('/api/' + VERSION + '/gpt', require('./routes/gptRoute'))
app.use('/api/' + VERSION + '/submissions', require('./routes/submissionsRoute'))
app.use('/api/' + VERSION, require('./routes/authRoute'))
app.use('/api/' + VERSION + '/reviews', require('./routes/reviewRoute'))

app.use(passport.initialize())
app.use(passport.session())
setupSwagger(app)

// const privateKey = fs.readFileSync('certificate/private.key', 'utf8')
// const certificate = fs.readFileSync('certificate/certificate.crt', 'utf8')
// const caBundle = fs.readFileSync('certificate/ca_bundle.crt', 'utf8')

// const credentials = { key: privateKey, cert: certificate, ca: caBundle }


// const server = https.createServer(credentials, app)
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: ['https://localhost:3000', 'http://localhost:3000', 'https://vizpi.org', 'https://vizpin.netlify.app', 'https://vizpi.netlify.app', 'https://vizpin.netlify.app', 'https://vizpi.netlify.app', 'https://vizpi-testing.netlify.app'],
    methods: ["GET", "POST"],
    credentials: true
  }
})
socketManager(io)
setTranscribeSocket(server)



db.authenticate()
  .then(() => {
    listenForSubmissions(io)
    listenForSession(io)
    listenForMessage(io)
    listenForGroup(io)
    console.log('Database connected...')
  })
  .catch(err => console.log('Error: ' + err))

const PORT = process.env.PORT || 5000

server.listen(PORT, console.log(`Server started on port ${PORT}`))