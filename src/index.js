/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from "react"
import ReactDOM from "react-dom"
import "./index.css"
import { initialState, patchGeneratingReducer, reducer } from "./gifts"
import { useSocket } from "./utils"

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

  const send = useSocket("ws://localhost:5001", function onMessage(patches) {
    setState(state => reducer(state, { type: "APPLY_PATCHES", patches }))
  })

  const dispatch = useCallback(action => {
    setState(currentState => {
      const [nextState, patches] = patchGeneratingReducer(currentState, action)
      // console.dir(patches)
      send(patches)
      return nextState
    })
  }, [])

  const { users, gifts, currentUser } = state
  // console.dir(state)

  const handleReset = () => {
    dispatch({ type: "RESET" })
  }

  const handleAdd = () => {
    const gift = prompt("Gift to add")
    if (gift)
      dispatch({
        type: "ADD_GIFT",
        gift,
        image: "https://picsum.photos/200?q=" + Math.random()
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
