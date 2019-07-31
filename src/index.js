import React, { useState, useCallback } from "react"
import ReactDOM from "react-dom"
import "./index.css"
import { initialState, toggleReservation, addGift } from "./gifts"

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
  const { users, gifts, currentUser } = state

  const handleReset = () => {
    setState(state => initialState)
  }

  const handleAdd = () => {
    const gift = prompt("Gift to add")
    if (gift) setState(state => addGift(state, gift, "https://picsum.photos/200?q=" + Math.random()))
  }

  const handleReserve = useCallback(id => {
    setState(state => toggleReservation(state, id))
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
        {gifts.map(gift => (
          <Gift key={gift.id} gift={gift} users={users} currentUser={currentUser} onReserve={handleReserve} />
        ))}
      </div>
    </div>
  )
}

ReactDOM.render(<GiftList />, document.getElementById("root"))
