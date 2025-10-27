import { cn } from "@/utils/cn.ts";
import { useTranslation } from "react-i18next";

export const Applied = ({ cls }: { cls?: string }) => {
  const { t } = useTranslation();

  return (
    <button className={cn("btn btn-primary z-10 ", cls)}>
      {t("finance:applied")}
    </button>
  );
};
