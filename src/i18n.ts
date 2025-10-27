import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false, 
    ns: [
      'common', 'aliancePartnerships', 'casino', 'explore', 'menu', 'tournament', 'referral', 'gameDetail', 'login',
      'bonus', 'finance', 'profile', 'popup', 'vip', 'transaction', 'information', 'aboutUs', 
      'responsibleGaming', 'fairness', 'faq', 'termOfService', 'toast', 'vipFaq', 'chat', 'game_info',
      'vipBonusPopup'
    ],
    // defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: `/locales/{{lng}}/{{ns}}.json?v=${import.meta.env.VITE_VERSION}`,
    },
  })

export default i18n
