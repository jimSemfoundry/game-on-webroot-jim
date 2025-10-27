import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { FastAverageColor } from "fast-average-color";
import Iconify from "@/components/iconify";

const DEFAULT_GRADIENT =
  "radial-gradient(72.45% 49.48% at 50% 8.89%, rgba(172, 0, 255, 0.40) 0%, rgba(51, 51, 51, 0.08) 100%), var(--color-base-200)";

function VipFeatureCardItem({
  illustration,
  vipLevel,
  title,
  description,
}: {
  illustration: string;
  vipLevel: number;
  title: string;
  description: string;
}) {
	  const [background, setBackground] = useState<string>(DEFAULT_GRADIENT);

  const handleIllustrationLoad = useCallback(async (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const fac = new FastAverageColor();

    try {
      const color = await fac.getColorAsync(img, {
        algorithm: 'sqrt',      // 使用 sqrt 算法（介于 simple 和 dominant 之间）
        mode: 'precision',      // 精度优先模式
        ignoredColor: [
          [255, 255, 255, 255, 50],  // 忽略白色背景
          [0, 0, 0, 255, 150],        // 加强忽略黑色（提高阈值到150）
          [20, 20, 20, 255, 120],     // 忽略深灰色
        ],
      });
      const rgba = color.rgb.replace("rgb", "rgba").replace(")", ", 0.40)");
      setBackground(
        `radial-gradient(72.45% 49.48% at 50% 8.89%, ${rgba} 0%, rgba(51, 51, 51, 0.08) 100%), var(--color-base-200)`
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Failed to derive VIP feature card color", error);
      }
      setBackground(DEFAULT_GRADIENT);
    } finally {
      fac.destroy();
    }
  }, []);

  return (
    <article
      className="relative flex h-full min-h-[280px] flex-1 flex-col overflow-hidden text-base-content shadow-md transition-transform duration-300 hover:-translate-y-1"
      style={{
        padding: "var(--t-spacing-6, 24px) var(--t-spacing-4, 16px) var(--t-spacing-4, 16px)",
        gap: "16px",
        flex: "1 0 0",
        background,
        borderRadius: "var(--u-borderRadius-focus, 12px)",
      }}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="grid size-[80px] shrink-0 place-items-center rounded-xl">
          <img
            src={illustration}
            alt=""
            width={80}
            height={80}
            loading="lazy"
            decoding="async"
            onLoad={handleIllustrationLoad}
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <h3 className="text-lg font-semibold leading-5 tracking-tight">{title}</h3>
          <p className="text-sm leading-5 text-base-content/80">{description}</p>
        </div>
      </div>

      <button type="button" className="btn btn-primary btn-soft btn-md pointer-events-none mt-auto w-full" aria-disabled="true">
        <Iconify icon="mingcute:lock-fill" width={16} height={16} />
        <span>VIP {vipLevel}</span>
      </button>
    </article>
  );
}

export function VipFeatureCards() {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <VipFeatureCardItem
        illustration="/icons/isometric/13.svg"
        vipLevel={4}
        title={t("vip:lucky_spin")}
        description={t("vip:hit_vip_4_and_gain_access_to_lucky_spin_your_chance_to_win_extra_rewards_every_single_day")}
      />
      <VipFeatureCardItem
        illustration="/icons/isometric/11.svg"
        vipLevel={12}
        title={t("vip:weekly_cashback")}
        description={t("vip:reach_vip_12_and_unlock_weekly_cashback_your_personal_safety_net_for_high_roller_action")}
      />
      <VipFeatureCardItem
        illustration="/icons/isometric/14.svg"
        vipLevel={22}
        title={t("vip:the_airdrop")}
        description={t("vip:once_a_month_a_mystery_lands_in_your_account")}
      />
      <VipFeatureCardItem
        illustration="/icons/isometric/15.svg"
        vipLevel={32}
        title={t("vip:jester")}
        description={t("vip:every_tap_on_the_jester_drops_a_reward_but_hurry_this_trickster_won_t_stick_around_forever")}
      />
      <VipFeatureCardItem
        illustration="/icons/isometric/16.svg"
        vipLevel={40}
        title={t("vip:the_cannon")}
        description={t("vip:a_reward_so_powerful_so_exclusive_that_its_true_nature_remains_a_closely_guarded_secret")}
      />
    </div>
  );
}
