import { useState, useEffect, useCallback, useMemo } from "react";
import { Vibrant } from "node-vibrant/browser";

export interface VibrantColorResult {
  gradient: string;
  rgb: [number, number, number] | null;
  hex: string | null;
  isReady: boolean;
  error: string | null;
}

export interface UseVibrantColorOptions {
  fallbackGradient?: string;
  colorTypes?: ('Vibrant' | 'Muted' | 'DarkVibrant' | 'DarkMuted' | 'LightVibrant' | 'LightMuted')[];
  opacity?: number;
}

/**
 * 自定义 Hook：从图片中提取鲜艳颜色并生成渐变背景
 * @param imageSrc 图片路径或 URL
 * @param options 配置选项
 * @returns 包含渐变、RGB、十六进制颜色等信息的对象
 */
export const useVibrantColor = (
  imageSrc: string,
  options: UseVibrantColorOptions = {}
): VibrantColorResult => {
  const {
    fallbackGradient = "var(--color-base-300)",
    colorTypes = ['Vibrant', 'Muted', 'DarkVibrant'],
    opacity = 0.5
  } = options;

  // 使用 useMemo 来稳定 colorTypes 数组的引用
  const stableColorTypes = useMemo(() => colorTypes, [colorTypes.join(',')]);

  const [result, setResult] = useState<VibrantColorResult>({
    gradient: fallbackGradient,
    rgb: null,
    hex: null,
    isReady: false,
    error: null
  });

  const extractColor = useCallback(async () => {
    if (!imageSrc) {
      setResult({
        gradient: fallbackGradient,
        rgb: null,
        hex: null,
        isReady: true,
        error: null
      });
      return;
    }

    try {
      // 使用 node-vibrant 获取颜色调色板
      const palette = await Vibrant.from(imageSrc).getPalette();
      
      // 按优先级查找颜色
      let vibrantColor = null;
      for (const colorType of stableColorTypes) {
        if (palette[colorType]) {
          vibrantColor = palette[colorType];
          break;
        }
      }
      
      if (vibrantColor) {
        const rgb = vibrantColor.rgb as [number, number, number];
        const hex = vibrantColor.hex;
        
        // 生成径向渐变
        const gradient = `radial-gradient(circle at 100% 0%, rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity}) 0%, rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity * 0.8}) 25%, rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity * 0.6}) 50%, rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity * 0.4}) 75%, var(--color-base-300) 100%)`;
        
        setResult({
          gradient,
          rgb,
          hex,
          isReady: true,
          error: null
        });
      } else {
        // 没有找到合适的颜色
        setResult({
          gradient: fallbackGradient,
          rgb: null,
          hex: null,
          isReady: true,
          error: "No suitable color found"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (import.meta.env.DEV) {
        console.warn("Failed to extract color with node-vibrant:", error);
      }
      
      setResult({
        gradient: fallbackGradient,
        rgb: null,
        hex: null,
        isReady: true,
        error: errorMessage
      });
    }
  }, [imageSrc, fallbackGradient, stableColorTypes, opacity]);

  useEffect(() => {
    extractColor();
  }, [extractColor]);

  return result;
};

/**
 * 工具函数：直接从图片路径提取颜色（不返回状态）
 * @param imageSrc 图片路径或 URL
 * @param options 配置选项
 * @returns Promise<VibrantColorResult>
 */
export const extractVibrantColor = async (
  imageSrc: string,
  options: UseVibrantColorOptions = {}
): Promise<VibrantColorResult> => {
  const {
    fallbackGradient = "var(--color-base-300)",
    colorTypes = ['Vibrant', 'Muted', 'DarkVibrant'],
    opacity = 0.5
  } = options;

  if (!imageSrc) {
    return {
      gradient: fallbackGradient,
      rgb: null,
      hex: null,
      isReady: true,
      error: null
    };
  }

  try {
    const palette = await Vibrant.from(imageSrc).getPalette();
    
    let vibrantColor = null;
    for (const colorType of colorTypes) {
      if (palette[colorType]) {
        vibrantColor = palette[colorType];
        break;
      }
    }
    
    if (vibrantColor) {
      const rgb = vibrantColor.rgb as [number, number, number];
      const hex = vibrantColor.hex;
      
      const gradient = `radial-gradient(circle at 100% 0%, rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity}) 0%, rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity * 0.8}) 25%, rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity * 0.6}) 50%, rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity * 0.4}) 75%, var(--color-base-300) 100%)`;
      
      return {
        gradient,
        rgb,
        hex,
        isReady: true,
        error: null
      };
    } else {
      return {
        gradient: fallbackGradient,
        rgb: null,
        hex: null,
        isReady: true,
        error: "No suitable color found"
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (import.meta.env.DEV) {
      console.warn("Failed to extract color with node-vibrant:", error);
    }
    
    return {
      gradient: fallbackGradient,
      rgb: null,
      hex: null,
      isReady: true,
      error: errorMessage
    };
  }
};
