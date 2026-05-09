import { GlobeLock, LockKeyhole } from "lucide-react";
import { type PointerEvent, useCallback, useEffect, useMemo, useState } from "react";
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
import clsx from "clsx";

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

  const [visibleKey, setVisibleKey] = useState<string | null>(null);

  const handlePointerEnter = useCallback((e: PointerEvent) => {
    if (sample) return;
    if (e.pointerType !== "mouse") return;
    const key = (e.currentTarget as HTMLElement)?.dataset?.visibleKey;
    if (!key) return;
    setVisibleKey(key);
  }, [sample]);

  const handlePointerLeave = useCallback((e: PointerEvent) => {
    if (sample) return;
    if (e.pointerType !== "mouse") return;
    setVisibleKey(null);
  }, [sample]);

  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (sample) return;
    if (e.pointerType === "mouse") return;
    const key = (e.currentTarget as HTMLElement)?.dataset?.visibleKey;
    if (!key) return;
    setVisibleKey((prev) => (prev === key ? null : key));
  }, [sample]);

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
  }, [banGameList?.data, data?.inner_game_id, data?.ban_support_settlement_currencies, data?.support_settlement_currencies, enabledBanGameList, user?.currency]);
  // const is_currency_settlement_prohibited = true

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
  }, [banGameList?.data, country?.data?.country_code, data?.inner_game_id, data?.ban_regions, data?.regions, enabledBanGameList]);

  useEffect(() => {
    if (data?.inner_game_id === "wi17jwsu4de7c") {
      console.info(data?.display_game_name);
      console.info("regions=", data?.regions);
      console.info("ban_regions=", data?.ban_regions);
      console.info("support_settlement_currencies=", data?.support_settlement_currencies);
      console.info("ban_support_settlement_currencies=", data?.ban_support_settlement_currencies);
      console.info("is_regional_access_prohibited=", is_regional_access_prohibited);
      console.info("is_currency_settlement_prohibited=", is_currency_settlement_prohibited);
    }
  }, [data, is_currency_settlement_prohibited, is_regional_access_prohibited]);

  return (!sample && (is_currency_settlement_prohibited || is_regional_access_prohibited) && <div
      onClick={(e) => {
        e.stopPropagation();
        return false;
      }}
      className={clsx("h-full absolute font-bold text-[12px] bg-info/55 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] overflow-hidden top-0 bottom-0 w-full flex justify-end z-9 text-white", className,
        "hover:bg-info/85")}>
      <InnerContentVisible
        show={is_currency_settlement_prohibited && !is_regional_access_prohibited}
        className={"w-full h-full"}
        data-visible-key={"is_currency_settlement_prohibited"}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}>
        <InnerContentVisible show={visibleKey !== "is_currency_settlement_prohibited"} className={"flex justify-end"}>
          <LockKeyhole className={"w-6 h-6 m-1"} />
        </InnerContentVisible>
        <div className="text-center w-full h-full flex items-center justify-center">
          <InnerContentVisible show={visibleKey === "is_currency_settlement_prohibited"}>
            <div
              className={"flex flex-col items-center justify-center gap-1 leading-tight m-1 whitespace-break-spaces"}>
              <LockKeyhole className={"w-5 h-5 m-auto"} />
              {t("common:common.gameAccessibleToCurrencies", "This game is accessible to currencies without active bonuses.")}
            </div>
          </InnerContentVisible>
        </div>
      </InnerContentVisible>

      <InnerContentVisible
        show={is_regional_access_prohibited}
        className={"w-full h-full"}
        data-visible-key={"is_regional_access_prohibited"}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}>
        <InnerContentVisible show={visibleKey !== "is_regional_access_prohibited"} className={"flex justify-end"}>
          <GlobeLock className={"w-6 h-6 m-1"} />
        </InnerContentVisible>
        <div className="text-center w-full h-full flex items-center justify-center">
          <InnerContentVisible show={visibleKey === "is_regional_access_prohibited"}>
            <div
              className={"flex w-full max-w-full flex-col items-center justify-center gap-1 overflow-hidden px-2 py-1 text-center text-[10px] leading-tight whitespace-normal"}>
              <GlobeLock className={"w-5 h-5 shrink-0"} />
              <span
                className="block w-full max-w-full whitespace-normal wrap-break-word hyphens-auto">{t("common:common.gameNotAccessibleInYourRegion", "This game is not accessible in your region.")}</span>
            </div>
          </InnerContentVisible>
        </div>
      </InnerContentVisible>
    </div>
  );
};