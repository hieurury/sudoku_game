import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import vi from './locales/vi.json'

export type Locale = 'en' | 'vi'

const STORAGE_KEY = 'sudoku_locale'

function getInitialLocale(): Locale {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'vi') return saved
    const browserLang = navigator.language.slice(0, 2)
    return browserLang === 'vi' ? 'vi' : 'en'
}

const i18n = createI18n({
    legacy: false,
    locale: getInitialLocale(),
    fallbackLocale: 'en',
    messages: { en, vi },
})

export function setLocale(locale: Locale) {
    i18n.global.locale.value = locale
    localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
}

export default i18n
