import { useTranslation } from "react-i18next";
import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@tanstack/react-router";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useTipsModal } from "@/contexts/ModalsProvider";

function VipFeatureCardItemV2({
  illustration,
  vipLevel,
  title,
  isUnlocked,
  link,
  modalName,
}: {
  illustration: string;
  vipLevel: number;
  title: string;
  isUnlocked: boolean;
  link?: string;
  modalName: string;
}) {
  const { t } = useTranslation('bonus');

  const { openTipsModal } = useTipsModal();

  const handleOpenTips = () => {
    openTipsModal(modalName as any);
  };

  return (
    <article
      className="relative flex w-full flex-row sm:flex-col sm:gap-6 
      items-center justify-between sm:justify-end bg-base-200 
      p-4 rounded-lg sm:flex-col h-[104px] sm:h-full sm:min-h-[214px] 
      overflow-hidden text-base-content shadow-md transition-transform duration-300 hover:-translate-y-1"
    >
      <Info className="absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={handleOpenTips} />

      <div className="flex sm:flex-col sm:gap-6 gap-2 items-center">
        <div className="grid size-[48px] shrink-0 place-items-center rounded-xl">
          <img
            src={illustration}
            alt=""
            className="w-full h-full object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>

        <p className="text-sm font-bold text-base-content tracking-tight text-center">{title}</p>
      </div>

      <div className="flex flex-col items-end justify-end self-stretch">
        {isUnlocked ? (
          <Link
            to={link || "/bonus"}
            className="btn btn-primary btn-sm sm:btn-md shrink-0 sm:w-full min-w-20 h-10 px-0"
          >
            <span>{t("bonus:go")}</span>
          </Link>
        ) : (
          <button type="button" className="btn btn-primary btn-soft btn-sm sm:btn-md pointer-events-none shrink-0 sm:w-full min-w-20 h-10 px-0" aria-disabled="true">
            <Iconify icon="mingcute:lock-fill" width={16} height={16} />
            <span className="uppercase">{t("bonus:vip")} {vipLevel}</span>
          </button>
        )}
      </div>
    </article>
  );
}

const FEATURE_CARDS = [
  {
    illustration: "/images/illustrations/0bfb7eed784e639b1f6c07fda138122d67b96eef.png",
    vipLevel: 2,
    titleKey: "bonus:achievements",
    descriptionKey: "bonus:achievements_card_description",
    link: "/bonus/achievements",
    modalName: "achievement",
  },
  {
    illustration: "/images/illustrations/a0460e0b128df2ab73ba3a735212bd9d95c841b1.png",
    vipLevel: 5,
    titleKey: "bonus:mystery_box",
    descriptionKey: "bonus:mystery_box_description2",
    descriptionParams: { vip: 5 },
    modalName: "mysteryBox",
  },
  {
    illustration: "/images/illustrations/isometric2.svg",
    vipLevel: 7,
    titleKey: "bonus:lucky_number_seven",
    descriptionKey: "bonus:lucky_number_seven_description",
    descriptionParams: { number: "7'" },
    modalName: "luckyNumber",
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

export function VipFeatureCardsV2() {
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
      <div className="grid gap-4 min-[640px]:grid-cols-2 min-[1000px]:grid-cols-4 min-[1280px]:grid-cols-5 justify-items-center">
        {FEATURE_CARDS.map((card, index) => (
          <VipFeatureCardItemV2
            key={index}
            illustration={card.illustration}
            vipLevel={card.vipLevel}
            title={t(card.titleKey)}
            isUnlocked={currentVipLevel >= card.vipLevel}
            link={card.link}
            modalName={card.modalName}
          />
        ))}
      </div>
    </div>
  );
}
