import { clsx, type ClassValue } from "clsx";

/**
 * RTL-aware className utility function
 * Provides common RTL-aware styles for components
 *
 * NOTE: With Tailwind CSS v4, you can also use native rtl: prefix:
 * - rtl:text-right instead of conditionalRTL
 * - rtl:mr-4 rtl:ml-0 instead of marginStart/marginEnd
 */
export const rtlClasses = {
  // Text alignment
  textStart: "text-start",
  textEnd: "text-end",

  // Margin and padding (logical properties)
  marginStart: (size: string) => `ms-${size}`,
  marginEnd: (size: string) => `me-${size}`,
  paddingStart: (size: string) => `ps-${size}`,
  paddingEnd: (size: string) => `pe-${size}`,

  // Positioning (logical properties)
  start: (size: string) => `start-${size}`,
  end: (size: string) => `end-${size}`,

  // Borders (logical properties)
  borderStart: (size: string = "1") => `border-s-${size}`,
  borderEnd: (size: string = "1") => `border-e-${size}`,

  // Rounded corners (logical properties)
  roundedStart: (size: string) => `rounded-s-${size}`,
  roundedEnd: (size: string) => `rounded-e-${size}`,

  // Flex direction
  flexRow: "flex-row",
  flexRowReverse: "flex-row-reverse",
};

/**
 * Conditional RTL className helper
 * @param isRTL - Whether the current direction is RTL
 * @param ltrClasses - Classes to apply in LTR mode
 * @param rtlClasses - Classes to apply in RTL mode
 */
export const conditionalRTL = (isRTL: boolean, ltrClasses: ClassValue, rtlClasses: ClassValue) => {
  return clsx(isRTL ? rtlClasses : ltrClasses);
};

/**
 * Common RTL-aware styles for different component types
 */
export const rtlStyles = {
  // Navigation and menus
  nav: {
    container: "flex items-center",
    item: "flex items-center gap-2",
    text: rtlClasses.textStart,
  },

  // Form elements
  form: {
    input: "text-start",
    label: rtlClasses.textStart,
    help: "text-sm text-start opacity-70",
  },

  // Cards and containers
  card: {
    container: "flex flex-col",
    header: "flex items-center justify-between",
    content: rtlClasses.textStart,
  },

  // Modal and dialogs
  modal: {
    header: "flex items-center justify-between",
    content: rtlClasses.textStart,
    actions: "flex gap-2",
  },

  // Lists
  list: {
    item: "flex items-center justify-between",
    content: rtlClasses.textStart,
  },
};

/**
 * Icon direction helper for RTL layouts
 * Some icons need to be flipped in RTL mode (arrows, chevrons)
 */
export const getIconDirection = (isRTL: boolean, shouldFlip: boolean = true) => {
  if (!shouldFlip) return "";
  return isRTL ? "scale-x-[-1]" : "";
};

/**
 * Direction-aware transform utility
 */
export const directionTransform = (isRTL: boolean) => ({
  transform: isRTL ? "scaleX(-1)" : "none",
});

/**
 * Tailwind v4 RTL helper utilities
 * These functions generate classes using Tailwind v4's native rtl: prefix
 */
export const rtlTailwind = {
  // Text alignment with rtl: prefix
  textAlign: (ltr: "left" | "center" | "right" = "left", rtlAlign: "left" | "center" | "right" = "right") =>
    `text-${ltr} rtl:text-${rtlAlign}`,

  // Margin with rtl: prefix
  margin: (side: "l" | "r" | "t" | "b", size: string, rtlSide?: "l" | "r" | "t" | "b") => {
    const rtlClass = rtlSide ? `rtl:m${rtlSide}-${size} rtl:m${side}-0` : "";
    return `m${side}-${size} ${rtlClass}`.trim();
  },

  // Padding with rtl: prefix
  padding: (side: "l" | "r" | "t" | "b", size: string, rtlSide?: "l" | "r" | "t" | "b") => {
    const rtlClass = rtlSide ? `rtl:p${rtlSide}-${size} rtl:p${side}-0` : "";
    return `p${side}-${size} ${rtlClass}`.trim();
  },

  // Positioning with rtl: prefix
  position: (side: "left" | "right", size: string) =>
    side === "right" ? `right-${size} rtl:left-${size} rtl:right-auto` : `left-${size} rtl:right-${size} rtl:left-auto`,

  // Flex direction with rtl: prefix
  flexDirection: (ltr: "row" | "col" = "row", rtlDir: "row-reverse" | "col-reverse" = "row-reverse") => `flex-${ltr} rtl:flex-${rtlDir}`,
};
