/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useRef } from "react"
import ReactDOM from "react-dom"

import "./misc/index.css"
import { initialState, patchGeneratingReducer, reducer } from "./gifts"
import { useSocket } from "./misc/useSocket"

const Gift = React.memo(({ gift, users, currentUser, onReserve }) => (
  <div className={`gift ${gift.reservedBy ? "reserved" : ""}`}>
    <img src={gift.image} alt="gift" />
    <div className="description">
      <h2>{gift.description}</h2>
    </div>
    <div className="reservation">
      {!gift.reservedBy || gift.reservedBy === currentUser.id ? (
        <button onClick={() => onReserve(gift.id)}>{gift.reservedBy ? "Unreserve" : "Reserve"}</button>
      ) : (
        <span>{users[gift.reservedBy].name}</span>
      )}
    </div>
  </div>
))

function GiftList() {
  const [state, setState] = useState(initialState)
  const undoStack = useRef([])
  const undoStackPointer = useRef(-1)

  const send = useSocket("ws://localhost:5001", function onMessage(patches) {
    // update state, don't distribute, don't record undo
    console.dir(patches)
    setState(state => reducer(state, { type: "APPLY_PATCHES", patches }))
  })

  const dispatch = useCallback((action, undoable = true) => {
    setState(currentState => {
      const [nextState, patches, inversePatches] = patchGeneratingReducer(currentState, action)
      // if the changes are made local, we want to...
      // ... record on the undo stack (unless undoing atm)
      if (undoable) {
        const pointer = ++undoStackPointer.current
        undoStack.current.length = pointer
        undoStack.current[pointer] = { patches, inversePatches }
      }
      // ... distribute the changes
      send(patches)
      return nextState
    })
  }, [])

  const { users, gifts, currentUser } = state

  const handleUndo = () => {
    const patches = undoStack.current[undoStackPointer.current].inversePatches
    dispatch({ type: "APPLY_PATCHES", patches }, false)
    undoStackPointer.current--
  }

  const handleRedo = () => {
    undoStackPointer.current++
    const patches = undoStack.current[undoStackPointer.current].patches
    dispatch({ type: "APPLY_PATCHES", patches }, false)
  }

  const handleReset = () => {
    dispatch({ type: "RESET" })
  }

  const handleAdd = () => {
    const gift = prompt("Gift to add")
    if (gift)
      dispatch({
        type: "ADD_GIFT",
        gift,
        image: `https://picsum.photos/id/${Math.round(Math.random() * 1000)}/200/200`
      })
  }

  const handleReserve = useCallback(id => {
    dispatch({
      type: "TOGGLE_RESERVE",
      id
    })
  }, [])

  return (
    <div className="app">
      <div className="header">
        <h1>Hi, {currentUser.name}</h1>
      </div>
      <div className="actions">
        <button onClick={handleUndo} disabled={undoStackPointer.current < 0}>
          Undo
        </button>
        <button onClick={handleRedo} disabled={undoStackPointer.current === undoStack.current.length - 1}>
          Redo
        </button>
        <button onClick={handleAdd}>Add</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      <div className="gifts">
        {Object.entries(gifts).map(([id, gift]) => (
          <Gift key={id} gift={gift} users={users} currentUser={currentUser} onReserve={handleReserve} />
        ))}
      </div>
    </div>
  )
}

ReactDOM.render(<GiftList />, document.getElementById("root"))
