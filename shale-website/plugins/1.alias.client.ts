import { Buffer } from 'buffer'

export default defineNuxtPlugin(() => {
  window.Buffer = Buffer
})
