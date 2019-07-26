/* eslint-disable default-case */
import produce, { applyPatches } from "immer"
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

export const reducer = produce((draft, action) => {
  switch (action.type) {
    case "RESET":
      return initialState
    case "TOGGLE_RESERVE":
      const gift = draft.gifts.find(gift => gift.id === action.id)
      if (gift) {
        switch (gift.reservedBy) {
          case undefined:
            gift.reservedBy = draft.currentUser.id
            break
          case draft.currentUser.id:
            gift.reservedBy = undefined
            break
        }
      }
      break
    case "ADD_GIFT":
      draft.gifts.push({
        id: Math.random() * 100000,
        description: action.gift,
        image: action.image,
        reservedBy: undefined
      })
      break
  }
})
