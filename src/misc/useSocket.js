import { useEffect, useCallback, useRef } from "react"

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
