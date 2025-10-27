import type { ThemeConfig } from "../contexts/ThemeContext";

/**
 * Preset theme configurations
 *
 * Theme structure explanation:
 * - name: Theme name (unique identifier)
 * - colors: Color configuration (using OKLCH format for better visual effects)
 * - radiusSelector: Border radius for selectors (buttons, inputs)
 * - radiusField: Border radius for form fields
 * - radiusBox: Border radius for boxes (cards, modals)
 * - sizeSelector: Size for selector components
 * - sizeField: Size for field components
 * - border: Border width
 * - fontFamily: Font family
 * - noise: (optional) Noise effect intensity (0-1, DaisyUI feature)
 * - depth: (optional) Depth/shadow effect intensity (0-1, DaisyUI feature)
 *
 * OKLCH color format: oklch(lightness% chroma hue)
 * - lightness: 0-100%, controls color brightness
 * - chroma: 0-0.4, controls color saturation
 * - hue: 0-360 degrees, controls color type
 */

export const presetThemes: Record<string, ThemeConfig> = {
  default: {
    name: "default",
    colorSchema: "dark",
    colors: {
      primary: "oklch(85.1% 0.221102 119.9)",
      primaryContent: "oklch(34.2% 0.117322 154.9)",

      secondary: "oklch(76.8% 0.206069 125.3)",
      secondaryContent: "oklch(29.8% 0.098855 133.2)",

      accent: "oklch(83.3% 0.196472 89)",
      accentContent: "oklch(29.9% 0.070545 86.7)",

      neutral: "oklch(14.7% 0.014752 247.4)",
      neutralContent: "oklch(94% 0 0 / 0.5)",

      base100: "oklch(25.9% 0.023141 256.6)",
      base200: "oklch(22.9% 0.017469 252.4)",
      base300: "oklch(18.9% 0.013554 249.5)",
      base400: "oklch(14.7% 0.014752 247.4)",
      baseContent: "oklch(94% 0 0)",

      info: "oklch(61.6% 0.187735 245)",
      infoContent: "oklch(95.2% 0.025708 234.4)",
      success: "oklch(80.8% 0.244937 128.5)",
      successContent: "oklch(29.8% 0.098855 133.2)",
      warning: "oklch(82.3% 0.198561 76.2)",
      warningContent: "oklch(97.9% 0.033616 91)",
      error: "oklch(62.5% 0.245723 26.5)",
      errorContent: "oklch(95.9% 0.027532 7.3)",
    },
    // DaisyUI radius settings
    radiusSelector: "0.5rem", // 8px - for buttons, inputs
    radiusField: "0.5rem", // 8px - for form fields
    radiusBox: "1.25rem", // 12px - for cards, modals

    // DaisyUI size settings
    sizeSelector: "0.25rem", // 4px - for selector component sizing
    sizeField: "0.25rem", // 4px - for field component sizing

    // Border width
    border: "1px", // global border width

    fontFamily: "Montserrat, sans-serif",
    noise: 0,
    depth: 0,
  },
  // Light theme - suitable for daytime use (DaisyUI official colors)
  light: {
    name: "light",
    colorSchema: "light",
    colors: {
      // Primary colors - blue-purple system
      primary: "oklch(45% 0.24 277.023)", // deep blue-purple
      primaryContent: "oklch(93% 0.034 272.788)", // light text

      // Secondary colors - pink system
      secondary: "oklch(65% 0.241 354.308)", // pink
      secondaryContent: "oklch(94% 0.028 342.258)", // light text

      // Accent colors - cyan system
      accent: "oklch(77% 0.152 181.912)", // cyan
      accentContent: "oklch(38% 0.063 188.416)", // dark text

      // Neutral colors
      neutral: "oklch(14% 0.005 285.823)", // dark gray
      neutralContent: "oklch(92% 0.004 286.32)", // light text

      // Background colors
      base100: "oklch(100% 0 0)", // pure white background
      base200: "oklch(98% 0 0)", // light gray background
      base300: "oklch(95% 0 0)", // slightly darker gray background
      base400: "oklch(92% 0 0)", // darker gray background
      baseContent: "oklch(21% 0.006 285.885)", // dark text

      // Status colors
      info: "oklch(74% 0.16 232.661)", // info blue
      infoContent: "oklch(29% 0.066 243.157)", // dark text
      success: "oklch(76% 0.177 163.223)", // success green
      successContent: "oklch(37% 0.077 168.94)", // dark text
      warning: "oklch(82% 0.189 84.429)", // warning orange
      warningContent: "oklch(41% 0.112 45.904)", // dark text
      error: "oklch(71% 0.194 13.428)", // error red
      errorContent: "oklch(27% 0.105 12.094)", // dark text
    },
    // DaisyUI radius settings
    radiusSelector: "0.5rem", // 8px - for buttons, inputs
    radiusField: "0.375rem", // 6px - for form fields
    radiusBox: "0.5rem", // 8px - for cards, modals

    // DaisyUI size settings
    sizeSelector: "0.25rem", // 4px - for selector component sizing
    sizeField: "0.25rem", // 4px - for field component sizing

    // Border width
    border: "1px", // global border width

    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    noise: 0, // No noise effect for clean look
    depth: 0, // No depth effect for clean look
  },

  // Silk theme - elegant light theme with subtle warm tones
  silk: {
    name: "silk",
    colorSchema: "light",
    colors: {
      // Primary colors - deep navy (unified color for primary, secondary, accent)
      primary: "oklch(23.27% 0.0249 284.3)", // deep navy
      primaryContent: "oklch(94.22% 0.2505 117.44)", // bright green text

      // Secondary colors - same deep navy
      secondary: "oklch(23.27% 0.0249 284.3)", // deep navy
      secondaryContent: "oklch(73.92% 0.2135 50.94)", // warm yellow text

      // Accent colors - same deep navy
      accent: "oklch(23.27% 0.0249 284.3)", // deep navy
      accentContent: "oklch(88.92% 0.2061 189.9)", // cyan text

      // Neutral colors
      neutral: "oklch(20% 0 0)", // dark neutral
      neutralContent: "oklch(80% 0.0081 61.42)", // warm light text

      // Background colors - warm white system
      base100: "oklch(97% 0.0035 67.78)", // warm white background
      base200: "oklch(95% 0.0081 61.42)", // warm light gray
      base300: "oklch(90% 0.0081 61.42)", // warm gray
      base400: "oklch(85% 0.0081 61.42)", // darker warm gray
      baseContent: "oklch(40% 0.0081 61.42)", // warm dark text

      // Status colors - bright silk tones
      info: "oklch(80.39% 0.1148 241.68)", // info blue
      infoContent: "oklch(30.39% 0.1148 241.68)", // dark text
      success: "oklch(83.92% 0.0901 136.87)", // success green
      successContent: "oklch(23.92% 0.0901 136.87)", // dark text
      warning: "oklch(83.92% 0.1085 80)", // warning yellow
      warningContent: "oklch(43.92% 0.1085 80)", // dark text
      error: "oklch(75.1% 0.1814 22.37)", // error red
      errorContent: "oklch(35.1% 0.1814 22.37)", // dark text
    },
    // DaisyUI radius settings
    radiusSelector: "1rem", // 16px - elegant silk style
    radiusField: "0.75rem", // 12px - for form fields
    radiusBox: "1rem", // 16px - for cards, modals

    // DaisyUI size settings
    sizeSelector: "0.25rem", // 4px - for selector component sizing
    sizeField: "0.25rem", // 4px - for field component sizing

    // Border width
    border: "1px", // global border width

    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    noise: 0, // No noise effect
    depth: 1, // Subtle depth for elegant feel
  },

  // Winter theme - crisp light theme with cool blue tones
  winter: {
    name: "winter",
    colorSchema: "light",
    colors: {
      // Primary colors - winter blue
      primary: "oklch(56.86% 0.255 257.57)", // crisp winter blue
      primaryContent: "oklch(91.372% 0.051 257.57)", // light blue text

      // Secondary colors - deep winter purple
      secondary: "oklch(42.551% 0.161 282.339)", // deep winter purple
      secondaryContent: "oklch(88.51% 0.032 282.339)", // light purple text

      // Accent colors - winter pink
      accent: "oklch(59.939% 0.191 335.171)", // winter pink
      accentContent: "oklch(11.988% 0.038 335.171)", // dark text

      // Neutral colors - dark winter blue
      neutral: "oklch(19.616% 0.063 257.651)", // dark winter blue
      neutralContent: "oklch(83.923% 0.012 257.651)", // light text

      // Background colors - crisp white system
      base100: "oklch(100% 0 0)", // pure white background
      base200: "oklch(97.466% 0.011 259.822)", // cool light gray
      base300: "oklch(93.268% 0.016 262.751)", // cool gray
      base400: "oklch(89.070% 0.021 265.680)", // darker cool gray
      baseContent: "oklch(41.886% 0.053 255.824)", // cool dark text

      // Status colors - winter tones
      info: "oklch(88.127% 0.085 214.515)", // info cyan
      infoContent: "oklch(17.625% 0.017 214.515)", // dark text
      success: "oklch(80.494% 0.077 197.823)", // success blue-green
      successContent: "oklch(16.098% 0.015 197.823)", // dark text
      warning: "oklch(89.172% 0.045 71.47)", // warning pale yellow
      warningContent: "oklch(17.834% 0.009 71.47)", // dark text
      error: "oklch(73.092% 0.11 20.076)", // error red
      errorContent: "oklch(14.618% 0.022 20.076)", // dark text
    },
    // DaisyUI radius settings - matches your example
    radiusSelector: "1rem", // 16px - clean winter style
    radiusField: "0.5rem", // 8px - for form fields
    radiusBox: "1rem", // 16px - for cards, modals

    // DaisyUI size settings
    sizeSelector: "0.25rem", // 4px - for selector component sizing
    sizeField: "0.25rem", // 4px - for field component sizing

    // Border width
    border: "1px", // global border width

    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    noise: 0, // No noise effect for crisp look
    depth: 0, // No depth effect for clean look
  },

  // Dark theme - suitable for nighttime use
  dark: {
    name: "dark",
    colorSchema: "dark",
    colors: {
      // Primary colors - purple system
      primary: "oklch(58% 0.233 277.117)", // bright purple
      primaryContent: "oklch(96% 0.018 272.314)", // light text

      // Secondary colors - pink-purple system
      secondary: "oklch(65% 0.241 354.308)", // pink-purple
      secondaryContent: "oklch(94% 0.028 342.258)", // light text

      // Accent colors - cyan-green system
      accent: "oklch(77% 0.152 181.912)", // cyan-green
      accentContent: "oklch(38% 0.063 188.416)", // dark text

      // Neutral colors
      neutral: "oklch(14% 0.005 285.823)", // deep blue-gray
      neutralContent: "oklch(92% 0.004 286.32)", // light text

      // Background colors - dark blue-gray system
      base100: "oklch(25.33% 0.016 252.42)", // main background dark blue
      base200: "oklch(23.26% 0.014 253.1)", // slightly lighter background
      base300: "oklch(21.15% 0.012 254.09)", // darker background
      base400: "oklch(19.04% 0.010 255.78)", // darkest background
      baseContent: "oklch(97.807% 0.029 256.847)", // light text

      // Status colors
      info: "oklch(74% 0.16 232.661)", // info blue
      infoContent: "oklch(29% 0.066 243.157)", // dark text
      success: "oklch(76% 0.177 163.223)", // success green
      successContent: "oklch(37% 0.077 168.94)", // dark text
      warning: "oklch(82% 0.189 84.429)", // warning orange
      warningContent: "oklch(41% 0.112 45.904)", // dark text
      error: "oklch(71% 0.194 13.428)", // error red
      errorContent: "oklch(27% 0.105 12.094)", // dark text
    },
    // DaisyUI radius settings
    radiusSelector: "0.5rem", // 8px - for buttons, inputs
    radiusField: "0.375rem", // 6px - for form fields
    radiusBox: "0.5rem", // 8px - for cards, modals

    // DaisyUI size settings
    sizeSelector: "0.25rem", // 4px - for selector component sizing
    sizeField: "0.25rem", // 4px - for field component sizing

    // Border width
    border: "1px", // global border width

    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    noise: 0, // No noise effect for clean look
    depth: 0, // No depth effect for clean look
  },

  // Forest theme - natural deep style
  forest: {
    name: "forest",
    colorSchema: "dark",
    colors: {
      // Primary colors - forest green
      primary: "oklch(68.628% 0.185 148.958)", // deep forest green
      primaryContent: "oklch(0% 0 0)", // black text

      // Secondary colors - mint green
      secondary: "oklch(69.776% 0.135 168.327)", // mint green
      secondaryContent: "oklch(13.955% 0.027 168.327)", // dark text

      // Accent colors - cyan-green
      accent: "oklch(70.628% 0.119 185.713)", // cyan-green
      accentContent: "oklch(14.125% 0.023 185.713)", // dark text

      // Neutral colors - deep green-gray
      neutral: "oklch(30.698% 0.039 171.364)", // deep green-gray
      neutralContent: "oklch(86.139% 0.007 171.364)", // light text

      // Background colors - dark natural system
      base100: "oklch(20.84% 0.008 17.911)", // main background deep brown-green
      base200: "oklch(18.522% 0.007 17.911)", // darker background
      base300: "oklch(16.203% 0.007 17.911)", // darkest background
      base400: "oklch(13.884% 0.006 17.911)", // deepest background
      baseContent: "oklch(83.768% 0.001 17.911)", // light text

      // Status colors
      info: "oklch(72.06% 0.191 231.6)", // info blue
      infoContent: "oklch(0% 0 0)", // black text
      success: "oklch(64.8% 0.15 160)", // success green
      successContent: "oklch(0% 0 0)", // black text
      warning: "oklch(84.71% 0.199 83.87)", // warning orange
      warningContent: "oklch(0% 0 0)", // black text
      error: "oklch(71.76% 0.221 22.18)", // error red
      errorContent: "oklch(0% 0 0)", // black text
    },
    // DaisyUI radius settings
    radiusSelector: "1rem", // 16px - natural rounded
    radiusField: "0.75rem", // 12px - for form fields
    radiusBox: "1rem", // 16px - for cards, modals

    // DaisyUI size settings
    sizeSelector: "0.25rem", // 4px - for selector component sizing
    sizeField: "0.25rem", // 4px - for field component sizing

    // Border width
    border: "1px", // global border width

    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    noise: 0, // No noise effect
    depth: 1, // Subtle depth for natural feel
  },

  // Halloween theme - mysterious horror style
  halloween: {
    name: "halloween",
    colorSchema: "dark",
    colors: {
      // Primary colors - pumpkin orange
      primary: "oklch(77.48% 0.204 60.62)", // pumpkin orange
      primaryContent: "oklch(19.693% 0.004 196.779)", // dark text

      // Secondary colors - mysterious purple
      secondary: "oklch(45.98% 0.248 305.03)", // mysterious purple
      secondaryContent: "oklch(89.196% 0.049 305.03)", // light text

      // Accent colors - ghostly green
      accent: "oklch(64.8% 0.223 136.073)", // ghostly green
      accentContent: "oklch(0% 0 0)", // black text

      // Neutral colors - dark brown
      neutral: "oklch(24.371% 0.046 65.681)", // dark brown
      neutralContent: "oklch(84.874% 0.009 65.681)", // light text

      // Background colors - dark horror system
      base100: "oklch(21% 0.006 56.043)", // main background dark brown
      base200: "oklch(14% 0.004 49.25)", // darker background
      base300: "oklch(7% 0.002 42.5)", // very dark background
      base400: "oklch(0% 0 0)", // pure black background
      baseContent: "oklch(84.955% 0 0)", // light gray text

      // Status colors
      info: "oklch(54.615% 0.215 262.88)", // info blue-purple
      infoContent: "oklch(90.923% 0.043 262.88)", // light text
      success: "oklch(62.705% 0.169 149.213)", // success green
      successContent: "oklch(12.541% 0.033 149.213)", // dark text
      warning: "oklch(66.584% 0.157 58.318)", // warning orange
      warningContent: "oklch(13.316% 0.031 58.318)", // dark text
      error: "oklch(65.72% 0.199 27.33)", // error red
      errorContent: "oklch(13.144% 0.039 27.33)", // dark text
    },
    // DaisyUI radius settings
    radiusSelector: "1rem", // 16px - rounded style
    radiusField: "0.75rem", // 12px - for form fields
    radiusBox: "1rem", // 16px - for cards, modals

    // DaisyUI size settings
    sizeSelector: "0.25rem", // 4px - for selector component sizing
    sizeField: "0.25rem", // 4px - for field component sizing

    // Border width
    border: "1px", // global border width

    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    noise: 0, // No noise effect
    depth: 1, // Subtle depth for mysterious feel
  },

  // Business theme - professional dark theme with clean aesthetics
  business: {
    name: "business",
    colorSchema: "dark",
    colors: {
      // Primary colors - professional blue
      primary: "oklch(41.703% 0.099 251.473)", // professional deep blue
      primaryContent: "oklch(88.34% 0.019 251.473)", // light text

      // Secondary colors - neutral gray-blue
      secondary: "oklch(64.092% 0.027 229.389)", // neutral gray-blue
      secondaryContent: "oklch(12.818% 0.005 229.389)", // dark text

      // Accent colors - warm orange
      accent: "oklch(67.271% 0.167 35.791)", // warm professional orange
      accentContent: "oklch(13.454% 0.033 35.791)", // dark text

      // Neutral colors - dark professional gray
      neutral: "oklch(27.441% 0.013 253.041)", // dark professional gray
      neutralContent: "oklch(85.488% 0.002 253.041)", // light text

      // Background colors - clean dark system
      base100: "oklch(24.353% 0 0)", // main background clean dark
      base200: "oklch(22.648% 0 0)", // slightly darker background
      base300: "oklch(20.944% 0 0)", // darkest background
      base400: "oklch(19.239% 0 0)", // deepest background
      baseContent: "oklch(84.87% 0 0)", // light gray text

      // Status colors
      info: "oklch(62.616% 0.143 240.033)", // info blue
      infoContent: "oklch(12.523% 0.028 240.033)", // dark text
      success: "oklch(70.226% 0.094 156.596)", // success green
      successContent: "oklch(14.045% 0.018 156.596)", // dark text
      warning: "oklch(77.482% 0.115 81.519)", // warning yellow
      warningContent: "oklch(15.496% 0.023 81.519)", // dark text
      error: "oklch(51.61% 0.146 29.674)", // error red
      errorContent: "oklch(90.322% 0.029 29.674)", // light text
    },
    // DaisyUI radius settings
    radiusSelector: "0.25rem", // 4px - minimal clean style
    radiusField: "0.125rem", // 2px - for form fields
    radiusBox: "0.25rem", // 4px - for cards, modals

    // DaisyUI size settings
    sizeSelector: "0.25rem", // 4px - for selector component sizing
    sizeField: "0.25rem", // 4px - for field component sizing

    // Border width
    border: "1px", // global border width

    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    noise: 0, // No noise effect
    depth: 0, // No depth effect
  },

  // Dracula theme - vampire-inspired dark theme with vibrant colors
  dracula: {
    name: "dracula",
    colorSchema: "dark",
    colors: {
      // Primary colors - vibrant pink
      primary: "oklch(75.461% 0.183 346.812)", // vibrant dracula pink
      primaryContent: "oklch(15.092% 0.036 346.812)", // dark text

      // Secondary colors - purple
      secondary: "oklch(74.202% 0.148 301.883)", // dracula purple
      secondaryContent: "oklch(14.84% 0.029 301.883)", // dark text

      // Accent colors - yellow
      accent: "oklch(83.392% 0.124 66.558)", // dracula yellow
      accentContent: "oklch(16.678% 0.024 66.558)", // dark text

      // Neutral colors - dark purple-gray
      neutral: "oklch(39.445% 0.032 275.524)", // dark purple-gray
      neutralContent: "oklch(87.889% 0.006 275.524)", // light text

      // Background colors - dark purple system
      base100: "oklch(28.822% 0.022 277.508)", // main background dark purple
      base200: "oklch(26.805% 0.02 277.508)", // darker background
      base300: "oklch(24.787% 0.019 277.508)", // darkest background
      base400: "oklch(22.770% 0.017 277.508)", // deepest background
      baseContent: "oklch(97.747% 0.007 106.545)", // light text

      // Status colors
      info: "oklch(88.263% 0.093 212.846)", // info cyan
      infoContent: "oklch(17.652% 0.018 212.846)", // dark text
      success: "oklch(87.099% 0.219 148.024)", // success green
      successContent: "oklch(17.419% 0.043 148.024)", // dark text
      warning: "oklch(95.533% 0.134 112.757)", // warning yellow
      warningContent: "oklch(19.106% 0.026 112.757)", // dark text
      error: "oklch(68.22% 0.206 24.43)", // error red
      errorContent: "oklch(13.644% 0.041 24.43)", // dark text
    },
    // DaisyUI radius settings
    radiusSelector: "1rem", // 16px - rounded vampire style
    radiusField: "0.75rem", // 12px - for form fields
    radiusBox: "1rem", // 16px - for cards, modals

    // DaisyUI size settings
    sizeSelector: "0.25rem", // 4px - for selector component sizing
    sizeField: "0.25rem", // 4px - for field component sizing

    // Border width
    border: "1px", // global border width

    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    noise: 0, // No noise effect
    depth: 0, // No depth effect
  },

  // Sunset theme - warm sunset colors with deep blue background
  sunset: {
    name: "sunset",
    colorSchema: "dark",
    colors: {
      // Primary colors - warm sunset orange
      primary: "oklch(74.703% 0.158 39.947)", // warm sunset orange
      primaryContent: "oklch(14.94% 0.031 39.947)", // dark text

      // Secondary colors - sunset red
      secondary: "oklch(72.537% 0.177 2.72)", // sunset red/pink
      secondaryContent: "oklch(14.507% 0.035 2.72)", // dark text

      // Accent colors - sunset purple
      accent: "oklch(71.294% 0.166 299.844)", // sunset purple
      accentContent: "oklch(14.258% 0.033 299.844)", // dark text

      // Neutral colors - deep blue
      neutral: "oklch(26% 0.019 237.69)", // deep blue neutral
      neutralContent: "oklch(70% 0.019 237.69)", // light text

      // Background colors - deep blue system
      base100: "oklch(22% 0.019 237.69)", // main background deep blue
      base200: "oklch(20% 0.019 237.69)", // darker background
      base300: "oklch(18% 0.019 237.69)", // darkest background
      base400: "oklch(16% 0.019 237.69)", // deepest background
      baseContent: "oklch(77.383% 0.043 245.096)", // light blue text

      // Status colors - bright sunset tones
      info: "oklch(85.559% 0.085 206.015)", // info cyan
      infoContent: "oklch(17.111% 0.017 206.015)", // dark text
      success: "oklch(85.56% 0.085 144.778)", // success green
      successContent: "oklch(17.112% 0.017 144.778)", // dark text
      warning: "oklch(85.569% 0.084 74.427)", // warning yellow
      warningContent: "oklch(17.113% 0.016 74.427)", // dark text
      error: "oklch(85.511% 0.078 16.886)", // error red
      errorContent: "oklch(17.102% 0.015 16.886)", // dark text
    },
    // DaisyUI radius settings
    radiusSelector: "1rem", // 16px - smooth sunset style
    radiusField: "0.75rem", // 12px - for form fields
    radiusBox: "1rem", // 16px - for cards, modals

    // DaisyUI size settings
    sizeSelector: "0.25rem", // 4px - for selector component sizing
    sizeField: "0.25rem", // 4px - for field component sizing

    // Border width
    border: "1px", // global border width

    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    noise: 0, // No noise effect
    depth: 0, // No depth effect
  },

  // Abyss theme - deep ocean-inspired dark theme with vibrant accents
  abyss: {
    name: "abyss",
    colorSchema: "dark",
    colors: {
      // Primary colors - bright aqua green
      primary: "oklch(92% 0.2653 125)", // bright aqua green
      primaryContent: "oklch(50% 0.2653 125)", // dark green text

      // Secondary colors - soft purple
      secondary: "oklch(83.27% 0.0764 298.3)", // soft purple
      secondaryContent: "oklch(43.27% 0.0764 298.3)", // dark purple text

      // Accent colors - neutral dark gray
      accent: "oklch(43% 0 0)", // neutral dark gray
      accentContent: "oklch(98% 0 0)", // light text

      // Neutral colors - deep blue-gray
      neutral: "oklch(30% 0.08 209)", // deep blue-gray
      neutralContent: "oklch(90% 0.076 70.697)", // warm light text

      // Background colors - deep ocean blue system
      base100: "oklch(20% 0.08 209)", // main background deep ocean blue
      base200: "oklch(15% 0.08 209)", // darker background
      base300: "oklch(10% 0.08 209)", // deepest background
      base400: "oklch(5% 0.08 209)", // abyssal background
      baseContent: "oklch(90% 0.076 70.697)", // warm light text

      // Status colors - vibrant ocean tones
      info: "oklch(74% 0.16 232.661)", // info blue
      infoContent: "oklch(29% 0.066 243.157)", // dark text
      success: "oklch(79% 0.209 151.711)", // success bright green
      successContent: "oklch(26% 0.065 152.934)", // dark text
      warning: "oklch(84.8% 0.1962 84.62)", // warning bright yellow
      warningContent: "oklch(44.8% 0.1962 84.62)", // dark text
      error: "oklch(65% 0.1985 24.22)", // error red
      errorContent: "oklch(27% 0.1985 24.22)", // dark text
    },
    // DaisyUI radius settings
    radiusSelector: "0.5rem", // 8px - subtle oceanic style
    radiusField: "0.375rem", // 6px - for form fields
    radiusBox: "0.5rem", // 8px - for cards, modals

    // DaisyUI size settings
    sizeSelector: "0.25rem", // 4px - for selector component sizing
    sizeField: "0.25rem", // 4px - for field component sizing

    // Border width
    border: "1px", // global border width

    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    noise: 0, // No noise effect
    depth: 1, // Subtle depth effect for oceanic feel
  },

  // 🎨 Add your custom themes here
  // Example:
  /*
  myCustomTheme: {
    name: 'myCustomTheme',
    colorSchema: "light",
    colors: {
      primary: 'oklch(60% 0.3 180)',
      primaryContent: 'oklch(90% 0.05 180)',
      // ... other color configurations
    },
    radiusSelector: "0.5rem",
    radiusField: "0.375rem", 
    radiusBox: "0.5rem",
    sizeSelector: "0.25rem",
    sizeField: "0.25rem",
    border: "1px",
    fontFamily: '"Your Font", sans-serif',
  },
  */
};

/**
 * Get all preset themes
 */
export function getAllPresetThemes(): Record<string, ThemeConfig> {
  return presetThemes;
}

/**
 * Get theme by name
 */
export function getThemeByName(name: string): ThemeConfig | undefined {
  return presetThemes[name];
}

/**
 * Get theme names list
 */
export function getThemeNames(): string[] {
  return Object.keys(presetThemes);
}

/**
 * Validate if theme configuration is complete
 */
export function validateTheme(theme: Partial<ThemeConfig>): boolean {
  const requiredFields = [
    "name",
    "colors",
    "radiusSelector",
    "radiusField",
    "radiusBox",
    "sizeSelector",
    "sizeField",
    "border",
    "fontFamily",
  ];
  const requiredColors = [
    "primary",
    "primaryContent",
    "secondary",
    "secondaryContent",
    "accent",
    "accentContent",
    "neutral",
    "neutralContent",
    "base100",
    "base200",
    "base300",
    "base400",
    "baseContent",
    "info",
    "infoContent",
    "success",
    "successContent",
    "warning",
    "warningContent",
    "error",
    "errorContent",
  ];

  // Check basic fields
  for (const field of requiredFields) {
    if (!(field in theme)) {
      console.warn(`Theme validation failed: missing field "${field}"`);
      return false;
    }
  }

  // Check color fields
  if (theme.colors) {
    for (const color of requiredColors) {
      if (!(color in theme.colors)) {
        console.warn(`Theme validation failed: missing color "${color}"`);
        return false;
      }
    }
  }

  return true;
}
