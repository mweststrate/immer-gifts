/* eslint-disable default-case */
import produce, { applyPatches, produceWithPatches } from "immer"
import * as uuid from "uuid"

import { allUsers, getCurrentUser } from "./misc/users"
import gifts from "./misc/gifts"

export const initialState = {
  users: allUsers,
  currentUser: getCurrentUser(),
  gifts
}

const giftsProducer = (draft, action) => {
  switch (action.type) {
    case "APPLY_PATCHES":
      return applyPatches(draft, action.patches)
    case "RESET":
      return initialState
    case "TOGGLE_RESERVE":
      const gift = draft.gifts[action.id]
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
      const id = uuid.v4()
      draft.gifts[id] = {
        id,
        description: action.gift,
        image: action.image,
        reservedBy: undefined
      }
      break
  }
}

export const reducer = produce(giftsProducer)

export const patchGeneratingReducer = produceWithPatches(giftsProducer)
