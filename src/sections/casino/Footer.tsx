import { FooterLink } from "@/components/FooterLink";
import Logo from "@/components/Logo";
import { ChevronUp } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { PwaBox } from "./PwaBox";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export const Footer = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <footer className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col items-start sm:items-center w-full gap-4 sm:gap-8 p-0 sm:py-8 sm:px-[128px]">
        <p className="font-bold text-base sm:text-4xl">
          <Trans i18nKey="casino:footerTitle" components={[<span className="text-primary" key="0" />]}></Trans>
        </p>

        <p className="text-base-content/50 text-xs sm:text-lg leading-4 sm:leading-5 xs:text-start sm:text-center">
          <span className="block sm:inline">{t("casino:footerDescriptionOne")}</span>
          <span className="block sm:inline mt-4 sm:mt-0">{t("casino:footerDescriptionTwo")}</span>
        </p>

        <p className="text-base-content/50 sm:text-base-content text-xs sm:text-2xl font-normal sm:font-bold leading-4 sm:leading-normal">
          <Trans i18nKey="casino:footerDescriptionThree" components={[<span className="text-primary" key="0" />]}></Trans>
        </p>
      </div>

      <div className="p-0 sm:p-6 flex lg:gap-20 md:gap-12 sm:gap-4">
        <div className="flex flex-col sm:max-w-[360px] overflow-hidden">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex flex-col gap-1 sm:gap-2">
              <Logo />
              <p className="text-[10px] text-xs sm:text-sm font-semibold text-base-content sm:text-base-content/50">
                {t("casino:footerDescriptionFour")}
              </p>
              <p className="text-[10px] text-xs sm:text-sm font-normal text-base-content/50">{t("casino:footerDescriptionFive")}</p>
            </div>
            {
              isMobile && (
                <PwaBox />
              )
            }
            <button
              className="btn btn-square btn-sm p-0 flex sm:hidden self-start"
              onClick={() => {
                // 根据AppLayout结构，滚动容器是main元素
                const scrollContainer = document.querySelector('main.overflow-y-auto');
                if (scrollContainer) {
                  scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <ChevronUp size={16} />
            </button>
          </div>
          <div className="flex items-center gap-7 sm:gap-4 md:gap-6 lg:gap-8 mt-4 flex-nowrap sm:flex-wrap overflow-auto hide-scrollbar relative">
            <img src="/images/partners/certifications/18.svg" alt="18" />
            <img src="/images/partners/certifications/gamble-aware.svg" alt="Gamble Aware" />
            <img src="/images/partners/certifications/gamcare.svg" alt="Gamcare" />
            <img src="/images/partners/certifications/itech-lab.svg" alt="iTech Lab" />
            <img src="/images/partners/certifications/responsible-gaming.png" alt="Responsible Gaming" className="w-[100px] h-9" />
            <img src="/images/partners/certifications/gaming-laboratories.svg" alt="Gaming Laboratories" />
          </div>
        </div>

        <div className="hidden sm:flex flex-col gap-4">
          <p className="font-bold text-base-content">{t("common:common.casino")}</p>
          <FooterLink to="/casino">{t("explore:all")}</FooterLink>
          <FooterLink to="/casino">{t("explore:slots")}</FooterLink>
          <FooterLink to="/casino">{t("explore:liveCasino")}</FooterLink>
          <FooterLink to="/casino">{t("explore:fastGames")}</FooterLink>
          <FooterLink to="/casino">{t("explore:fishing")}</FooterLink>
        </div>

        <div className="hidden sm:flex flex-col gap-4">
          <p className="font-bold text-base-content">{t("common:common.sports")}</p>
          <FooterLink to="/sports/football">{t("explore:football")}</FooterLink>
          <FooterLink to="/sports/tennis">{t("explore:tennis")}</FooterLink>
          <FooterLink to="/sports/baseball">{t("explore:baseball")}</FooterLink>
          <FooterLink to="/sports/ice-hockey">{t("explore:iceHockey")}</FooterLink>
          <FooterLink to="/sports/basketball">{t("explore:basketball")}</FooterLink>
          <FooterLink to="/sports/volleyball">{t("explore:volleyball")}</FooterLink>
        </div>

        <div className="hidden sm:flex flex-col gap-4">
          <p className="font-bold text-base-content">{t("bonus:bonuses")}</p>
          <FooterLink to="/bonus/general">{t("bonus:general_bonus")}</FooterLink>
          <FooterLink to="/bonus/vip">{t("bonus:vip_bonus")}</FooterLink>
          <FooterLink to="/vip">{t("bonus:vip_program")}</FooterLink>
          <FooterLink to="/conquests">{t("bonus:conquests")}</FooterLink>
          <FooterLink to="/achievements">{t("bonus:achievements")}</FooterLink>
        </div>

        <div className="hidden sm:flex flex-col gap-4">
          <p className="font-bold text-base-content">{t("common:common.legal")}</p>
          <FooterLink to="/legal/terms">{t("common:legal.termsAndConditions")}</FooterLink>
          <FooterLink to="/legal/aml">{t("common:legal.amlPolicy")}</FooterLink>
          <FooterLink to="/legal/privacy">{t("common:legal.privacyPolicy")}</FooterLink>
          <FooterLink to="/legal/probably-fair">{t("common:legal.probablyFair")}</FooterLink>
          <FooterLink to="/legal/underage">{t("common:legal.underage")}</FooterLink>
          <FooterLink to="/legal/gaming-policy">{t("common:legal.gamingPolicy")}</FooterLink>
        </div>
      </div>
    </footer>
  );
};
