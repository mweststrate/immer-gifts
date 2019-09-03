import produce from "immer"

function insertItem(array, index, item) {
  return [...array.slice(0, index), item, ...array.slice(index)]
}

function removeItem(array, index) {
  return array.filter((item, localIndex) => localIndex !== index)
}

function updateObjectInArray(array, index, item) {
  return array.map((localItem, localIndex) => {
    if (localIndex !== index) {
      // This isn't the item we care about - keep it as-is
      return localItem
    }

    // Otherwise, this is the one we want - return an updated value
    return {
      ...localItem,
      ...item
    }
  })
}

function removeItemFromObject(object, key) {
  const copy = { ...object }
  delete copy[key]
  return copy
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
    return {
      ...state,
      floors: {
        ...state.floors,
        [action.floor]: {
          ...state.floors[action.floor],
          dept: {
            ...state.floors[action.floor].dept,
            [action.dept]: {
              ...state.floors[action.floor].dept[action.dept],
              shelves: state.floors[action.floor].dept[action.dept].shelves.map((shelve, index) => {
                return index !== action.shelve
                  ? shelve
                  : {
                      ...shelve,
                      books: [...shelve.books, action.book]
                    }
              })
            }
          }
        }
      }
    }
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
