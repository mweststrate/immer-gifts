import produce from "immer"

import { allUsers, getCurrentUser } from "./misc/users"
import defaultGifts from "./misc/gifts"

export function addGift(state, id, description, image) {
  return produce(state, draft => {
    draft.gifts.push({
      id,
      description,
      image,
      reservedBy: undefined
    })
  })
}

export function toggleReservation(state, giftId) {
  return produce(state, draft => {
    const gift = draft.gifts.find(gift => gift.id === giftId)
    gift.reservedBy =
      gift.reservedBy === undefined
        ? state.currentUser.id
        : gift.reservedBy === state.currentUser.id
        ? undefined
        : gift.reservedBy
  })
}

export function getInitialState() {
  return {
    users: allUsers,
    currentUser: getCurrentUser(),
    gifts: defaultGifts
  }
}
