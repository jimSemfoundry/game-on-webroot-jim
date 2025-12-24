import { Countdown } from "@/components/ui/Countdown";
import { useTranslation } from "react-i18next";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { cn } from "@/utils/cn";
import { getTournamentImage } from "./tournament-visuals";
import { useTournamentPoolPrize } from "@/hooks/api/useAuth";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";

export interface TournamentCardData {
  id: string;
  title: string;
  titleHighlight?: string;
  endTime: Date;
  prizePool: number;
  image: string;
  provider?: string;
  tournamentId?: number | string;
  tournamentLevel?: string;
}

interface TournamentCardProps {
  data: TournamentCardData;
  onClick?: () => void;
  className?: string;
}


export const TournamentCard = ({ data, onClick, className }: TournamentCardProps) => {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { data: livePrize } = useTournamentPoolPrize(data.tournamentId, data.tournamentLevel);

  // 获取适合移动端的图片 (优先使用 provider，降级到 data.image)
  const mobileImage = data.provider 
    ? getTournamentImage(data.provider, "mobile")
    : data.image;

  // 使用自定义 hook 提取颜色
  const { gradient: gradientColor } = useVibrantColor(mobileImage, {
    fallbackGradient: "var(--color-base-300)",
    colorTypes: ['Vibrant', 'Muted', 'DarkVibrant'],
    opacity: 0.5
  });

  const prizePoolValue = livePrize ?? data.prizePool ?? 0;

  const formattedPrize = formatWithConversion(prizePoolValue, "USD", {
    showCode: false,
    showSymbol: true,
  });

  // 如果没有图片数据，显示加载状态（骨架屏场景）
  if (!mobileImage) {
    return (
      <div className="relative flex flex-col rounded-2xl overflow-hidden">
        <div className="relative h-[200px] sm:h-[240px] w-full overflow-hidden bg-base-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        </div>
      </div>
      );
    }

    return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      {/* Card Background with Gradient */}
      <div
        className="relative h-[200px] sm:h-[240px] w-full overflow-hidden bg-gradient-to-r from-[#dfe1e4] to-[#dfe1e4] transition-all duration-300"
        style={{
          background: gradientColor || "var(--color-base-300)",
        }}
      >
        {/* Character Image - Positioned absolutely */}
        <img
          src={mobileImage}
          alt={data.title}
          className="absolute h-full right-0 top-0 object-cover z-10 rtl:left-0 rtl:right-auto"
          loading="lazy"
          style={{
            objectFit: "cover",
            objectPosition: "right center", // 保持右侧主体可见
            filter: "drop-shadow(-4px 0px 24px rgba(0,0,0,0.3))",
          }}
        />

        {/* Content Wrapper */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 z-20">
          {/* Top Section with Title */}
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-lg sm:text-xl uppercase leading-[1.1]">
              <span className="text-primary">{data.titleHighlight}</span>
              {data.titleHighlight && <br />}
              <span className="text-base-content">{data.title}</span>
            </h3>
          </div>

          {/* Bottom Section with Countdown and Prize */}
          <div className="flex flex-col gap-2 w-9/12 max-w-[240px]">
            {/* Countdown and Prize Container */}
            <div className="bg-gradient-to-br from-base-content/20 to-transparent border-0 rounded-field p-2 relative">
              {/* ENDING IN Badge - 绝对定位在左上角 */}
              <span className="badge badge-success rounded-sm rounded-bl-none badge-xs h-3 text-[8px] font-bold absolute top-0 left-0 -translate-y-1/2">
                {t("tournament:endingIn", "ENDING IN")}
              </span>
              {/* Countdown */}
              <Countdown
                target={data.endTime}
                renderCustom={(time) => (
                  <div className="flex gap-1 mb-2">
                    {time.days > 0 && (
                      <div
                        className="bg-base-400/50 rounded-field px-2 py-1 h-12 flex flex-col items-center justify-center"
                        style={{ width: "25%" }}
                      >
                        <span className="countdown text-lg font-bold">
                          <span style={{ "--value": time.days } as React.CSSProperties}></span>
                        </span>
                        <p className="text-[8px] text-base-content/70">{t("tournament:days", "days")}</p>
                      </div>
                    )}
                    <div
                      className="bg-base-400/50 rounded-field px-2 py-1 h-12 flex flex-col items-center justify-center"
                      style={{ width: time.days > 0 ? "25%" : "33.333%" }}
                    >
                      <span className="countdown text-lg font-bold">
                        <span style={{ "--value": time.hours } as React.CSSProperties}></span>
                      </span>
                      <p className="text-[8px] text-base-content/70">{t("tournament:hours", "hours")}</p>
                    </div>
                    <div
                      className="bg-base-400/50 rounded-field px-2 py-1 h-12 flex flex-col items-center justify-center"
                      style={{ width: time.days > 0 ? "25%" : "33.333%" }}
                    >
                      <span className="countdown text-lg font-bold">
                        <span style={{ "--value": time.minutes } as React.CSSProperties}></span>
                      </span>
                      <p className="text-[8px] text-base-content/70">{t("tournament:minutes", "minutes")}</p>
                    </div>
                    <div
                      className="bg-base-400/50 rounded-field px-2 py-1 h-12 flex flex-col items-center justify-center"
                      style={{ width: time.days > 0 ? "25%" : "33.333%" }}
                    >
                      <span className="countdown text-lg font-bold">
                        <span style={{ "--value": time.seconds } as React.CSSProperties}></span>
                      </span>
                      <p className="text-[8px] text-base-content/70">{t("tournament:seconds", "seconds")}</p>
                    </div>
                  </div>
                )}
              />

              {/* Prize Pool */}
              <div className="bg-base-400/50 rounded-field px-4 py-2 flex flex-col items-center justify-center">
                <p className="text-[8px] text-base-content/70 leading-none">
                  {t("tournament:progressivePrizePool", "Progressive Prize Pool")}
                </p>
                <p className="text-lg sm:text-xl font-bold leading-tight mt-0.5 text-primary">{formattedPrize.formatted}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
