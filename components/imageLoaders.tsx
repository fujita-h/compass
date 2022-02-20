export const userIconLoader = ({ src }) => {
  return `/api/files/usericons/${encodeURIComponent(src)}`
}

export const groupIconLoader = ({ src }) => {
  return `/api/files/groupicons/${encodeURIComponent(src)}`
}
