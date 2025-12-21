import { useSidebar } from "@/contexts/SidebarContext";
import { WebEnvLabel } from "@/components/WebEnvLabel.tsx";

export default function Logo() {
  const { isMobile } = useSidebar();

  if (isMobile) {
    return (
      <div className="flex items-center gap-2 relative">
        <img src={`/logos/${import.meta.env.VITE_THEME}/logo-full.svg`} alt="logo"
             className="object-contain max-h-[18px]" />
        <WebEnvLabel />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 relative">
      <img src={`/logos/${import.meta.env.VITE_THEME}/logo-full.svg`} alt="logo" className="w-[162px] h-[29px]" />
      <WebEnvLabel />
    </div>
  );
}
