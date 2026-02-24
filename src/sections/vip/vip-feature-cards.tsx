import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Iconify from "@/components/iconify";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@tanstack/react-router";


import { useMediaQuery } from "@/hooks/useMediaQuery";

const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";

const DESKTOP_DEFAULT_GRADIENT =
  "radial-gradient(72.45% 49.48% at 50% 8.89%, rgba(172, 0, 255, 0.40) 0%, rgba(51, 51, 51, 0.08) 100%), var(--color-base-200)";

const MOBILE_DEFAULT_GRADIENT = `
  radial-gradient(
    95.05% 100% at 0% 35.47%,
    color-mix(in oklch, rgba(172, 0, 255, 0.40) 40%, transparent) 0%,
    ${BASE_SCRIM} 100%
  ),
  linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
`;

function VipFeatureCardItem({
  illustration,
  vipLevel,
  title,
  description,
  isUnlocked,
  link,
}: {
  illustration: string;
  vipLevel: number;
  title: string;
  description: string;
  isUnlocked: boolean;
  link?: string;
}) {
  const { t } = useTranslation('bonus');
  const isMobile = useMediaQuery("(max-width: 640px)");
  const defaultGradient = isMobile ? MOBILE_DEFAULT_GRADIENT : DESKTOP_DEFAULT_GRADIENT;

  const { hex } = useVibrantColor(illustration, {
    fallbackGradient: defaultGradient,
    colorTypes: ["DarkMuted"],
    opacity: 0.45,
  });

  const background = useMemo(() => {
    if (!hex) {
      return defaultGradient;
    }

    const accentStop = `color-mix(in oklch, ${hex} 40%, transparent)`;

    if (isMobile) {
      return `
        radial-gradient(
          95.05% 100% at 0% 35.47%,
          ${accentStop} 0%,
          ${BASE_SCRIM} 100%
        ),
        linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
      `;
    }

    return `radial-gradient(72.45% 49.48% at 50% 8.89%, ${accentStop} 0%, rgba(51, 51, 51, 0.08) 100%), var(--color-base-200)`;
  }, [hex, isMobile, defaultGradient]);

  return (
    <article
      className="relative flex w-full flex-row items-center sm:flex-col sm:h-full sm:min-h-[290px] overflow-hidden text-base-content shadow-md transition-transform duration-300 hover:-translate-y-1"
      style={{
        padding: "var(--t-spacing-6, 24px) var(--t-spacing-4, 16px) var(--t-spacing-4, 16px)",
        gap: "16px",
        background,
        borderRadius: "var(--u-borderRadius-focus, 12px)",
      }}
    >
      <div className="grid size-[60px] sm:size-[80px] shrink-0 place-items-center rounded-xl">
        <img
          src={illustration}
          alt=""
          className="w-full h-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 sm:gap-3 text-left sm:text-center sm:items-center">
        <h3 className="text-base sm:text-lg font-semibold leading-5 tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm leading-4 sm:leading-5 text-base-content/50">{description}</p>
      </div>

      {isUnlocked ? (
        <Link
          to={link || "/bonus"}
          className="btn btn-primary btn-sm sm:btn-md shrink-0 sm:w-full sm:mt-auto"
        >
          <span>{t("bonus:go")}</span>
        </Link>
      ) : (
        <button type="button" className="btn btn-primary btn-soft btn-sm sm:btn-md pointer-events-none shrink-0 sm:w-full sm:mt-auto" aria-disabled="true">
          <Iconify icon="mingcute:lock-fill" width={16} height={16} />
          <span className="uppercase">{t("bonus:vip")} {vipLevel}</span>
        </button>
      )}
    </article>
  );
}

const FEATURE_CARDS = [
  {
    illustration: "/images/illustrations/0bfb7eed784e639b1f6c07fda138122d67b96eef.png",
    vipLevel: 2,
    titleKey: "bonus:achievements",
    descriptionKey: "bonus:achievements_card_description",
    link: "/bonus?tab=achievements",
  },
  {
    illustration: "/images/illustrations/a0460e0b128df2ab73ba3a735212bd9d95c841b1.png",
    vipLevel: 5,
    titleKey: "bonus:mystery_box",
    descriptionKey: "bonus:mystery_box_description2",
    descriptionParams: { vip: 5 },
  },
  {
    illustration: "/images/illustrations/isometric2.svg",
    vipLevel: 7,
    titleKey: "bonus:lucky_number_seven",
    descriptionKey: "bonus:lucky_number_seven_description",
    descriptionParams: { number: "7'" },
  },
  // {
  //   illustration: "/images/illustrations/jester.svg",
  //   vipLevel: 21,
  //   titleKey: "bonus:the_jester",
  //   descriptionKey: "bonus:every_tap_on_the_jester_drops_a_reward_but_hurry_this_trickster_won_t_stick_around_forever",
  // },
  // {
  //   illustration: "/images/illustrations/isometric3.svg",
  //   vipLevel: 41,
  //   titleKey: "bonus:the_cannon",
  //   descriptionKey: "bonus:the_cannon_description",
  // },
];

export function VipFeatureCards() {
  const { t } = useTranslation(["vip", "bonus"]);
  const { status } = useAuth();
  const currentVipLevel = status?.vip || 0;

  const unlockedCount = FEATURE_CARDS.filter((card) => currentVipLevel >= card.vipLevel).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Iconify icon="custom:vip" className="text-primary w-4 h-4 sm:w-5 h-5" />
        <h2 className="text-sm sm:text-xl font-bold text-base-content">{t("bonus:vip_bonus")}</h2>
        {
          unlockedCount > 0 && (
            <div className="flex items-center justify-center bg-primary text-primary-content font-bold rounded-field badge badge-soft badge-sm sm:badge-md">
              {unlockedCount}
            </div>
          )
        }

      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 justify-items-center">
        {FEATURE_CARDS.map((card, index) => (
          <VipFeatureCardItem
            key={index}
            illustration={card.illustration}
            vipLevel={card.vipLevel}
            title={t(card.titleKey)}
            description={t(card.descriptionKey, card.descriptionParams)}
            isUnlocked={currentVipLevel >= card.vipLevel}
            link={card.link}
          />
        ))}
      </div>
    </div>
  );
}
