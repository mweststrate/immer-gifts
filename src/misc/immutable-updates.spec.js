import produce from "immer"

function insertItem(array, index, item) {
  return produce(array, draft => {
    draft.splice(index, 0, item)
  })
}

function removeItem(array, index) {
  return produce(array, draft => {
    draft.splice(index, 1)
  })
}

function updateObjectInArray(array, index, item) {
  return produce(array, draft => {
    draft[index] = { ...draft[index], ...item }
  })
}

function removeItemFromObject(object, key) {
  return produce(object, draft => {
    delete draft[key]
  })
}

describe("Simple updates work", () => {
  const gifts = [
    {
      description: "Immer license"
    }
  ]
  Object.freeze(gifts)
  Object.freeze(gifts[0])

  test("insertItem", () => {
    expect(
      insertItem(gifts, {
        description: "egghead subscription"
      }).length
    ).toBe(2)
  })

  test("removeItem", () => {
    expect(removeItem(gifts, 0)).toEqual([])
  })

  test("updateObjectInArray", () => {
    expect(
      updateObjectInArray(gifts, 0, {
        reserved: true
      })
    ).toEqual([
      {
        description: "Immer license",
        reserved: true
      }
    ])
  })

  test("removeItemFromObject", () => {
    expect(
      removeItemFromObject(
        {
          description: "Immer license",
          reserved: true
        },
        "reserved"
      )
    ).toEqual({
      description: "Immer license"
    })
  })
})

describe("a library", () => {
  function storeBook(state, action) {
    return produce(state, draft => {
      draft.floors[action.floor].dept[action.dept].shelves[action.shelve].books.push(action.book)
    })
  }

  const library = {
    employees: [],
    floors: {
      "2nd": {
        dept: {
          "Computer Science": {
            shelves: [
              {
                books: []
              }
            ]
          }
        }
      }
    }
  }

  test("can store books", () => {
    expect(
      storeBook(library, {
        floor: "2nd",
        dept: "Computer Science",
        shelve: 0,
        book: {
          "isbn-123-243": {
            title: "Immer forever!",
            author: "Michel Westrate"
          }
        }
      })
    ).toMatchSnapshot()
  })
})
