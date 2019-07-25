import React, { useState, useRef } from "react"
import ReactDOM from "react-dom"
import "./index.css"
import { initialState, calculateWinner, reducerWithPatches } from "./game"
import { applyPatches } from "immer"
import { useSocket } from "./utils"

const Square = ({ value, onClick }) => (
  <button className="square" onClick={onClick}>
    {value}
  </button>
)

function Game() {
  const send = useSocket("ws://localhost:5001", data => {
    dispatch(data, false)
  })
  const [state, setState] = useState(initialState)
  const undoState = useRef([])

  const dispatch = (action, submitPatches = true) => {
    setState(state => {
      const [nextState, patches, inversePatches] = reducerWithPatches(state, action)
      if (submitPatches) {
        undoState.current.push(inversePatches)
        send({ type: "patches", patches })
      }
      return nextState
    })
  }

  const handleClick = i => {
    dispatch({
      type: "place",
      square: i
    })
  }

  const handleReset = () => {
    undoState.current = []
    dispatch({ type: "reset" })
  }

  const undoLastMove = () => {
    const patches = undoState.current.pop()
    if (patches) {
      setState(applyPatches(state, patches))
      send({ type: "patches", patches })
    }
  }

  const winner = calculateWinner(state.squares)

  let status = winner ? "Winner: " + winner : "Next player: " + (state.xIsNext ? "X" : "O")

  return (
    <div className="game">
      <div className="board">
        {state.squares.map((value, index) => (
          <Square key={index} value={value} onClick={() => handleClick(index)} />
        ))}
      </div>
      <div className="status">
        <h1>Player {state.player}</h1>
        {status}
        <button onClick={undoLastMove}>Undo</button>
        <button onClick={handleReset}>Restart</button>
      </div>
    </div>
  )
}

ReactDOM.render(<Game />, document.getElementById("root"))
