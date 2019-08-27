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
  gifts: {
    immer_license: {
      id: "immer_license",
      description: "Immer license",
      image: "https://raw.githubusercontent.com/immerjs/immer/master/images/immer-logo.png",
      reservedBy: 2
    },
    egghead_subscription: {
      id: "egghead_subscription",
      description: "Egghead.io subscription",
      image: "https://pbs.twimg.com/profile_images/735242324293210112/H8YfgQHP_400x400.jpg",
      reservedBy: undefined
    }
  }
}

describe("Adding a gift", () => {
  const nextState = giftsReducer(initialState, {
    type: "ADD_GIFT",
    id: "mug",
    description: "Coffee mug",
    image: ""
  })

  test("added a gift to the collection", () => {
    expect(Object.keys(nextState.gifts).length).toBe(3)
  })

  test("didn't modify the original state", () => {
    expect(Object.keys(initialState.gifts).length).toBe(2)
  })
})

describe("Reserving an unreserved gift", () => {
  const nextState = giftsReducer(initialState, {
    type: "TOGGLE_RESERVATION",
    id: "egghead_subscription"
  })

  test("correctly stores reservedBy", () => {
    expect(nextState.gifts["egghead_subscription"].reservedBy).toBe(1) // Test user
  })

  test("didn't the original state", () => {
    expect(initialState.gifts["egghead_subscription"].reservedBy).toBe(undefined)
  })

  test("does structurally share unchanged state parts", () => {
    expect(nextState.gifts["immer_license"]).toBe(initialState.gifts["immer_license"])
  })

  test("can't accidentally modify the produced state", () => {
    expect(() => {
      nextState.gifts["egghead_subscription"].reservedBy = undefined
    }).toThrow("read only")
  })
})

describe("Reserving an unreserved gift with patches", () => {
  const [nextState, patches, inversePatches] = patchGeneratingGiftsReducer(initialState, {
    type: "TOGGLE_RESERVATION",
    id: "egghead_subscription"
  })

  test("correctly stores reservedBy", () => {
    expect(nextState.gifts["egghead_subscription"].reservedBy).toBe(1) // Test user
  })

  test("generates the correct patches", () => {
    expect(patches).toEqual([
      {
        op: "replace",
        path: ["gifts", "egghead_subscription", "reservedBy"],
        value: 1
      }
    ])
  })

  test("generates the correct inverse patches", () => {
    expect(inversePatches).toMatchInlineSnapshot(`
    Array [
      Object {
        "op": "replace",
        "path": Array [
          "gifts",
          "egghead_subscription",
          "reservedBy",
        ],
        "value": undefined,
      },
    ]
  `)
  })

  test("replaying patches produces the same state - 1", () => {
    expect(applyPatches(initialState, patches)).toEqual(nextState)
  })

  test("reversing patches goes back to the original", () => {
    expect(applyPatches(nextState, inversePatches)).toEqual(initialState)
  })

  test("replaying patches produces the same state - 2", () => {
    expect(
      giftsReducer(initialState, {
        type: "APPLY_PATCHES",
        patches
      })
    ).toEqual(nextState)
  })
})

describe("Reserving an already reserved gift", () => {
  const nextState = giftsReducer(initialState, {
    type: "TOGGLE_RESERVATION",
    id: "immer_license"
  })

  test("preserves stored reservedBy", () => {
    expect(nextState.gifts["immer_license"].reservedBy).toBe(2) // Someone else
  })

  test("still produces a new gift", () => {
    expect(nextState.gifts["immer_license"]).toEqual(initialState.gifts["immer_license"])
    expect(nextState.gifts["immer_license"]).toBe(initialState.gifts["immer_license"])
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
    expect(nextState.gifts["0201558025"].description).toBe("Concrete mathematics")
  })

  test("Can add two books in parallel", async () => {
    const promise1 = getBookDetails("0201558025")
    const promise2 = getBookDetails("9781598560169")
    const nextState = giftsReducer(giftsReducer(initialState, { type: "ADD_BOOK", book: await promise1 }), {
      type: "ADD_BOOK",
      book: await promise2
    })
    expect(Object.keys(nextState.gifts).length).toBe(4)
  })
})
