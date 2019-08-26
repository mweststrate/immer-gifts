import produce from "immer"

import { allUsers, getCurrentUser } from "./misc/users"
import defaultGifts from "./misc/gifts"

export const addGift = produce((draft, id, description, image) => {
  draft.gifts.push({
    id,
    description,
    image,
    reservedBy: undefined
  })
})

export function toggleReservation(state, giftId) {
  return {
    ...state,
    gifts: state.gifts.map(gift => {
      if (gift.id !== giftId) return gift
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

export function getInitialState() {
  return {
    users: allUsers,
    currentUser: getCurrentUser(),
    gifts: defaultGifts
  }
}
