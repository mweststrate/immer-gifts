import produce from "immer"

import { allUsers, getCurrentUser } from "./misc/users"
import defaultGifts from "./misc/gifts.json"

interface Gift {
  readonly id: string
  readonly description: string
  readonly image: string
  readonly reservedBy?: number
}

interface User {
  readonly id: number
  readonly name: string
}

export interface State {
  readonly users: readonly User[]
  readonly currentUser: User
  readonly gifts: readonly Gift[]
}

interface Book {
  readonly isbn: string
  readonly title: string
  readonly cover: {
    readonly medium: string
  }
}

export const addGift = produce((draft: State, id: string, description: string, image: string) => {
  draft.gifts.push({
    id,
    description,
    image,
    reservedBy: undefined
  })
})

export const toggleReservation = produce((draft: State, giftId: string) => {
  const gift = draft.gifts.find(gift => gift.id === giftId)!
  gift.reservedBy =
    gift.reservedBy === undefined
      ? draft.currentUser.id
      : gift.reservedBy === draft.currentUser.id
      ? undefined
      : gift.reservedBy
})

export async function getBookDetails(isbn: string): Promise<Book> {
  const response = await fetch(`http://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`, {
    mode: "cors"
  })
  const book = (await response.json())["ISBN:" + isbn]
  return book
}

export const addBook = produce((draft: State, book: Book) => {
  draft.gifts.push({
    id: book.isbn,
    description: book.title,
    image: book.cover.medium,
    reservedBy: undefined
  })
})

export function getInitialState(): State {
  return {
    users: allUsers,
    currentUser: getCurrentUser(),
    gifts: defaultGifts
  }
}
