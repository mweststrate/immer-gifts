export const allUsers = [
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐒",
  "🦇",
  "🦉",
  "🦅",
  "🦆",
  "🐦",
  "🐧",
  "🐔",
  "🐺",
  "🐗",
  "🐴",
  "🦄",
  "🐝",
  "🐛",
  "🦋",
  "🐌",
  "🐜",
  "🐢"
].map((emoji, idx) => ({
  id: idx,
  name: emoji
}))

export function getCurrentUser() {
  if (typeof sessionStorage === "undefined") return null // not a browser no current user
  // picks a random user, and stores it on the session storage to preserve identity during hot reloads
  const currentUserId = sessionStorage.getItem("user") || Math.round(Math.random() * (allUsers.length - 1))
  sessionStorage.setItem("user", currentUserId)
  return allUsers[parseInt(currentUserId)]
}
