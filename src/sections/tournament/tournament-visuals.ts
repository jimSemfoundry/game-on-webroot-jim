/**
 * Tournament Visual Configuration
 * 
 * 管理锦标赛插图的配置文件
 * 支持移动端和桌面端不同尺寸的图片
 */

export interface TournamentVisual {
  titleHighlight: string;
  title: string;
  images: {
    mobile: string;   // 移动端版本 (适合卡片)
    desktop: string;  // 桌面端版本 (适合详情页)
  };
  // 向后兼容：如果没有指定设备类型，使用默认图片
  image?: string;
}

/**
 * 游戏提供商视觉配置映射表
 * 
 * 命名规则：
 * - 移动端：/images/tournaments/{provider}-mobile.png (推荐尺寸: 400x300)
 * - 桌面端：/images/tournaments/{provider}-desktop.png (推荐尺寸: 800x600)
 */
const TOURNAMENT_VISUALS: Record<string, TournamentVisual> = {
  jili: {
    titleHighlight: "JILI SLOTS",
    title: "MEGA BONANZA",
    images: {
      mobile: "/images/tournaments/jili-mobile.png",
      desktop: "/images/tournaments/jili-desktop.png",
    },
    image: "/images/tournaments/jili-mobile.png",
  },
  pg: {
    titleHighlight: "PG SOFT",
    title: "RACES",
    images: {
      mobile: "/images/tournaments/pg-mobile.png",
      desktop: "/images/tournaments/pg-desktop.png",
    },
    image: "/images/tournaments/pg-mobile.png",
  },
  pragmatic: {
    titleHighlight: "PRAGMATIC",
    title: "CHALLENGE",
    images: {
      mobile: "/images/tournaments/pp-mobile.png",
      desktop: "/images/tournaments/pp-desktop.png",
    },
    image: "/images/tournaments/pp-mobile.png",
  },
  pp: {
    // PP 是 Pragmatic 的别名
    titleHighlight: "PRAGMATIC",
    title: "CHALLENGE",
    images: {
      mobile: "/images/tournaments/pp-mobile.png",
      desktop: "/images/tournaments/pp-desktop.png",
    },
    image: "/images/tournaments/pp-mobile.png",
  },
  fachai: {
    titleHighlight: "FACHAI",
    title: "FORTUNE",
    images: {
      mobile: "/images/tournaments/fachai-mobile.png",
      desktop: "/images/tournaments/fachai-desktop.png",
    },
    image: "/images/tournaments/fachai-mobile.png",
  },
  fc: {
    // FC 是 Fachai 的别名
    titleHighlight: "FACHAI",
    title: "FORTUNE",
    images: {
      mobile: "/images/tournaments/fachai-mobile.png",
      desktop: "/images/tournaments/fachai-desktop.png",
    },
    image: "/images/tournaments/fachai-mobile.png",
  },
  newbie: {
    titleHighlight: "BEGINNER'S",
    title: "LUCK",
    images: {
      mobile: "/images/tournaments/beginners-mobile.png",
      desktop: "/images/tournaments/beginners-desktop.png",
    },
    image: "/images/tournaments/beginners-mobile.png",
  },
  "0": {
    // 新手场别名
    titleHighlight: "BEGINNER'S",
    title: "LUCK",
    images: {
      mobile: "/images/tournaments/beginners-mobile.png",
      desktop: "/images/tournaments/beginners-desktop.png",
    },
    image: "/images/tournaments/beginners-mobile.png",
  },
};

/**
 * 默认视觉配置
 */
const DEFAULT_VISUAL: TournamentVisual = {
  titleHighlight: "TOURNAMENTS",
  title: "ARENA",
  images: {
    mobile: "/images/tournaments/default-mobile.png",
    desktop: "/images/tournaments/default-desktop.png",
  },
  image: "/images/tournaments/default-mobile.png",
};

/**
 * 根据游戏提供商获取锦标赛视觉配置
 * 
 * @param provider - 游戏提供商标识 (例如: "jili", "pg", "pragmatic")
 * @param device - 设备类型 (可选)
 * @returns 视觉配置对象
 * 
 * @example
 * ```tsx
 * const visual = getTournamentVisual("jili");
 * // 在移动端卡片中使用
 * <img src={visual.images.mobile} alt={visual.title} />
 * 
 * // 在桌面端详情页中使用
 * <img src={visual.images.desktop} alt={visual.title} />
 * ```
 */
export function getTournamentVisual(provider?: string): TournamentVisual {
  if (!provider) return DEFAULT_VISUAL;
  
  const normalizedProvider = provider.toLowerCase().trim();
  return TOURNAMENT_VISUALS[normalizedProvider] || DEFAULT_VISUAL;
}

/**
 * 获取指定设备类型的图片 URL
 * 
 * @param provider - 游戏提供商
 * @param device - 设备类型 ("mobile" | "desktop")
 * @returns 图片 URL
 */
export function getTournamentImage(
  provider?: string,
  device: "mobile" | "desktop" = "mobile"
): string {
  const visual = getTournamentVisual(provider);
  
  // 优先使用响应式图片
  const imageUrl = visual.images[device];
  
  // 如果响应式图片不存在，尝试降级到单张图片
  if (!imageUrl || imageUrl.includes("/tournaments/")) {
    // 检查文件是否实际存在（生产环境可能需要）
    // 如果不存在，降级到向后兼容的单图
    return visual.image || visual.images[device];
  }
  
  return imageUrl;
}

/**
 * 获取所有支持的提供商列表
 */
export function getSupportedProviders(): string[] {
  return Object.keys(TOURNAMENT_VISUALS).filter(key => key !== "0"); // 排除别名
}

/**
 * 检查提供商是否有配置
 */
export function hasProviderConfig(provider?: string): boolean {
  if (!provider) return false;
  return provider.toLowerCase() in TOURNAMENT_VISUALS;
}

