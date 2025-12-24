import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

export const supportedLanguages = [
  'ar', // 阿拉伯语
  'bg', // 保加利亚语
  'bn', // 孟加拉语
  'cs', // 捷克语
  'da', // 丹麦语
  'de', // 德语
  'el', // 希腊语
  'en', // 英语
  'es', // 西班牙语
  'et', // 爱沙尼亚语
  'fa', // 波斯语
  'fi', // 芬兰语
  'fil', // 菲律宾语
  'fr', // 法语
  'hi', // 印地语
  'hu', // 匈牙利语
  'id', // 印尼语
  'it', // 意大利语
  'ja', // 日语
  'ko', // 韩语
  'lt', // 立陶宛语
  'lv', // 拉脱维亚语
  'nl', // 荷兰语
  'no', // 挪威语
  'pl', // 波兰语
  'pt', // 葡萄牙语
  'ro', // 罗马尼亚语
  'ru', // 俄语
  'sk', // 斯洛伐克语
  'sl', // 斯洛文尼亚语
  'sv', // 瑞典语
  'th', // 泰语
  'tr', // 土耳其语
  'uk', // 乌克兰语
  'vi', // 越南语
  'ur', // 乌尔都语
  'zh-TW', // 繁体中文
  'zh-CN', // 简体中文
];

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
      'vipBonusPopup', 'banner'
    ],
    // defaultNS: 'common',
    supportedLngs: supportedLanguages,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: `${import.meta.env.VITE_LOCALES_URL ?? '/locales'}/{{lng}}/{{ns}}.json?v=${import.meta.env.VITE_VERSION}`,
      // 禁用缓存
      allowMultiLoading: false,
      crossDomain: false,
      // HTTP 请求选项
      requestOptions: {
        mode: 'cors',
        credentials: 'same-origin',
        cache: 'no-cache' // 所有环境都禁用缓存
      }
    },
    // 防止语言代码自动标准化 
    nonExplicitSupportedLngs: false,
    // 保留语言标签中的连字符
    load: 'currentOnly',
    // 不要修改语言代码
    cleanCode: false,
    // 禁用资源缓存
    saveMissing: false,
    updateMissing: false
  })

export default i18n
