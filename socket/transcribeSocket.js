const { createClient, LiveTranscriptionEvents } = require("@deepgram/sdk")
const WebSocket = require("ws")

let deepgramClient = null

const setDeepgramClient = () => {
  try {
    deepgramClient = createClient(process.env.DEEPGRAM_API_KEY)
  } catch (e) {
    console.error("Error in setting up deepgram client", e)
    throw e
  }
}

const setupDeepgram = (ws, keepAliveRef) => {
  if (!deepgramClient) {
    try {
      setDeepgramClient()
    } catch (e) {
      return
    }
  }
  let deepgram = deepgramClient.listen.live({
    smart_format: true,
    model: "nova-2",
  })

  if (keepAliveRef.current) clearInterval(keepAliveRef.current)
  keepAliveRef.current = setInterval(() => {
    // console.log("deepgram: keepalive")
    try {
      if (deepgram && deepgram.getReadyState() === 1 /* OPEN */) {
        deepgram.keepAlive()
      }
    } catch (e) {
      console.log("Error in keepAlive", e)
    }
  }, 10 * 1000)

  deepgram.addListener(LiveTranscriptionEvents.Open, async () => {
    // console.log("deepgram: connected")

    deepgram.addListener(LiveTranscriptionEvents.Transcript, (data) => {
      try {
        // console.log("deepgram: transcript received")
        // console.log("ws: transcript sent to client")
        ws.send(JSON.stringify(data))
      } catch (error) {
        console.error("ws: error sending transcript to client", error)
      }
    })

    deepgram.addListener(LiveTranscriptionEvents.Close, async () => {
      // console.log("deepgram: disconnected")
      clearInterval(keepAliveRef.current)
      deepgram.finish()
    })

    deepgram.addListener(LiveTranscriptionEvents.Error, async (error) => {
      console.log("deepgram: error received")
      console.error(error)
    })

    deepgram.addListener(LiveTranscriptionEvents.Warning, async (warning) => {
      console.log("deepgram: warning received")
      console.warn(warning)
    })

    deepgram.addListener(LiveTranscriptionEvents.Metadata, (data) => {
      try {
        // console.log("deepgram: metadata received")
        // console.log("ws: metadata sent to client")
        ws.send(JSON.stringify({ metadata: data }))
      } catch (error) {
        console.error("ws: error sending metadata to client", error)
      }
    })
  })

  return deepgram
}

const setTranscribeSocket = (server) => {
  const wss = new WebSocket.Server({
    path: "/transcribe",
    server,
  })

  wss.on("connection", (ws) => {
    console.log("ws: client connected")
    const keepAliveRef = { current: null }
    let deepgram = setupDeepgram(ws, keepAliveRef)

    ws.on("message", (message) => {
      try {
        console.log("ws: client data received")

        if (deepgram.getReadyState() === 1 /* OPEN */) {
          console.log("ws: data sent to deepgram")
          deepgram.send(message)
        } else if (deepgram.getReadyState() >= 2 /* 2 = CLOSING, 3 = CLOSED */) {
          console.log("ws: data couldn't be sent to deepgram")
          console.log("ws: retrying connection to deepgram")
          /* Attempt to reopen the Deepgram connection */
          deepgram.finish()
          deepgram.removeAllListeners()
          deepgram = setupDeepgram(ws, keepAliveRef)
        } else {
          console.log("ws: data couldn't be sent to deepgram")
        }
      } catch (error) {
        console.error("ws: error handling client message", error)
      }
    })

    ws.on("close", () => {
      console.log("ws: client disconnected")
      clearInterval(keepAliveRef.current)
      try {
        if (deepgram) {
          deepgram.finish()
          deepgram.removeAllListeners()
          deepgram = null
        }
      } catch (error) {
        console.error("ws: error during client disconnect cleanup", error)
      }
    })

    ws.on("error", (error) => {
      console.error("ws: client connection error", error)
      clearInterval(keepAliveRef.current)
      try {
        if (deepgram) {
          deepgram.finish()
          deepgram.removeAllListeners()
        }
      } catch (deepgramError) {
        console.error("ws: error during deepgram cleanup on connection error", deepgramError)
      }
    })
  })

  wss.on("error", (error) => {
    console.error("wss: server error", error)
  })
}

module.exports = { setTranscribeSocket }