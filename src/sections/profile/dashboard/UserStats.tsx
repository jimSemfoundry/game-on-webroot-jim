import { useAuth } from "@/contexts/AuthContext.tsx";
import clasNames from "classnames";
import { useTranslation } from "react-i18next";
import { Card } from "@/sections/profile/c/Card.tsx";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import Iconify from "@/components/iconify";

export function UserStats() {
  const { status } = useAuth();
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  return (
    <Card 
      icon={<Iconify icon="custom:stats" className="text-primary" />}
      title={t("common:common.stats")}
    >
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <InnerItem
          amount={Number(status?.bet_win_times ?? 0).toLocaleString()}
          title={t("common.totalWins")} />
        <InnerItem amount={Number(status?.bet_times || 0).toLocaleString()} title={t("common.totalBets")} />
        <InnerItem
          amount={formatWithConversion(status?.bet_in_ori || 0, "USDT", { showSymbol: true, showCode: false }).formatted}
          title={t("common.totalWagered")} className="col-span-2 md:col-span-1" />
      </div>
    </Card>
  );
}

const InnerItem = ({ title, amount, className }: { title: string, amount: string | number, className?: string }) => {
  return (<div
    className={clasNames("bg-base-300 flex flex-col items-center justify-center rounded-lg p-2", className)}>
    <p className="text-xs text-base-content/50">{title}</p>
    <p className="text-lg font-bold">
      {amount}
    </p>
  </div>);
};
