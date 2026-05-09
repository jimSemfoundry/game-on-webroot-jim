import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { ESport } from "@/sections/dollars/components.tsx";

// TODO: 自定义轻量级toast提示模式
export const InnerToastCustom = (
  {
    tst
  }: {
    tst: any,
  }) => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { updateSettlementCurrency } = useSettlementCurrency();

  return <div
    className="flex flex-col gap-4 rounded-xl p-4 relative sm:min-w-[380px] h-[160px]"
    style={{
      fontFamily: "var(--font-family)",
      background: `url('/images/bonus/football.png') no-repeat 100%/100%`
    }}>

    <div className={clsx("flex flex-col gap-4 p-4 px-2")}>
      <div className={clsx("flex items-center gap-2")}>
        <img src={"/images/bonus/sport.png"} className="h-10" alt="" />
        <div
          className={clsx("font-bold text-sm leading-4")}>
          {t("bonus:switch_prompt_title")}
        </div>
      </div>

      <div className="flex gap-2 items-center w-full">
        <ConfirmBox onClick={() => {
          toast.dismiss(tst);

          // TODO: 跳转体育的iframe页面
          void navigate({ to: "/dollars/sports-bonus" });
        }} className={"w-auto flex-1 btn-outline btn-sm"}>{t("bonus:switch_prompt_more")}</ConfirmBox>

        <ConfirmBox onClick={() => {
          toast.dismiss(tst);

          try {
            // TODO: 切换体育彩金币种
            void updateSettlementCurrency(ESport.TOKEN);
          } catch (e) {
          }
        }} className={"w-auto flex-1 btn-sm"}>{t("bonus:switch_prompt_switch")}</ConfirmBox>
      </div>
    </div>
  </div>;
};