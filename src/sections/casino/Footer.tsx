import { FooterLink } from "@/components/FooterLink";
import Logo from "@/components/Logo";
import { ChevronUp } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { PwaBox } from "./PwaBox";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SocialMedia } from "@/sections/casino/SocialMedia.tsx";
import { isPwa } from "@/utils/browser";
import { useState, useEffect } from "react";

export const Footer = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [appinstalled, setAppinstalled] = useState(false);

  useEffect(() => {
    // 页面加载时，从 localStorage 读取是否安装过
    const installedFlag = window.localStorage.getItem('pwa-installed');
    if (installedFlag === '1') {
      setAppinstalled(true);
    }

    const handleAppInstalled = () => {
      setAppinstalled(true);
      window.localStorage.setItem('pwa-installed', '1');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return (
    <footer className="flex flex-col gap-4 sm:gap-6 pb-8">
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
              isMobile && !isPwa() && !appinstalled && (
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
          <SocialMedia className={'mt-4'} />
        </div>

        <div className="hidden sm:flex flex-col gap-4">
          <p className="font-bold text-base-content">{t("common:common.casino")}</p>
          <FooterLink to="/explore" search={{ type: 'casino', category: 'hot' }}>{t("explore:all")}</FooterLink>
          <FooterLink to="/explore" search={{ type: 'slots', category: 'hot' }}>{t("explore:slots")}</FooterLink>
          <FooterLink to="/explore" search={{ type: 'liveCasino', category: 'hot' }}>{t("explore:liveCasino")}</FooterLink>
          <FooterLink to="/explore" search={{ type: 'fast', category: 'hot' }}>{t("explore:fastGames")}</FooterLink>
          <FooterLink to="/explore" search={{ type: 'fishing' }}>{t("explore:fishing")}</FooterLink>
        </div>

        <div className="hidden sm:flex flex-col gap-4">
          <p className="font-bold text-base-content">{t("common:common.sports")}</p>
          <FooterLink to="/sports" search={{ sport: 'football' }}>{t("explore:football")}</FooterLink>
          <FooterLink to="/sports" search={{ sport: 'tennis' }}>{t("explore:tennis")}</FooterLink>
          <FooterLink to="/sports" search={{ sport: 'baseball' }}>{t("explore:baseball")}</FooterLink>
          <FooterLink to="/sports" search={{ sport: 'ice-hockey' }}>{t("explore:iceHockey")}</FooterLink>
          <FooterLink to="/sports" search={{ sport: 'basketball' }}>{t("explore:basketball")}</FooterLink>
          <FooterLink to="/sports" search={{ sport: 'volleyball' }}>{t("explore:volleyball")}</FooterLink>
        </div>

        <div className="hidden sm:flex flex-col gap-4">
          <p className="font-bold text-base-content">{t("bonus:bonuses")}</p>
          <FooterLink to="/bonus">{t("bonus:general_bonus")}</FooterLink>
          <FooterLink to="/bonus">{t("bonus:vip_bonus")}</FooterLink>
          <FooterLink to="/vip-club">{t("bonus:vip_program")}</FooterLink>
          <FooterLink to="/bonus">{t("bonus:conquests")}</FooterLink>
          <FooterLink to="/bonus">{t("bonus:achievements")}</FooterLink>
        </div>

        <div className="hidden sm:flex flex-col gap-4">
          <p className="font-bold text-base-content">{t("common:common.legal")}</p>
          <FooterLink to="/profile">{t("profile:termsOfService")}</FooterLink>
          <FooterLink to="/profile">{t("profile:responsibleGaming")}</FooterLink>
          <FooterLink to="/profile">{t("profile:aboutUs")}</FooterLink>
        </div>
      </div>
      <p className="text-xs text-base-content/50 px-8 hidden sm:block">
        {t("common:disclaimer")}
      </p>
    </footer>
  );
};
