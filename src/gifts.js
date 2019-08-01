/* eslint-disable default-case */
import produce, { applyPatches } from "immer"
import { allUsers, getCurrentUser } from "./users"
import { produceWithPatches } from "./utils"
import * as uuid from "uuid"

export const initialState = {
  users: allUsers,
  currentUser: getCurrentUser(),
  gifts: {
    "ade6f3cb-c36e-45c2-b4d7-d1e50d129801": {
      id: "ade6f3cb-c36e-45c2-b4d7-d1e50d129801",
      description: "Immer license",
      image: "https://raw.githubusercontent.com/immerjs/immer/master/images/immer-logo.png",
      reservedBy: allUsers[5].id
    },
    "fe54c511-737a-4e6f-bc50-aa221bcf43cd": {
      id: "fe54c511-737a-4e6f-bc50-aa221bcf43cd",
      description: "Egghead.io subscription",
      image: "https://pbs.twimg.com/profile_images/735242324293210112/H8YfgQHP_400x400.jpg",
      reservedBy: allUsers[21].id
    },
    "0acbb5ad-128e-4256-8f8d-cbc0a7737456": {
      id: "0acbb5ad-128e-4256-8f8d-cbc0a7737456",
      description: "The Complete Circle Series",
      image: "https://images-na.ssl-images-amazon.com/images/I/41kCKME78kL.jpg",
      reservedBy: undefined
    }
  }
}

const giftsProducer = (draft, action) => {
  switch (action.type) {
    case "APPLY_PATCHES":
      applyPatches(draft, action.patches)
      // TODO: fix that this also works for reset!
      break
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
