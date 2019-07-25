import produce, { createDraft, finishDraft } from "immer"

it("immutably updates a deep object", async () => {
  // function storeBook(state, action) {
  //   return produce(state, draft => {
  //     draft.floors[action.floor].dept[action.dept].shelves[action.shelve].books.push(action.book)
  //   })
  // }

  // const storeBook = produce((draft, action) => {
  //   draft.floors[action.floor].dept[action.dept].shelves[action.shelve].books.push(action.book)
  // })

  // function storeBook(state, action) {
  //   const draft = createDraft(state)
  //   draft.floors[action.floor].dept[action.dept].shelves[action.shelve].books.push(action.book)
  //   return finishDraft(draft)
  // }

  // async function storeBook(state, action) {
  //   const draft = createDraft(state);
  //   const data = await (await fetch(
  //     "https://openlibrary.org/api/books?bibkeys=ISBN:0451526538&format=json"
  //   )).json();
  //   draft.floors[action.floor].dept[action.dept].shelves[
  //     action.shelve
  //   ].books.push(data);
  //   return finishDraft(draft);
  // }

  // async function storeBook(state, action) {
  //   return produce(state, async draft => {
  //     const data = await (await fetch("https://openlibrary.org/api/books?bibkeys=ISBN:0451526538&format=json")).json()
  //     draft.floors[action.floor].dept[action.dept].shelves[action.shelve].books.push(data)
  //   })
  // }

  async function storeBook(state, action) {
    const data = await (await fetch("https://openlibrary.org/api/books?bibkeys=ISBN:0451526538&format=json")).json()
    return produce(state, draft => {
      draft.floors[action.floor].dept[action.dept].shelves[action.shelve].books.push(data)
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

  const library2 = await storeBook(library, {
    floor: "2nd",
    dept: "Computer Science",
    shelve: 0
    // book: {
    //   "isbn-123-243": {
    //     title: "Immer forever!",
    //     author: "Michel Westrate"
    //   }
    // }
  })

  expect(library.floors["2nd"].dept["Computer Science"].shelves[0].books).toEqual([])
  expect(library2.floors["2nd"].dept["Computer Science"].shelves[0].books).toMatchInlineSnapshot(`
    Array [
      Object {
        "ISBN:0451526538": Object {
          "bib_key": "ISBN:0451526538",
          "info_url": "https://openlibrary.org/books/OL1017798M/The_adventures_of_Tom_Sawyer",
          "preview": "noview",
          "preview_url": "https://openlibrary.org/books/OL1017798M/The_adventures_of_Tom_Sawyer",
          "thumbnail_url": "https://covers.openlibrary.org/b/id/295577-S.jpg",
        },
      },
    ]
  `)
})
