import { useSidebar } from "@/contexts/SidebarContext";
import { WebEnvLabel } from "@/components/WebEnvLabel.tsx";
import { getLogoFullUrl } from "@/utils/assetPaths";

export default function Logo() {
  const { isMobile } = useSidebar();
  const theme = import.meta.env.VITE_THEME ?? "1stgame";
  const logoSrc = getLogoFullUrl(theme);

  if (isMobile) {
    return (
      <div className="flex items-center gap-2 relative">
        <img src={logoSrc} alt="logo"
             className="object-contain max-h-[20px]" />
        <WebEnvLabel />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 relative">
      <img src={logoSrc} alt="logo" className="w-[162px] h-[29px]" />
      <WebEnvLabel />
    </div>
  );
}
