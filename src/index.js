/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, memo, useCallback, useRef } from "react"
import ReactDOM from "react-dom"
import uuidv4 from "uuid/v4"

import { getInitialState, getBookDetails, patchGeneratingGiftsReducer } from "./gifts"

import "./misc/index.css"
import { useSocket } from "./misc/useSocket"
import { giftsReducer } from "./gifts"

const Gift = memo(({ gift, users, currentUser, onReserve }) => (
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
  const [state, setState] = useState(() => getInitialState())
  const undoStack = useRef([])
  const undoStackPointer = useRef(-1)

  const { users, gifts, currentUser } = state

  const dispatch = useCallback((action, undoable = true) => {
    setState(currentState => {
      const [nextState, patches, inversePatches] = patchGeneratingGiftsReducer(currentState, action)
      send(patches) // always send patches
      if (undoable) {
        const pointer = ++undoStackPointer.current
        undoStack.current.length = pointer
        undoStack.current[pointer] = { patches, inversePatches }
      }
      return nextState
    })
  }, [])

  const send = useSocket("ws://localhost:5001", function onMessage(patches) {
    // we received some patches
    setState(state => giftsReducer(state, { type: "APPLY_PATCHES", patches }))
  })

  const handleUndo = () => {
    if (undoStackPointer.current < 0) return
    const patches = undoStack.current[undoStackPointer.current].inversePatches
    dispatch({ type: "APPLY_PATCHES", patches }, false)
    undoStackPointer.current--
  }

  const handleRedo = () => {
    if (undoStackPointer.current === undoStack.current.length - 1) return
    undoStackPointer.current++
    const patches = undoStack.current[undoStackPointer.current].patches
    dispatch({ type: "APPLY_PATCHES", patches }, false)
  }

  const handleAdd = () => {
    const description = prompt("Gift to add")
    if (description)
      dispatch({
        type: "ADD_GIFT",
        id: uuidv4(),
        description,
        image: `https://picsum.photos/id/${Math.round(Math.random() * 1000)}/200/200`
      })
  }

  const handleReserve = useCallback(id => {
    dispatch({
      type: "TOGGLE_RESERVATION",
      id
    })
  }, [])

  const handleAddBook = async () => {
    const isbn = prompt("Enter ISBN number", "0201558025")
    if (isbn) {
      const book = await getBookDetails(isbn)
      dispatch({
        type: "ADD_BOOK",
        book
      })
    }
  }

  const handleReset = () => {
    dispatch({ type: "RESET" })
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Hi, {currentUser.name}</h1>
      </div>
      <div className="actions">
        <button onClick={handleAdd}>Add</button>
        <button onClick={handleAddBook}>Add Book</button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleUndo} disabled={undoStackPointer.current < 0}>
          Undo
        </button>
        <button onClick={handleRedo} disabled={undoStackPointer.current === undoStack.current.length - 1}>
          Redo
        </button>
      </div>
      <div className="gifts">
        {Object.values(gifts).map(gift => (
          <Gift key={gift.id} gift={gift} users={users} currentUser={currentUser} onReserve={handleReserve} />
        ))}
      </div>
    </div>
  )
}

ReactDOM.render(<GiftList />, document.getElementById("root"))
