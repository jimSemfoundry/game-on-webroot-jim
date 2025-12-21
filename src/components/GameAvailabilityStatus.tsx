import { GlobeLock, LockKeyhole } from "lucide-react";
import { useMemo, useState } from "react";
import { AnimatePresence, m as motion } from "motion/react";
import classNames from "classnames";
import {
  fn_ban_regions,
  fn_ban_support_settlement_currencies, fn_regions,
  fn_support_settlement_currencies
} from "@/utils/helper";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useCountryCodeByIp } from "@/sections/profile/security/helper.ts";
import { InnerContentVisible } from "@/components/header/message-v2/c/InnerComponents.tsx";
import { useBanGameList } from "@/query/game.ts";

export const GameAvailabilityStatus = (
  {
    data, sample, className, enabledBanGameList
  }: { data: Record<string, any>, sample?: boolean, className?: string, enabledBanGameList?: boolean }) => {
  const { t } = useTranslation();

  const { user } = useAuth();

  // 根据IP获取地区
  const { data: country } = useCountryCodeByIp();

  // 游戏是否被禁止的辅助数据
  const { data: banGameList } = useBanGameList(enabledBanGameList);

  const [visible, setVisible] = useState<{ [key: string]: boolean } | null>(null);

  // 结算币禁止
  const is_currency_settlement_prohibited = useMemo(() => {
    // method 1: 如果提供的游戏数据中没有提供 ban_support_settlement_currencies 字段的时候需要使用辅助判断方式 useBanGameList(enabledBanGameList)
    if (enabledBanGameList && banGameList?.data) {
      const ban_currency_games = banGameList?.data?.ban_currency_games ?? [];
      return ban_currency_games.find((inner_game_id: string) => inner_game_id === data?.inner_game_id);
    }

    // method 2: 游戏数据中提供了 support_settlement_currencies ban_support_settlement_currencies 字段
    const current_settlement_currency = user?.currency ?? "";

    const limit1 = fn_ban_support_settlement_currencies(data?.ban_support_settlement_currencies ?? "", current_settlement_currency);
    const limit2 = fn_support_settlement_currencies(data?.support_settlement_currencies ?? "", current_settlement_currency);

    return limit1 || limit2;
  }, [data, banGameList, user?.currency]);

  // 地区禁止
  const is_regional_access_prohibited = useMemo(() => {
    // method 1: 如果提供的游戏数据中没有提供 ban_regions 字段的时候需要使用辅助判断方式 useBanGameList(enabledBanGameList)
    if (enabledBanGameList && banGameList?.data) {
      const ban_ip_games = banGameList?.data?.ban_ip_games ?? [];
      return ban_ip_games.find((inner_game_id: string) => inner_game_id === data?.inner_game_id);
    }

    // method 2: 游戏数据中提供了 ban_regions 字段
    const country_code = country?.data?.country_code ?? "";

    const limit1 = fn_ban_regions(data?.ban_regions ?? "", country_code);
    const limit2 = fn_regions(data?.regions ?? "", country_code);

    return limit1 || limit2;
  }, [data, country?.data?.country_code, banGameList]);

  return ((is_currency_settlement_prohibited || is_regional_access_prohibited) && <div
    onClick={(e) => {
      e.stopPropagation();
      return false;
    }}
    className={classNames("font-bold text-[10px] bg-base-300/75 top-0 bottom-0 w-full flex justify-end p-1.5 z-11 text-white", className,
      {
        "absolute": !sample,
        "bg-base-300/90": visible?.["is_currency_settlement_prohibited"] || visible?.["is_regional_access_prohibited"]
      })}>
    <InnerContentVisible
      show={is_currency_settlement_prohibited && !is_regional_access_prohibited}
      className={"w-full h-full"}
      onClick={() => {
        if (!sample) setVisible((v) => ({
          ...v,
          is_currency_settlement_prohibited: !visible?.["is_currency_settlement_prohibited"]
        }));
      }}>
      <InnerContentVisible show={!sample && !visible?.["is_currency_settlement_prohibited"]}
                           className={"flex justify-end"}>
        <LockKeyhole className={"w-5 h-5"} />
      </InnerContentVisible>
      <div className="text-center w-full h-full flex items-center justify-center">
        <AnimatePresence>
          {!sample && visible?.["is_currency_settlement_prohibited"] && <motion.div
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className={"flex flex-col items-center justify-center gap-1"}>
              <LockKeyhole className={"w-4 h-4 m-auto"} />
              {t("common:common.gameAccessibleToCurrencies", "This game is accessible to currencies without active bonuses.")}
            </div>
          </motion.div>}
        </AnimatePresence>
        {sample && <div className={"flex flex-col items-center justify-center gap-1"}>
          <LockKeyhole className={"w-5 h-5 m-auto"} />
          {t("common:common.gameAccessibleToCurrencies", "This game is accessible to currencies without active bonuses.")}
        </div>}
      </div>
    </InnerContentVisible>

    <InnerContentVisible
      show={is_regional_access_prohibited}
      className={"w-full h-full"}
      onClick={() => {
        setVisible((v) => ({ ...v, is_regional_access_prohibited: !visible?.["is_regional_access_prohibited"] }));
      }}>
      <InnerContentVisible show={!visible?.["is_regional_access_prohibited"]} className={"flex justify-end"}>
        <GlobeLock className={"w-5 h-5"} />
      </InnerContentVisible>
      <div className="text-center w-full h-full flex items-center justify-center">
        <AnimatePresence>
          {visible?.["is_regional_access_prohibited"] && <motion.div
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className={"flex flex-col items-center justify-center gap-1"}>
              <GlobeLock className={"w-4 h-4 m-auto"} />
              {t("common:common.gameNotAccessibleInYourRegion", "This game is not accessible in your region.")}
            </div>
          </motion.div>}
        </AnimatePresence>
      </div>
    </InnerContentVisible>
  </div>);
};