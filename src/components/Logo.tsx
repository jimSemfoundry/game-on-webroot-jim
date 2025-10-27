import { useAuth } from "@/contexts/AuthContext.tsx";
import { useSidebar } from "@/contexts/SidebarContext";
// import Iconify from "./iconify";

export default function Logo() {
  const { isMobile } = useSidebar();

  const { isAuthenticated } = useAuth();

  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        {/* <Iconify icon={isAuthenticated ? "custom:logo-m" : "custom:logo"} width={114} height={20} className="text-primary" /> */}
        <img src={isAuthenticated ? `/logos/${import.meta.env.VITE_THEME}/logo-full.svg` : `/logos/${import.meta.env.VITE_THEME}/logo-m.svg`} alt="logo" className="w-[114px] h-[20px]" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {/* <Iconify icon="custom:logo" width={162} height={29} className="text-primary" /> */}
      <img src={`/logos/${import.meta.env.VITE_THEME}/logo-full.svg`} alt="logo" className="w-[162px] h-[29px]" />
    </div>
  );
}
