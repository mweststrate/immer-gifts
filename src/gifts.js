export function addGift(state, id, description, image) {
  state.gifts.push({
    id,
    description,
    image,
    reservedBy: undefined
  })
}

export function toggleReservation(state, giftId) {
  const gift = state.gifts.find(gift => gift.id === giftId)
  gift.reservedBy =
    gift.reservedBy === undefined
      ? state.currentUser.id
      : gift.reservedBy === state.currentUser.id
      ? undefined
      : gift.reservedBy
}
