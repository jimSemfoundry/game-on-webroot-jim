import { useTranslation } from "react-i18next";
import { UnAuthCard } from "../bonus-components/unAuth-card.tsx";
import { Card } from "./card.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";

const Index = () => {
  const { t } = useTranslation(["luckySpin"]);

  const { isAuthenticated } = useAuth();

  // 基础配置数据
  const { data: baseConfig } = useBaseConfig();

  // TODO: 是否开启lucky_spin
  const lucky_spin = baseConfig?.data?.bonus_switch?.lucky_spin !== 0;

  return (
    <>
      {lucky_spin && isAuthenticated && (<Card />)}
      {lucky_spin && !isAuthenticated && (
        <UnAuthCard
          title={t("luckySpin:fortune")}
          imgSrc="/images/lucky-spin/spins.png"
          bgcolor="radial-gradient(100% 308% at 100% 0%, rgba(255, 66, 198, 0.50) 0%, rgba(14, 20, 27, 0.50) 100%)"
        />
      )}
    </>
  );
};

export default Index;