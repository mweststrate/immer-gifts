import { useState, useEffect, useCallback, useRef } from "react"
import produce from "immer"

export function useSocket(url, onMessage) {
  const socket = useRef()
  const msgHandler = useRef()
  msgHandler.current = onMessage

  useEffect(() => {
    const createdSocket = new WebSocket(url)
    createdSocket.onmessage = event => {
      const data = JSON.parse(event.data)
      msgHandler.current(data)
    }
    socket.current = createdSocket
    console.log("created socket to " + url)
    return () => {
      console.log("socket disconnected")
      createdSocket.close()
    }
  }, [url])

  return useCallback(data => {
    socket.current.send(JSON.stringify(data))
  }, [])
}

export function produceWithPatches(arg1, arg2) {
  if (typeof arg1 === "function") {
    return (state, ...args) => produceWithPatches(state, draft => arg1(draft, ...args))
  }
  // non-curried form
  let patches, inversePatches
  const nextState = produce(arg1, arg2, (p, ip) => {
    patches = p
    inversePatches = ip
  })
  return [nextState, patches, inversePatches]
}
