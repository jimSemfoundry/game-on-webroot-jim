import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

export const LastUpdate = () => {
  const { t } = useTranslation();

  const versionRaw = String(import.meta.env.VITE_VERSION ?? "");
  const versionMs = versionRaw ? Number(versionRaw) : null;
  const versionLabel = versionMs === null ? null : dayjs(versionMs).format("DD MMM'YY T HH:mm Z");

  return (
    <button
      type="button"
      className="btn justify-start w-full h-6.5 rounded-md"
    >
      <span className={"tracking-tighter truncate text-[12px] text-base-content/60 font-bold"}>{t("transaction:details.lastUpdate")} {versionLabel}</span>
    </button>
  );
};