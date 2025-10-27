import { useCallback, useRef, useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";
import { createBonusGradient } from "@/sections/bonus/styles";

export interface ImageColorCardProps {
  /** 卡片内容 */
  children: React.ReactNode;
  /** 图片URL，用于提取颜色 */
  imageUrl?: string;
  /** 图片元素的ref，如果传入则从此元素提取颜色 */
  imageRef?: React.RefObject<HTMLImageElement>;
  /** 默认背景样式 */
  defaultBackground?: string;
  /** 卡片的CSS类名 */
  className?: string;
  /** 卡片的内联样式 */
  style?: React.CSSProperties;
  /** 颜色提取完成的回调 */
  onColorExtracted?: (color: string) => void;
  /** 渐变生成模式 */
  gradientMode?: 'radial' | 'linear';
  /** 颜色透明度 */
  colorOpacity?: number;
  /** 是否启用颜色提取 */
  enableColorExtraction?: boolean;
}

/**
 * 基于图片颜色自动生成背景的通用卡片组件
 * 
 * 特性：
 * - 自动从图片提取主要颜色
 * - 生成渐变背景
 * - 支持回退到默认背景
 * - 可配置渐变模式和透明度
 */
export const ImageColorCard = ({
  children,
  imageUrl,
  imageRef,
  defaultBackground = "var(--color-base-300)",
  className = "",
  style = {},
  onColorExtracted,
  gradientMode = 'radial',
  colorOpacity = 0.4,
  enableColorExtraction = true,
}: ImageColorCardProps) => {
  const [extractedBackground, setExtractedBackground] = useState<string>(defaultBackground);
  const internalImageRef = useRef<HTMLImageElement>(null);
  
  // 使用传入的ref或内部ref
  const targetImageRef = imageRef || internalImageRef;

  const extractImageColor = useCallback(async () => {
    if (!enableColorExtraction) {
      setExtractedBackground(defaultBackground);
      onColorExtracted?.(defaultBackground);
      return;
    }

    const imgElement = targetImageRef.current;
    if (!imgElement) return;

    const fac = new FastAverageColor();
    
    try {
      // 等待图片完全加载
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const color = fac.getColor(imgElement, {
        algorithm: 'simple',
        mode: 'speed',
        ignoredColor: [
          [255, 255, 255, 255, 50], // 忽略白色
          [0, 0, 0, 255, 80],       // 忽略黑色
        ]
      });
      
      let r, g, b;
      
      // 解析颜色值
      if (color.value && Array.isArray(color.value) && color.value.length >= 3) {
        [r, g, b] = color.value;
      } else if (color.rgb && typeof color.rgb === 'string') {
        const matches = color.rgb.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/);
        if (matches) {
          r = parseInt(matches[1]);
          g = parseInt(matches[2]);
          b = parseInt(matches[3]);
        }
      } else if (color.hex) {
        const hex = color.hex.replace('#', '');
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
      
      if (r !== undefined && g !== undefined && b !== undefined && !isNaN(r) && !isNaN(g) && !isNaN(b)) {
        // 生成渐变背景
        const accent = `rgba(${r}, ${g}, ${b}, ${colorOpacity})`;
        const gradient = gradientMode === 'radial' 
          ? createBonusGradient(accent)
          : `
              linear-gradient(135deg, rgba(${r}, ${g}, ${b}, ${colorOpacity}) 0%, var(--color-base-300) 100%),
              linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
            `;
        
        setExtractedBackground(gradient);
        onColorExtracted?.(gradient);
      } else {
        setExtractedBackground(defaultBackground);
        onColorExtracted?.(defaultBackground);
      }
      
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to extract color from image:', error);
      }
      setExtractedBackground(defaultBackground);
      onColorExtracted?.(defaultBackground);
    }
  }, [targetImageRef, defaultBackground, onColorExtracted, gradientMode, colorOpacity, enableColorExtraction]);

  // 当图片URL变化时，重新提取颜色
  useEffect(() => {
    if (imageUrl && enableColorExtraction) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (targetImageRef.current) {
          targetImageRef.current.src = img.src;
          extractImageColor();
        }
      };
      img.onerror = () => {
        setExtractedBackground(defaultBackground);
        onColorExtracted?.(defaultBackground);
      };
      img.src = imageUrl;
    }
  }, [imageUrl, extractImageColor, defaultBackground, onColorExtracted, enableColorExtraction, targetImageRef]);

  const handleImageLoad = useCallback(() => {
    extractImageColor();
  }, [extractImageColor]);

  const handleImageError = useCallback(() => {
    setExtractedBackground(defaultBackground);
    onColorExtracted?.(defaultBackground);
  }, [defaultBackground, onColorExtracted]);

  return (
    <div
      className={className}
      style={{
        background: extractedBackground,
        ...style,
      }}
    >
      {/* 隐藏的图片元素，用于颜色提取 */}
      {imageUrl && !imageRef && (
        <img
          ref={internalImageRef}
          src={imageUrl}
          alt=""
          className="hidden"
          onLoad={handleImageLoad}
          onError={handleImageError}
          crossOrigin="anonymous"
        />
      )}
      
      {children}
    </div>
  );
};

export default ImageColorCard;
