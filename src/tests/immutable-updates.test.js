import deepfreeze from "deepfreeze"
import produce from "immer"
/**
 * Inspired by https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns
 */

const base = deepfreeze([
  {
    title: "Learn about immutable updates",
    done: true
  },
  {
    title: "Learn immer",
    done: false
  }
])

it("immutably inserts or removes items from arrays", () => {
  // function insertItem(array, action) {
  //   return [...array.slice(0, action.index), action.item, ...array.slice(action.index)]
  // }

  // function removeItem(array, action) {
  //   return [...array.slice(0, action.index), ...array.slice(action.index + 1)]
  // }

  // function insertItem(array, action) {
  //   let newArray = array.slice()
  //   newArray.splice(action.index, 0, action.item)
  //   return newArray
  // }

  // function removeItem(array, action) {
  //   let newArray = array.slice()
  //   newArray.splice(action.index, 1)
  //   return newArray
  // }

  function insertItem(array, action) {
    return produce(array, draft => {
      draft.splice(action.index, 0, action.item)
    })
  }

  function removeItem(array, action) {
    return produce(array, draft => {
      draft.splice(action.index, 1)
    })
  }

  expect(() => base.splice(0, 1)).toThrow("Cannot assign to read only property '0' of object '[object Array]'")

  const copy1 = insertItem(base, {
    index: 1,
    item: {
      title: "Immer basics",
      done: false
    }
  })

  expect(base).toHaveLength(2)
  expect(copy1).toHaveLength(3)
  expect(base[0]).toBe(copy1[0])
  expect(copy1[1].title).toBe("Immer basics")

  const copy2 = removeItem(copy1, { index: 1 })
  expect(copy2).toHaveLength(2)
  expect(copy2[0]).toBe(base[0])
})

it("immutably updates an item in an array", () => {
  // function updateObjectInArray(array, action) {
  //   return array.map((item, index) => {
  //     if (index !== action.index) {
  //       // This isn't the item we care about - keep it as-is
  //       return item
  //     }

  //     // Otherwise, this is the one we want - return an updated value
  //     return {
  //       ...item,
  //       ...action.item
  //     }
  //   })
  // }

  // function updateObjectInArray(array, action) {
  //   return produce(array, draft => {
  //     draft[action.index] = action.item
  //   })
  // }

  const updateObjectInArray = produce((draft, action) => {
    draft[action.index] = action.item
  })

  const copy = updateObjectInArray(base, {
    index: 1,
    item: {
      ...base[1],
      done: true
    }
  })

  expect(base[1].done).toBe(false)
  expect(copy[1].done).toBe(true)
  expect(copy[1]).not.toBe(base[1])
  expect(copy[0]).toBe(base[0])
})

it("immutably updates a deep object", () => {
  // function storeBook(state, action) {
  //   return {
  //     ...state,
  //     floors: {
  //       ...state.floors,
  //       [action.floor]: {
  //         ...state.floors[action.floor],
  //         dept: {
  //           ...state.floors[action.floor].dept,
  //           [action.dept]: {
  //             ...state.floors[action.floor].dept[action.dept],
  //             shelves: state.floors[action.floor].dept[action.dept].shelves.map((shelve, index) => {
  //               return index !== action.shelve
  //                 ? shelve
  //                 : {
  //                     ...shelve,
  //                     books: [...shelve.books, action.book]
  //                   }
  //             })
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  // function storeBook(state, action) {
  //   return produce(state, draft => {
  //     draft.floors[action.floor].dept[action.dept].shelves[action.shelve].books.push(action.book)
  //   })
  // }

  const storeBook = produce((draft, action) => {
    draft.floors[action.floor].dept[action.dept].shelves[action.shelve].books.push(action.book)
  })

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

  const library2 = storeBook(library, {
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

  expect(library.floors["2nd"].dept["Computer Science"].shelves[0].books).toEqual([])
  expect(library2.floors["2nd"].dept["Computer Science"].shelves[0].books).toEqual([
    {
      "isbn-123-243": {
        title: "Immer forever!",
        author: "Michel Westrate"
      }
    }
  ])
})
