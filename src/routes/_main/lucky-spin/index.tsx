import { createFileRoute, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { useSpinPoolPrizeList, useUserLuckySpinHome } from "@/hooks/api/useAuth.ts";
import {
  getPrizeImageUrl, InnerConfirmBox,
  InnerContainer,
  InnerDataCard,
  InnerSpinsData,
  InnerSpinsType, SPIN_CURRENCY
} from "@/sections/lucky-spin/components.tsx";
import SpinWheel from "@/sections/lucky-spin/spin-wheel.tsx";
import { SpinsNotify } from "@/sections/lucky-spin/spins-notify.tsx";
import { clsx } from "clsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { publicService } from "@/services/publicService";

export const Route = createFileRoute("/_main/lucky-spin/")({
  async beforeLoad({ context }) {
    const baseConfig = await context.queryClient.fetchQuery({
      queryKey: ["public", "baseConfig"],
      queryFn: () => publicService.getBaseConfig(),
    });

    const lucky_spin = baseConfig?.data?.bonus_switch?.lucky_spin !== 0;
    if (!lucky_spin) {
      throw redirect({ to: "/casino", search: { openLogin: undefined, openSignUp: undefined, redirect: undefined, startapp: undefined, openFinance: undefined } });
    }
  },
  component: RouteComponent
});

function RouteComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentSpin, setCurrentSpin] = useState<"normal" | "mega">("normal");

  const { t } = useTranslation(["luckySpin"]);

  const { user } = useAuth();

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  // 幸运盘 -> 主页信息
  const { data: luckySpin } = useUserLuckySpinHome();

  // 幸运盘 -> 奖池详情接口
  const { data: spinsList, isLoading } = useSpinPoolPrizeList(currentSpin);

  // TODO: 旋转类型配置
  const spinTypeConfig = useMemo(() => ({
    normal: {
      name: t("luckySpin:lucky"),
      count: luckySpin?.data?.lucky_spin_normal_num || 0,
      icon: "/images/lucky-spin/roulette1.png",
      deposit: t("luckySpin:deposit", {
        amount: formatCurrency({
          amount: convertCurrency({
            amount: 20,
            fromCurrency: "USDT",
            toCurrency: user?.currency_fiat ?? "USD",
            exchangeRates
          }),
          currency: user?.currency_fiat ?? "USD",
          showSymbol: true, showCode: false
        }).formatted
      })
    },
    mega: {
      name: t("luckySpin:mega"),
      count: luckySpin?.data?.lucky_spin_mega_num || 0,
      icon: "/images/lucky-spin/roulette2.png",
      deposit: t("luckySpin:deposit", {
        amount: formatCurrency({
          amount: convertCurrency({
            amount: 100,
            fromCurrency: "USDT",
            toCurrency: user?.currency_fiat ?? "USD",
            exchangeRates
          }),
          currency: user?.currency_fiat ?? "USD",
          showSymbol: true, showCode: false
        }).formatted
      })
    }
  }), [luckySpin?.data, user?.currency_fiat, exchangeRates]);

  // TODO: 旋转类型配置
  const currentSpinConfig = spinTypeConfig[currentSpin];

  // TODO: 获奖结果数据
  const handle = (prize: any) => {
    console.info(prize);
  };

  const spins_list = spinsList?.data?.list ?? [];

  const prize_list = useMemo(() => {
    return spins_list.map((p: Record<string, any>, index: number) => {
      const extra_data = p?.extra_data;
      return {
        id: index + 1,
        label:
          extra_data?.prize_name === "User Currency"
            ? user?.currency
            : SPIN_CURRENCY.has(extra_data?.prize_type) ? extra_data?.prize_name : "",
        ...extra_data,
        imageUrl: getPrizeImageUrl(extra_data, user?.currency === "BONUS" ? user?.currency_fiat : user?.currency),
        record_id: p?.id
      };
    });
  }, [spins_list, user?.currency]);

  useEffect(() => {
    const spinType = (location.state as any)?.spinType;
    if (spinType === "mega" || spinType === "normal") {
      setCurrentSpin(spinType);
    }
  }, [location.state]);

  return (
    <div className="max-w-[500px] m-auto md:bg-base-400 md:rounded-xl mb-10">
      <InnerContainer $type={currentSpin} className="p-4 min-h-screen">
        <div className="flex flex-col gap-2">
          {/*获奖的滚动通知*/}
          <SpinsNotify />

          {/*旋转类型切换*/}
          <InnerDataCard className={"bg-base-300/50"}>
            <InnerSpinsData
              name={currentSpinConfig.name}
              count={currentSpinConfig.count}
            />
            <div className="flex items-center gap-2">
              <InnerSpinsType
                icon={<img className={"w-6 h-6"} src={spinTypeConfig.normal.icon} alt="" />}
                title={t("luckySpin:lucky")}
                active={currentSpin === "normal"}
                onClick={() => setCurrentSpin("normal")}
                extra={currentSpinConfig.count > 0 &&
                  <span className="absolute rounded-full w-2 h-2 top-0 right-0" style={{ background: "#0B965D" }} />}
                className={clsx(currentSpin === "normal" ? "hidden" : "block")}
              />
              <InnerSpinsType
                icon={<img className={"w-6 h-6"} src={spinTypeConfig.mega.icon} alt="" />}
                title={t("luckySpin:mega")}
                active={currentSpin === "mega"}
                onClick={() => setCurrentSpin("mega")}
                extra={currentSpinConfig.count > 0 &&
                  <span className="absolute rounded-full w-2 h-2 top-0 right-0" style={{ background: "#EB53C1" }} />}
                className={clsx(currentSpin === "mega" ? "hidden" : "block")}
              />
            </div>
          </InnerDataCard>
        </div>

        {/*旋转轮盘入口*/}
        <div className={"mt-6"}>
          <SpinWheel
            prizes={prize_list}
            loading={isLoading}
            spinType={currentSpin}
            showSpin={Number(currentSpinConfig?.count) > 0}
            extraNode={
              !isLoading && Number(currentSpinConfig?.count) === 0 &&
              <InnerConfirmBox
                $type={currentSpin}
                className={"h-14 font-bold bg-transparent border-none text-base-content"}
                onClick={() => void navigate({ to: "/deposit" })}>
                {currentSpinConfig?.deposit}
              </InnerConfirmBox>}
            onSpinResult={handle}
          />
        </div>
      </InnerContainer></div>
  );
}