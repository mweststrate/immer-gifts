import React, { useState, useCallback, memo } from "react"
import ReactDOM from "react-dom"
import uuidv4 from "uuid/v4"

import { useSocket } from "./misc/useSocket"

import "./misc/index.css"

import { getInitialState, giftsReducer, getBookDetails, patchGeneratingGiftsReducer } from "./gifts"

const Gift = memo(function Gift({ gift, users, currentUser, onReserve }) {
  return (
    <div className={`gift ${gift.reservedBy ? "reserved" : ""}`}>
      <img src={gift.image} alt={gift.description} />
      <div className="description">
        <h2>{gift.description}</h2>
      </div>
      <div className="reservation">
        {!gift.reservedBy ? (
          <button onClick={() => onReserve(gift.id)}>Reserve</button>
        ) : gift.reservedBy === currentUser.id ? (
          <button onClick={() => onReserve(gift.id)}>Unreserve</button>
        ) : (
          <span>{users[gift.reservedBy].name}</span>
        )}
      </div>
    </div>
  )
})

function GiftList() {
  const [state, setState] = useState(() => getInitialState())
  const { users, gifts, currentUser } = state

  const dispatch = useCallback(action => {
    setState(currentState => {
      const [nextState, patches] = patchGeneratingGiftsReducer(currentState, action)
      send(patches)
      return nextState
    })
  }, [])

  const send = useSocket("ws://localhost:5001", function onMessage(patches) {
    // we received some patches!
    setState(state => giftsReducer(state, { type: "APPLY_PATCHES", patches }))
  })

  const handleAdd = () => {
    const description = prompt("Gift to add")
    if (description) {
      dispatch({
        type: "ADD_GIFT",
        id: uuidv4(),
        description,
        image: `https://picsum.photos/id/${Math.round(Math.random() * 1000)}/200/200`
      })
    }
  }

  const handleReserve = useCallback(id => {
    dispatch({
      type: "TOGGLE_RESERVATION",
      id
    })
  }, [])

  const handleReset = () => {
    dispatch({
      type: "RESET"
    })
  }

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

  return (
    <div className="app">
      <div className="header">
        <h1>Hi, {currentUser.name}</h1>
      </div>
      <div className="actions">
        <button onClick={handleAdd}>Add</button>
        <button onClick={handleAddBook}>Add Book</button>
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
