import { SPORTS_NAVIGATION_ITEMS } from "@/components/sidebar/config";
import { useAuth } from "@/contexts/AuthContext";
import { FooterLink } from "@/components/FooterLink";
import Logo from "@/components/Logo";
import { ChevronUp } from "lucide-react";
import { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { PwaBox } from "./PwaBox";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SocialMedia } from "@/sections/casino/SocialMedia.tsx";
import { isPwa } from "@/utils/browser";
import { isTelegramWebApp } from "@/utils/telegramWebApp";
import { BetbyLinkGuard } from "@/components/sidebar/BetbyLinkGuard.tsx";

const parseNavigationPath = (path: string) => {
  const [to, searchString = ""] = path.split("?");

  if (!searchString) {
    return { to, search: undefined };
  }

  const searchParams = new URLSearchParams(searchString);
  const search: Record<string, string> = {};

  for (const [key, value] of searchParams.entries()) {
    search[key] = value;
  }

  return { to, search };
};

export const Footer = () => {
  const { t } = useTranslation("profile");
  const { isAuthenticated, isLoading } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const supportName = import.meta.env.VITE_WEBSITE_SUPPORT_NAME || "OKVIP";
  const sportsFooterLinks = useMemo(() => {
    const sidebarItems = SPORTS_NAVIGATION_ITEMS(t, isAuthenticated, isLoading);
    const sportsItems: Array<{ id: string; label: string; path: string }> = [];
    let dividerCount = 0;

    for (const item of sidebarItems) {
      if (item.type === "divider") {
        dividerCount += 1;
        if (dividerCount === 2) {
          break;
        }
        continue;
      }

      if (dividerCount === 1) {
        sportsItems.push(item);
      }
    }

    return sportsItems.map((item) => ({
      id: item.id,
      label: item.label,
      ...parseNavigationPath(item.path)
    }));
  }, [isAuthenticated, isLoading, t]);

  const certificationIcons = [
    { src: "/images/partners/certifications/18.svg", alt: "18", width: 40, height: 40 },
    { src: "/images/partners/certifications/gamble-aware.svg", alt: "Gamble Aware", width: 63, height: 44 },
    { src: "/images/partners/certifications/gamcare.svg", alt: "Gamcare", width: 39, height: 44 },
    { src: "/images/partners/certifications/itech-lab.svg", alt: "iTech Lab", width: 42, height: 42 },
    {
      src: "/images/partners/certifications/responsible-gaming.svg",
      alt: "Responsible Gaming",
      width: 100,
      height: 36
    },
    {
      src: "/images/partners/certifications/gaming-laboratories.svg",
      alt: "Gaming Laboratories",
      width: 32,
      height: 33
    }
  ];

  return (
    <footer className="flex flex-col gap-4 sm:gap-6 pb-8">
      <div className="flex flex-col items-start sm:items-center w-full gap-4 sm:gap-8 p-0 sm:py-8 sm:px-[128px]">
        <p className="font-bold text-base sm:text-4xl">
          <Trans i18nKey="casino:footerTitle" components={[<span className="text-primary" key="0" />]}></Trans>
        </p>

        <p className="text-base-content/50 text-xs sm:text-lg leading-4 sm:leading-5 xs:text-start sm:text-center">
          <span className="block sm:inline">{t("casino:footerDescriptionOne", { supportName })}</span>
          <span className="block sm:inline mt-4 sm:mt-0">{t("casino:footerDescriptionTwo")}</span>
        </p>

        <p
          className="text-base-content/50 sm:text-base-content text-xs sm:text-2xl font-normal sm:font-bold leading-4 sm:leading-normal">
          <Trans i18nKey="casino:footerDescriptionThree"
                 components={[<span className="text-primary" key="0" />]}></Trans>
        </p>
      </div>

      <div className="p-0 sm:p-6 flex lg:gap-20 md:gap-12 sm:gap-4">
        <div className="flex flex-col sm:max-w-[360px] overflow-hidden">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex flex-col gap-1 sm:gap-2">
              <Logo />
              <p className="text-[10px] text-xs sm:text-sm font-semibold text-base-content sm:text-base-content/50">
                {t("casino:footerDescriptionFour", { supportName })}
              </p>
              <p
                className="text-[10px] text-xs sm:text-sm font-normal text-base-content/50">{t("casino:footerDescriptionFive", { year: new Date().getFullYear() })}</p>
            </div>
            {isMobile && !isPwa() && !isTelegramWebApp() && <PwaBox />}
            <button
              className="btn btn-square btn-sm p-0 flex sm:hidden self-start"
              onClick={() => {
                // 根据AppLayout结构，滚动容器是main元素
                const scrollContainer = document.querySelector("main.overflow-y-auto");
                if (scrollContainer) {
                  scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <ChevronUp size={16} />
            </button>
          </div>
          <div
            className="flex items-center gap-7 sm:gap-4 md:gap-6 lg:gap-8 mt-4 flex-nowrap sm:flex-wrap overflow-auto hide-scrollbar relative text-base-content">
            {certificationIcons.map((icon) => (
              <span
                key={icon.src}
                role="img"
                aria-label={icon.alt}
                className="inline-flex shrink-0"
                style={{ width: icon.width, height: icon.height }}
              >
                <span
                  className="block h-full w-full bg-current"
                  style={{
                    WebkitMaskImage: `url(${icon.src})`,
                    maskImage: `url(${icon.src})`,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    WebkitMaskSize: "contain",
                    maskSize: "contain"
                  }}
                />
              </span>
            ))}
          </div>
          <SocialMedia className={"mt-4"} />
        </div>

        <div className="hidden sm:flex flex-col gap-4">
          <p className="font-bold text-base-content">{t("common:common.casino")}</p>
          <FooterLink to="/explore" search={{ type: "casino", category: "hot" }}>{t("explore:all")}</FooterLink>
          <FooterLink to="/explore" search={{ type: "slots", category: "hot" }}>{t("explore:slots")}</FooterLink>
          <FooterLink to="/explore"
                      search={{ type: "liveCasino", category: "hot" }}>{t("explore:liveCasino")}</FooterLink>
          <FooterLink to="/explore" search={{ type: "fast", category: "hot" }}>{t("explore:fastGames")}</FooterLink>
          <FooterLink to="/explore" search={{ type: "fishing" }}>{t("explore:fishing")}</FooterLink>
        </div>

        <BetbyLinkGuard>
          <div className="hidden sm:flex flex-col gap-4">
            <p className="font-bold text-base-content">{t("common:common.sports")}</p>
            {sportsFooterLinks.map((item) => (
              <FooterLink key={item.id} to={item.to} search={item.search}>
                {item.label}
              </FooterLink>
            ))}
          </div>
        </BetbyLinkGuard>

        <div className="hidden sm:flex flex-col gap-4">
          <p className="font-bold text-base-content">{t("bonus:bonuses")}</p>
          <FooterLink to="/bonus">{t("bonus:general_bonus")}</FooterLink>
          <FooterLink to="/bonus">{t("bonus:vip_bonus")}</FooterLink>
          <FooterLink to="/vip-club">{t("bonus:vip_program")}</FooterLink>
          <FooterLink to="/bonus/achievements">{t("bonus:achievements")}</FooterLink>
        </div>

        <div className="hidden sm:flex flex-col gap-4">
          <p className="font-bold text-base-content">{t("common:common.legal")}</p>
          <FooterLink to="/profile"
                      search={{ tab: "legal", legalTab: "termsOfService" }}>{t("profile:termsOfService")}</FooterLink>
          <FooterLink to="/profile" search={{
            tab: "legal",
            legalTab: "responsibleGaming"
          }}>{t("profile:responsibleGaming")}</FooterLink>
          <FooterLink to="/profile" search={{ tab: "legal", legalTab: "aboutUs" }}>{t("profile:aboutUs")}</FooterLink>
        </div>
      </div>
      <p className="text-xs text-base-content/50 px-8 hidden sm:block">
        {t("common:disclaimer")}
      </p>
    </footer>
  );
};
