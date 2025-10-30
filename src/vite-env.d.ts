/// <reference types="vite/client" />

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

// if your file is literally named avatar.JPG (uppercase)
// TS is case-sensitive about module patterns on some setups,
// so include this too:
declare module '*.JPG' {
  const src: string
  export default src
}
