import { giftsReducer, getBookDetails, patchGeneratingGiftsReducer } from "./gifts"
import { applyPatches } from "immer"

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
      id: "immer_license",
      description: "Immer license",
      image: "https://raw.githubusercontent.com/immerjs/immer/master/images/immer-logo.png",
      reservedBy: 2
    },
    {
      id: "egghead_subscription",
      description: "Egghead.io subscription",
      image: "https://pbs.twimg.com/profile_images/735242324293210112/H8YfgQHP_400x400.jpg",
      reservedBy: undefined
    }
  ]
}

describe("Adding a gift", () => {
  const nextState = giftsReducer(initialState, {
    type: "ADD_GIFT",
    id: "mug",
    description: "Coffee mug",
    image: ""
  })

  test("added a gift to the collection", () => {
    expect(nextState.gifts.length).toBe(3)
  })

  test("didn't modify the original state", () => {
    expect(initialState.gifts.length).toBe(2)
  })
})

describe("Reserving an unreserved gift", () => {
  const nextState = giftsReducer(initialState, {
    type: "TOGGLE_RESERVATION",
    id: "egghead_subscription"
  })

  test("correctly stores reservedBy", () => {
    expect(nextState.gifts[1].reservedBy).toBe(1) // Test user
  })

  test("didn't the original state", () => {
    expect(initialState.gifts[1].reservedBy).toBe(undefined)
  })

  test("does structurally share unchanged state parts", () => {
    expect(nextState.gifts[0]).toBe(initialState.gifts[0])
  })

  test("can't accidentally modify the produced state", () => {
    expect(() => {
      nextState.gifts[1].reservedBy = undefined
    }).toThrow("read only")
  })
})

describe("Reserving an unreserved gift with patches", () => {
  const [nextState, patches] = patchGeneratingGiftsReducer(initialState, {
    type: "TOGGLE_RESERVATION",
    id: "egghead_subscription"
  })

  test("correctly stores reservedBy", () => {
    expect(nextState.gifts[1].reservedBy).toBe(1) // Test user
  })

  test("generates the correct patches", () => {
    expect(patches).toEqual([
      {
        op: "replace",
        path: ["gifts", 1, "reservedBy"],
        value: 1
      }
    ])
  })

  test("replaying patches produces the same state - 1", () => {
    expect(applyPatches(initialState, patches)).toEqual(nextState)
  })
})

describe("Reserving an already reserved gift", () => {
  const nextState = giftsReducer(initialState, {
    type: "TOGGLE_RESERVATION",
    id: "immer_license"
  })

  test("preserves stored reservedBy", () => {
    expect(nextState.gifts[0].reservedBy).toBe(2) // Someone else
  })

  test("still produces a new gift", () => {
    expect(nextState.gifts[0]).toEqual(initialState.gifts[0])
    expect(nextState.gifts[0]).toBe(initialState.gifts[0])
  })

  test("still produces a new state", () => {
    expect(nextState).toEqual(initialState)
    expect(nextState).toBe(initialState)
  })
})

describe("Can add books async", () => {
  test("Can add math book", async () => {
    const book = await getBookDetails("0201558025")
    const nextState = giftsReducer(initialState, { type: "ADD_BOOK", book })
    expect(nextState.gifts[2].description).toBe("Concrete mathematics")
  })

  test("Can add two books in parallel", async () => {
    const promise1 = getBookDetails("0201558025")
    const promise2 = getBookDetails("9781598560169")
    const nextState = giftsReducer(giftsReducer(initialState, { type: "ADD_BOOK", book: await promise1 }), {
      type: "ADD_BOOK",
      book: await promise2
    })
    expect(nextState.gifts.length).toBe(4)
  })
})
