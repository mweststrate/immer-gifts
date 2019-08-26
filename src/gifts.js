import produce from "immer"

import { allUsers, getCurrentUser } from "./misc/users"
import defaultGifts from "./misc/gifts"

export function getInitialState() {
  return {
    users: allUsers,
    currentUser: getCurrentUser(),
    gifts: defaultGifts
  }
}
