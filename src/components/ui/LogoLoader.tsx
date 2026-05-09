import { getLogoLoaderUrl } from "@/utils/assetPaths";

interface LogoLoaderProps {
  size?: number;
  className?: string;
}

// 品牌名（如 gameOn/1stgame/1stwin），用于获取对应的 logo 路径
const brandTheme = import.meta.env.VITE_THEME || "gameOn";

/**
 * Logo 呼吸动画加载器，与首屏 loader 效果一致
 */
export function LogoLoader({ size = 80, className = "" }: LogoLoaderProps) {
  const logoUrl = getLogoLoaderUrl(brandTheme);

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        animation: "breathe 0.8s ease-in-out infinite",
        transformOrigin: "center",
        willChange: "transform, opacity",
      }}
    >
      <img
        src={logoUrl}
        alt=""
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          display: "block",
        }}
      />
      <style>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
