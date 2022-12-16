import { createI18n } from 'vue-i18n'
import zh from '@/locales/zh.json'

const en = Object.keys(zh).reduce(
  (prev: { [key: string]: string }, cur: string) => {
    prev[cur] = cur
    return prev
  },
  {}
)

export default defineNuxtPlugin(({ vueApp }) => {
  const localeCookie = useCookie('locale')
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: localeCookie.value || 'en',
    messages: {
      en,
      zh,
    },
  })

  vueApp.use(i18n)
})
