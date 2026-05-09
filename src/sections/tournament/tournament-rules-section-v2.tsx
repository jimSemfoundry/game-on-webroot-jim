import { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import type { ITournament } from "@/types/tournament";
import { ChevronRight } from "lucide-react";
import { useGameCategories } from "@/hooks/api/usePublic.ts";
import Decimal from "decimal.js";
import { useTournamentPoolPrize } from "@/hooks/api/useAuth.ts";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import { TOURNAMENT_PRIZE_POOL } from "@/sections/tournament/components/prizePool.ts";

interface TournamentRulesSectionProps {
  data: ITournament | null;
}

/**
 * 非通用版本
 * @param data
 * @constructor
 */
export function TournamentRulesSectionV2({ data }: TournamentRulesSectionProps) {
  const { t } = useTranslation("tournament");

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const { data: categories } = useGameCategories();

  const { data: livePrize } = useTournamentPoolPrize(data?.user_info?.tournament_id, data?.user_info?.tournament_level);

  const prize = livePrize ?? data?.user_info?.prize ?? 0;

  const formattedPrize = formatWithConversion(prize, "USD", {
    showCode: false,
    showSymbol: true
  });

  return (
    <div className="pt-4 font-semibold">
      <details
        open
        className="!bg-base-200 cursor-pointer group collapse bg-base-300 outline-none">
        <summary className="list-none select-none">
          <h4 className={"font-bold flex items-center justify-between gap-4"}>
            <div className="text-left">
              <h2 className="text-sm font-bold text-base-content">
                {t("tournament:rakerace.title")}
              </h2>
              <p className="font-normal text-xs sm:text-sm leading-5 text-base-content/70">
                {t("tournament:beginnerDescription")}
              </p>
            </div>
            <div className="btn btn-square bg-base-100 text-base-content/50">
              <ChevronRight
                className="w-4 h-4 transition-transform duration-200 group-open:rotate-90"
              />
            </div>
          </h4>
        </summary>
        <div className={"font-semibold collapse-content p-0 space-y-4"}>
          <InnerArticle
            title=""
            content={
              <Trans
                i18nKey={"tournament:rakerace.desc"}
                values={{ prize: formattedPrize.formatted, players: "1,000" }}
                components={[<span className="text-primary" />]} />
            } />

          <InnerArticle
            title={t("tournament:rakerace.p0_title")}
            content={<Trans
              i18nKey={"tournament:rakerace.p0_desc"}
              values={{ start: "(00:00 GMT)", end: "(23:59 GMT)" }}
              components={[<span className="text-primary" />]} />} />

          <details
            className="!bg-base-200 cursor-pointer group/more collapse bg-base-300 outline-none flex flex-col-reverse">
            <summary className="list-none select-none text-center">
              <div className={"btn bg-base-100 w-full sm:w-60 text-base-content/50 text-xs font-bold"}>
                <span className="group-open/more:hidden">{t('casino:moreInfo')}</span>
                <span className="hidden group-open/more:inline uppercase">{t('casino:show_less')}</span>
              </div>
            </summary>
            <div className={"font-semibold collapse-content p-0 space-y-4 mb-4"}>
              <InnerArticle
                title={t("tournament:rakerace.p1_title")}
                content={<Trans i18nKey={"tournament:rakerace.p1_desc"} />} />

              <InnerArticle
                title={t("tournament:rakerace.p2_title")}
                content={<div className={"grid grid-cols-1 md:grid-cols-2 gap-2"}>
                  {(categories?.data ?? []).map((r: Record<string, any>) => {
                    if (r?.parent_name_key !== "-") return;
                    const label = String(t(`explore:${r.name_key}`, r.name || r.categoryName || r.title || ""));
                    return <div className={"rounded-md p-2 bg-base-100 text-xs flex justify-between"}>
                      <span className="flex-1 mr-2 break-words">{label}</span>
                      <span
                        className="font-medium whitespace-nowrap">{Decimal(r?.group_rate || 0).mul(100).toDP(8).toString()}%</span>
                    </div>;
                  })}
                </div>} />

              <InnerArticle
                title={t("tournament:rakerace.p3_title")}
                content={<Trans i18nKey={"tournament:rakerace.p3_desc"} values={{ places: "1,000", players: "1,000" }}
                                components={[<span className="text-primary" />]} />} />

              <InnerArticle
                title={<div className={"flex justify-between"}>
                  <span>{t("tournament:rank")}</span>
                  <span>{t("tournament:prize")}</span>
                </div>}
                content={<div className={"grid grid-cols-1 md:grid-cols-2 gap-2"}>
                  {TOURNAMENT_PRIZE_POOL.map((r: Record<string, any>) => {
                    return <div
                      className="rounded-md p-2 text-xs flex justify-between bg-base-100">
                      <span>{r.rank}</span>
                      <span>{formatWithConversion(r.prize, "USD", {
                        showCode: false,
                        showSymbol: true
                      }).formatted}</span>
                    </div>;
                  })}
                </div>} />

              <InnerArticle
                title={t("tournament:rakerace.p4_title")}
                content={<Trans i18nKey={"tournament:rakerace.p4_desc"} />} />

              <InnerArticle
                title={t("tournament:rakerace.p5_title")}
                content={<Trans i18nKey={"tournament:rakerace.p5_desc"} />} />

              <InnerArticle
                title={t("tournament:rakerace.p6_title")}
                content={<Trans i18nKey={"tournament:rakerace.p6_desc"} values={{ token: "USDT" }} />} />

            </div>
          </details>
        </div>
      </details>
    </div>
  );
}

const InnerArticle = ({ title, content }: { title: ReactNode, content: ReactNode }) => {
  return (<div>
    <h3 className="text-sm font-bold text-base-content mb-2">{title}</h3>
    <div className={"text-xs sm:text-sm text-base-content/50 whitespace-pre-line"}>{content}</div>
  </div>);
};