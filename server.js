import { Server as WebSocketServer } from "ws"
import { applyPatches, produceWithPatches } from "immer"
import { initialState } from "./src/gifts"

const wss = new WebSocketServer({ port: 5001 })

/**
 * Connected clients
 */
const connections = []

/**
 * State as seen by server
 */
let history = []

wss.on("connection", function connection(ws) {
  /**
   * Assign player, save WS connection
   */
  connections.push(ws)
  console.log("New client connected")

  /**
   * Hanle new messages / closing
   */
  ws.on("message", function incoming(message) {
    console.log(message)
    history.push(...JSON.parse(message))
    connections
      .filter(client => client !== ws)
      .forEach(client => {
        client.send(message)
      })
  })

  /**
   * Remove connection upon close
   */
  ws.on("close", function() {
    const idx = connections.indexOf(ws)
    if (idx !== -1) connections.splice(idx, 1)
  })

  /**
   * Send initial state
   */
  ws.send(JSON.stringify(history))
})

// TODO: test
export function compressHistory(currentPatches) {
  console.log(JSON.stringify(currentPatches, null, 2))
  const [_finalState, patches] = produceWithPatches(initialState, draft => {
    return applyPatches(draft, currentPatches)
  })
  console.log(`compressed patches from ${history.length} to ${patches.length} patches`)
  console.log(JSON.stringify(patches, null, 2))
  return patches
}

setInterval(() => {
  history = compressHistory(history)
}, 5000)
