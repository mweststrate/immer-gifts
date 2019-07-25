import produce, { applyPatches } from "immer"

export const initialState = {
  player: null,
  squares: Array(9).fill(null),
  xIsNext: true
}

export function calculateWinner(squares) {
  const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return null
}

export const producer = (draft, action) => {
  switch (action.type) {
    case "welcome":
      if (!action.player) throw new Error("Game full")
      draft.player = action.player
      break
    case "patches":
      applyPatches(draft, action.patches)
      break
    case "place":
      const squares = draft.squares
      if ((draft.player === "X") !== draft.xIsNext || calculateWinner(squares) || squares[action.square]) break
      squares[action.square] = draft.xIsNext ? "X" : "O"
      draft.xIsNext = !draft.xIsNext
      break
    case "reset":
      // avoid resetting 'player'!
      draft.squares = initialState.squares
      draft.xIsNext = initialState.xIsNext
      break
    default:
  }
}

export const reducer = produce(producer)

export const reducerWithPatches = (state, action) => {
  let patches, inversePatches
  const nextState = produce(
    state,
    draft => producer(draft, action),
    (p, i) => {
      patches = p
      inversePatches = i
    }
  )
  return [nextState, patches, inversePatches]
}
