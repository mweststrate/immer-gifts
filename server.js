var WebSocketServer = require("ws").Server
var wss = new WebSocketServer({ port: 5001 })

/**
 * Connected clients
 */
const connections = {
  X: undefined,
  O: undefined
}

/**
 * Game(s) history as seen by server
 */
const history = []

wss.on("connection", function connection(ws) {
  /**
   * Check if game isn't full
   */
  if (connections.X && connections.O) {
    console.log("Refused connection, game full")
    ws.send(
      JSON.stringify({
        type: "welcome",
        player: null
      })
    )
    return
  }

  /**
   * Assign player, save WS connection
   */
  const player = !connections.X ? "X" : "O"
  connections[player] = ws
  console.log("Player " + player + " connected")

  /**
   * Hanle new messages / closing
   */
  ws.on("message", function incoming(message) {
    const recipient = player === "X" ? "O" : "X"
    console.log(player, message)
    history.push(...JSON.parse(message).patches)
    if (connections[recipient]) connections[recipient].send(message)
  })
  ws.on("close", function() {
    connections[player] = undefined
  })

  /**
   * Send initial player assignment an game state
   */
  ws.send(
    JSON.stringify({
      type: "welcome",
      player
    })
  )
  ws.send(
    JSON.stringify({
      type: "patches",
      patches: history
    })
  )
})
