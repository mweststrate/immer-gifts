export function addGift(state, id, description, image) {
  return {
    ...state,
    gifts: [
      ...state.gifts,
      {
        id,
        description,
        image,
        reservedBy: undefined
      }
    ]
  }
}

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
