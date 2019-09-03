import { Server as WebSocketServer } from "ws"

import gifts from "./src/misc/gifts.json"
import { produceWithPatches, applyPatches } from "immer"

const initialState = { gifts }

const wss = new WebSocketServer({ port: 5001 })

const connections = []

let history = []

wss.on("connection", ws => {
  console.log("New connection!")
  connections.push(ws)

  ws.on("message", message => {
    console.log(message)
    // append all the patches
    history.push(...JSON.parse(message))
    connections
      .filter(client => client !== ws)
      .forEach(client => {
        client.send(message)
      })
  })

  ws.on("close", () => {
    const idx = connections.indexOf(ws)
    if (idx !== -1) connections.splice(idx, 1)
  })

  // send all the patches we received
  ws.send(JSON.stringify(history))
})

function compressHistory(currentPatches) {
  const [, patches] = produceWithPatches(initialState, draft => {
    return applyPatches(draft, currentPatches)
  })
  console.log(`compressed from ${currentPatches.length} to ${patches.length} patches`)
  return patches
}

setInterval(() => {
  history = compressHistory(history)
}, 5000)
