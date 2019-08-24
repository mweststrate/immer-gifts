/* eslint-disable default-case */
import { allUsers, getCurrentUser } from "./users"

export const initialState = {
  users: allUsers,
  currentUser: getCurrentUser(),
  gifts: [
    {
      id: 1,
      description: "Immer license",
      image: "https://raw.githubusercontent.com/immerjs/immer/master/images/immer-logo.png",
      reservedBy: allUsers[5].id
    },
    {
      id: 2,
      description: "Egghead.io subscription",
      image: "https://pbs.twimg.com/profile_images/735242324293210112/H8YfgQHP_400x400.jpg",
      reservedBy: allUsers[21].id
    },
    {
      id: 3,
      description: "The Complete Circle Series",
      image: "https://images-na.ssl-images-amazon.com/images/I/41kCKME78kL.jpg",
      reservedBy: undefined
    }
  ]
}

export function toggleReservation(state, id) {
  return {
    ...state,
    gifts: state.gifts.map(gift => {
      if (gift.id !== id) return gift
      return {
        ...gift,
        reservedBy:
          gift.reservedBy === undefined
            ? state.currentUser.id
            : gift.reservedBy === state.currentUser.id
            ? undefined
            : gift.reservedBy
      }
    })
  }
}

export function addGift(state, gift, image) {
  return {
    ...state,
    gifts: [
      ...state.gifts,
      {
        id: Math.random() * 100000,
        description: gift,
        image,
        reservedBy: undefined
      }
    ]
  }
}

export async function addBook(state, isbn) {
  const response = await fetch(`http://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`, {
    mode: "cors"
  })
  const book = (await response.json())["ISBN:" + isbn]
  return {
    ...state,
    gifts: [
      ...state.gifts,
      {
        id: isbn,
        description: book.title,
        image: book.cover.medium,
        reservedBy: undefined
      }
    ]
  }
}
