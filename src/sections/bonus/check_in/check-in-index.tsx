import { BonusListHeader } from "../bonus-components/header";
import { CheckInCard } from "./check-in-card";
import { useTranslation } from "react-i18next";
import Iconify from "@/components/iconify";
import { useNavigate } from "@tanstack/react-router";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModals } from "@/contexts/ModalsProvider";

export function CheckInIndex({ childrenClassName }: { childrenClassName?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const { isAuthenticated } = useAuth();
  const { openSignInModal } = useAuthModals();

  const handleCheckIn = () => {
    if (isAuthenticated) {
      void navigate({ to: "/bonus/check" });
    } else {
      openSignInModal();
    }
  };

  return (
    <BonusListHeader
      
      title={t("bonus:daily_check_in")}
      icon={
        <Iconify icon="custom:check_in_logo" className="w-4 h-4 text-primary" />
      }
      hasArrow={isMobile}
      hasHistory
      jumpTo={() => handleCheckIn()}
      childrenClassName={childrenClassName}
    >
      <CheckInCard />
    </BonusListHeader>
  );
}
