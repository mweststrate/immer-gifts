import { useState, useEffect, useCallback, useRef } from "react"

export function useSocket(url, onMessage) {
  const [socket, setSocket] = useState(null)
  const msgHandler = useRef()
  msgHandler.current = onMessage

  useEffect(() => {
    const socket = new WebSocket(url)
    socket.onmessage = event => {
      const data = JSON.parse(event.data)
      msgHandler.current(data)
    }
    setSocket(socket)
    return () => {
      socket.close()
    }
  }, [url, msgHandler])

  return useCallback(
    data => {
      socket.send(JSON.stringify(data))
    },
    [socket]
  )
}
