import deepfreeze from "deepfreeze"
import produce from "immer"

import { toggleReservation, addGift } from "./gifts"

const initialState = {
  users: [
    {
      id: 1,
      name: "Test user"
    },
    {
      id: 2,
      name: "Someone else"
    }
  ],
  currentUser: {
    id: 1,
    name: "Test user"
  },
  gifts: [
    {
      id: 1,
      description: "Immer license",
      image: "https://raw.githubusercontent.com/immerjs/immer/master/images/immer-logo.png",
      reservedBy: 2
    },
    {
      id: 2,
      description: "Egghead.io subscription",
      image: "https://pbs.twimg.com/profile_images/735242324293210112/H8YfgQHP_400x400.jpg",
      reservedBy: undefined
    }
  ]
}

describe("Reserving an unreserved gift", () => {
  const nextState = toggleReservation(initialState, 2)

  test("correctly stores reservedBy", () => {
    expect(nextState.gifts[1].reservedBy).toBe(1)
  })

  test("does not modify the original state", () => {
    expect(initialState.gifts[1].reservedBy).toBe(undefined)
  })

  // Lesson 2
  test("does structurally share unchanged state parts", () => {
    expect(nextState.gifts[0]).toBe(initialState.gifts[0])
  })
})

// Lesson 2
describe("Reserving an already reserved gift", () => {
  const nextState = toggleReservation(initialState, 1)

  test("preserves stored reservedBy", () => {
    expect(nextState.gifts[0].reservedBy).toBe(2)
  })

  test("still produces a new gift", () => {
    expect(nextState.gifts[0]).toEqual(initialState.gifts[0])
    expect(nextState.gifts[0]).not.toBe(initialState.gifts[0]) // !
  })
})
