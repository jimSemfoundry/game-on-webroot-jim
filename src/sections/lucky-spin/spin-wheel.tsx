import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Wheel } from "spin-wheel";
import { HistoryIcon } from "lucide-react";
import {
  deepColors, getPrizeImageUrl, imageScale,
  InnerBonusItem, InnerConfirmBox, InnerPrizeDisplay,
  loadImage,
  SPIN_BUFFER,
  SPIN_DURATION, SPIN_WHEEL_CONFIG
} from "@/sections/lucky-spin/components.tsx";
import { authService } from "@/services/authService.ts";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { InnerToastCustom } from "@/sections/dollars/components.tsx";
import { useBoundStore } from "@/store";
import clsx from "clsx";
import { useNavigate } from "@tanstack/react-router";
import { useUserLuckySpinHome } from "@/hooks/api/useAuth.ts";
import { useEarliestPendingRecord } from "@/query/free-spins.tsx";

const SpinWheel = ({ prizes, loading = true, spinType, showSpin, extraNode, onSpinResult }: any) => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const wheelRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 幸运盘 -> 主页信息
  const { refetch: refetchLuckySpin } = useUserLuckySpinHome();

  // TODO: 是否有FreeSpin可用
  const { refetch: refetchPendingSpin } = useEarliestPendingRecord();

  const openModal = useBoundStore((state) => state.openModal);

  const [spinning, setSpinning] = useState(false);
  const [changingType, setChangingType] = useState(false);
  const [winRecords, setWinRecords] = useState<any[]>([]);

  const count = prizes.length;

  // Handle spin type change for transition effect
  useEffect(() => {
    setChangingType(true);
    const timer = setTimeout(() => {
      setChangingType(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [spinType]);

  // TODO: 轮盘处理
  useEffect(() => {
    if (!containerRef.current || count < 2) return;

    let cancelled = false;
    containerRef.current.innerHTML = "";

    // TODO: 创建轮盘的前置资源处理
    const buildWheelFn = async () => {
      // TODO: 安全加载图片资源
      const imagePromises = prizes.map(async (p: { imageUrl: string; }) => {
        if (p.imageUrl) {
          try {
            return await loadImage(p.imageUrl);
          } catch {
            return null;
          }
        }
        return null;
      });

      const imageResponse = await Promise.all(imagePromises);
      if (cancelled || !containerRef.current) return;

      // TODO: 创建轮盘奖励内容静态数据
      const items = prizes.map((p: Record<string, any>, i: number) => {
        const item: Record<string, any> = {
          label: p.label,
          backgroundColor: deepColors[i % deepColors.length]
        };
        if (imageResponse[i]) {
          item.image = imageResponse[i];
          item.imageRadius = 0.72;         // 图标距离圆心的位置（0-1，越大越靠外）
          item.imageScale = imageScale(p); // 图标显示的大小
        }
        return item;
      });

      // TODO: 创建轮盘canvas
      wheelRef.current = new Wheel(containerRef.current, { items, ...SPIN_WHEEL_CONFIG });
    };

    // TODO: 创建轮盘
    void buildWheelFn();

    // TODO: 卸载时候的清理
    return () => {
      cancelled = true;
      wheelRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [prizes, count]);

  const showBaseToast = useCallback((params: {
    icon: string;
    title: string;
    subTitle: ReactNode;
  }) => {
    toast.custom(
      (tst) => (
        <InnerToastCustom
          closeBtn
          tst={tst}
          icon={params.icon}
          title={params.title}
          subTitle={params.subTitle}
          onConfirm={() => console.info("onClose")}
        />
      ),
      { duration: 6_000, position: "top-right" }
    );
  }, []);

  const showErrorToast = useCallback((i18nKey: string) => {
    showBaseToast({
      icon: "/images/dollars/bonus-error.png",
      title: t("transaction:transactionStatus.failed"),
      subTitle: <Trans i18nKey={i18nKey} />
    });
  }, [showBaseToast, t]);

  const handle = useCallback(async () => {
    try {
      if (spinning || count < 2 || !wheelRef.current) return;

      // TODO: 清除之前的定时器（如果存在）
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);

      // TODO: 查询用户的中奖情况, 用于匹配轮盘最终的落点
      const response = await authService.userLuckySpinLottery(spinType);

      if (response?.code === 0 || response?.code === 200) {
        // TODO: 成功消耗一次旋转机会
        void refetchLuckySpin();
      } else {
        /**
         * const CODE_LUCKY_SPIN_INVALID_TYPE = 51058; // type 参数无效
         * const CODE_LUCKY_SPIN_NO_CHANCE = 51059; // 抽奖次数不足
         * const CODE_LUCKY_SPIN_WIN_RECORD_NOT_FOUND = 51060; // 未找到未领取的中奖记录
         * const CODE_LUCKY_SPIN_INVALID_EXTRA_DATA = 51061; // extra_data 无效
         * const CODE_LUCKY_SPIN_UNSUPPORTED_PRIZE_TYPE = 51062; // 不支持的 prize_type
         * const CODE_LUCKY_SPIN_BUDDY_BALLS_EMPTY_CONFIG = 51063; // buddy_balls 配置为空
         * const CODE_LUCKY_SPIN_CLAIM_WIN_RECORD_FAILED = 51064; // 领取中奖记录失败（乐观锁冲突等）
         * const CODE_LUCKY_SPIN_UPDATE_USER_STATUS2_FAILED = 51065; // 更新 user_status2 失败（乐观锁冲突等）
         * const CODE_LUCKY_SPIN_UPDATE_BUDDY_BALLS_FAILED = 51066; // 更新 user_status2.buddy_balls 失败（乐观锁冲突等）
         */
        showErrorToast("");
        return;
      }

      console.info(prizes);
      console.info(response?.data);

      // TODO: 确定中奖索引：有prizeId则查找，找不到或无prizeId则随机
      const foundIndex = response?.data?.record_id ? prizes.findIndex((p: {
        prize_type: string;
        prize_name: string;
        prize_currency: string;
      }) => (
        p?.prize_type === response?.data?.extra_data?.prize_type &&
        p?.prize_name === response?.data?.extra_data?.prize_name
      )) : -1;
      const targetIndex = foundIndex !== -1 ? foundIndex : Math.floor(Math.random() * count);

      setSpinning(true);

      // TODO: 设置轮盘最终的落点
      wheelRef.current.spinToItem(targetIndex, SPIN_DURATION, true, 5, 1);

      // TODO: 动画结束后回调
      spinTimerRef.current = setTimeout(() => {
        setSpinning(false);
        onSpinResult?.(prizes[targetIndex]);
        spinTimerRef.current = null;

        // TODO: 成功消耗一次旋转机会
        openModal("OPEN_WHEEL_FORTUNE_WIN_MODAL", { ...response?.data });

        // TODO: 记录用户操作
        setWinRecords(prev => [response?.data, ...prev]);

        // TODO: 需要优化
        response?.data?.extra_data?.prize_type === "free_spin" && void refetchPendingSpin();
      }, SPIN_DURATION + SPIN_BUFFER);
    } catch (_error) {
      showErrorToast("");
    }
  }, [spinning, count, prizes, spinType, onSpinResult]);

  return (
    <div className="flex flex-col items-center gap-5 h-full">
      <div className={clsx(
        "relative w-[338px] h-[338px] flex justify-center transition-all duration-300 ease-in-out",
        changingType && "opacity-80 scale-95"
      )}>
        {/*轮盘背景*/}
        {!loading &&
          (spinType === "mega"
            ? <img className="absolute z-1"
                   src="/images/lucky-spin/wheel2-bg.png" />
            : <img className="absolute z-1"
                   src="/images/lucky-spin/wheel1-bg.png" />)}

        {/*轮盘阴影*/}
        <img
          className={clsx("absolute z-3", spinType === "mega" && "!top-[0px] !left-[0px]")}
          src="/images/lucky-spin/mask.png" />

        {/*轮盘星空*/}
        <img
          className={`absolute z-3 ${loading ? "animate-spin" : ""}`}
          src="/images/lucky-spin/star.png"
        />

        {/*轮盘指针*/}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-3">
          <img src="/images/lucky-spin/pointer.png" alt="" />
        </div>

        {/*奖励区域*/}
        <div ref={containerRef} className="absolute z-2 w-full h-full rounded-full overflow-hidden" />
      </div>

      <div className="relative z-4 w-full">
        {/*获得的奖励*/}
        <div className={"h-13 overflow-x-auto overflow-y-hidden hide-scrollbar"}>
          <div className={"flex items-center gap-2 min-w-max"}>
            <InnerBonusItem
              icon={<HistoryIcon size={20} />} value={t("explore:recents")}
              onClick={() => void navigate({ to: "/lucky-spin/me" })} />
            {winRecords.map((data: Record<string, any>) => {
              return (<InnerBonusItem
                key={data?.record_id}
                extra={<>
                  <img src={getPrizeImageUrl(data?.extra_data)} alt="" className={"w-5 h-5"} />
                  <InnerPrizeDisplay data={data?.extra_data} className={"!text-base-content/50 font-semibold"} />
                </>}
                onClick={() => {
                  if (data?.extra_data?.prize_type === "free_spin") {
                    void navigate({ to: "/bonus", search: { view: undefined, tab: undefined } });
                  }
                  if (data?.extra_data?.prize_type === "buddy_balls") {
                    void navigate({ to: "/buddy-balls" });
                  }
                  if (data?.extra_data?.prize_type === "rakeback_booster") {
                    void navigate({ to: "/bonus", search: { view: undefined, tab: undefined } });
                  }
                }}
              />);
            })}
          </div>
        </div>

        <div className="mt-3">
          {showSpin && <InnerConfirmBox
            loading={spinning}
            onClick={handle}
            className={"h-14 font-bold bg-transparent border-none text-base-content"}
            $type={spinType}
          >
            {t("luckySpin:spin_now")}
          </InnerConfirmBox>}
          {extraNode}
        </div>
      </div>
    </div>
  );
};

export default SpinWheel;
