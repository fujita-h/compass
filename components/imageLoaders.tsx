export const userIconLoader = ({ src, width, height }) => {
  return `/api/files/usericons/${encodeURIComponent(src)}`
}

export const groupIconLoader = ({ src, width, height }) => {
  return `/api/files/groupicons/${encodeURIComponent(src)}`
}
