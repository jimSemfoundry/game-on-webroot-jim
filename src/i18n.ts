import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { criticalResources } from "./i18n-critical-resources";

export const supportedLanguages = [
  "ar", // 阿拉伯语
  "bg", // 保加利亚语
  "bn", // 孟加拉语
  "cs", // 捷克语
  "da", // 丹麦语
  "de", // 德语
  "el", // 希腊语
  "en", // 英语
  "es", // 西班牙语
  "et", // 爱沙尼亚语
  "fa", // 波斯语
  "fi", // 芬兰语
  "fil", // 菲律宾语
  "fr", // 法语
  "hi", // 印地语
  "hu", // 匈牙利语
  "id", // 印尼语
  "it", // 意大利语
  "ja", // 日语
  "ko", // 韩语
  "lt", // 立陶宛语
  "lv", // 拉脱维亚语
  "nl", // 荷兰语
  "no", // 挪威语
  "pl", // 波兰语
  "pt", // 葡萄牙语
  "ro", // 罗马尼亚语
  "ru", // 俄语
  "sk", // 斯洛伐克语
  "sl", // 斯洛文尼亚语
  "sv", // 瑞典语
  "th", // 泰语
  "tr", // 土耳其语
  "uk", // 乌克兰语
  "vi", // 越南语
  "ur", // 乌尔都语
  "zh-TW", // 繁体中文
  "zh-CN" // 简体中文
];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: false,
    // t110774 PR3 + PR12 + t110803: init ns 维持 10 个，其余 9 个走懒加载。
    // 首屏会用但 ns 未 init 的极少数 key (sidebar BONUS / LastUpdate / header
    // BonusHub / InnerCountdown / Message Center 共 17 个) 抽到独立的
    // 'critical' ns，由 import.meta.glob 在编译期 inline 进 bundle（见
    // resources 字段），运行期通过 fallbackNS 桥接，零 RTT 兜底。这样
    // PR3 的首屏瘦身收益不退化。新增 critical key 的流程见
    // scripts/build-critical-i18n.mjs（package.json `prebuild` hook 自动跑）。
    resources: criticalResources,
    partialBundledLanguages: true,
    fallbackNS: "critical",
    ns: [
      "common",
      "casino",
      "menu",
      "banner",
      "toast",
      "popup",
      "explore",
      "login",
      "luckySpin",
      "profile"
    ],
    // defaultNS: 'common',
    supportedLngs: supportedLanguages,
    interpolation: {
      escapeValue: false
    },
    backend: {
      /**
       * 添加游戏文件的加载路径
       * 游戏翻译文件巨大,需要拆分,方便维护
       * @example /locales/en/games/game_advantplay.json
       * @description 用于加载游戏相关的翻译文件
       * addPath: 翻译文件的备用资源选项
       */
      addPath: `/locales/{{lng}}/games/{{ns}}.json?v=${import.meta.env.VITE_VERSION}`,
      loadPath: `/locales/{{lng}}/{{ns}}.json?v=${import.meta.env.VITE_VERSION}`,
      // 禁用缓存
      allowMultiLoading: false,
      crossDomain: false,
      // HTTP 请求选项
      requestOptions: {
        mode: "cors",
        credentials: "same-origin",
        cache: "default" // 所有环境都禁用缓存
      }
    },
    // 防止语言代码自动标准化 
    nonExplicitSupportedLngs: false,
    // 保留语言标签中的连字符
    load: "currentOnly",
    // 不要修改语言代码
    cleanCode: false,
    // 禁用资源缓存
    saveMissing: false,
    updateMissing: false
  });

export default i18n;
