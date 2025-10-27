import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export const PromotionalSection = () => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-12 sm:gap-4 min-h-[120px] sm:min-h-[180px] lg:min-h-[223px]">
      <div className="p-4 sm:px-6 sm:py-7 w-full rounded-box bg-base-200 relative overflow-hidden flex flex-col justify-between lg:col-span-5">
        <div className="flex flex-col gap-2 sm:gap-4 z-10 relative">
          <p className="font-bold text-base sm:text-lg lg:text-2xl">{t("common:common.casino")}</p>
          <p className="hidden sm:block text-base-content/50 font-semibold text-sm lg:text-lg max-w-[200px] leading-5">
            Spin, play, and win across top casino hits
          </p>
        </div>
        <button className="btn btn-primary btn-square btn-sm sm:btn-md lg:btn-lg sm:w-24 lg:w-32 z-10 relative">
          <span className="hidden sm:inline text-xs lg:text-base">{t("common:common.explore")}</span>
          <ChevronRight className="rtl:rotate-y-180 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
        </button>
        {/* Main illustration - responsive sizing */}
        <img
          className="absolute bottom-1 ltr:right-4 rtl:left-4 rtl:rotate-y-180 
                     w-24 h-24 
                     sm:w-24 sm:h-24 sm:bottom-2 sm:ltr:right-6 sm:rtl:left-6
                     lg:w-[120px] lg:h-[120px] lg:bottom-4 lg:ltr:right-8 lg:rtl:left-8
                     xl:w-[160px] xl:h-[160px] 
                     2xl:w-[200px] 2xl:h-[200px] 2xl:ltr:right-7 2xl:rtl:left-7 2xl:top-1/2 2xl:-translate-y-1/2
                     object-contain"
          src="/images/illustrations/cce800b328960b4d0614d4fbda9078b8911a370a.png"
          alt="casino"
        />
        {/* Background grid mask - full coverage */}
        <img
          src="/images/illustrations/grid-mask.svg"
          alt=""
          className="absolute inset-0 w-full h-full rtl:rotate-y-180 opacity-20 object-cover"
        />
      </div>
      <div className="p-4 sm:px-6 sm:py-7 w-full rounded-box bg-base-200 relative overflow-hidden flex flex-col justify-between lg:col-span-5">
        <div className="flex flex-col gap-2 sm:gap-4 z-10 relative">
          <p className="font-bold text-base sm:text-lg lg:text-2xl">{t("common:common.sports")}</p>
          <p className="hidden sm:block text-base-content/50 font-semibold text-sm lg:text-lg max-w-[230px] leading-5">
            Score big on sports from around the world
          </p>
        </div>
        <button className="btn btn-primary btn-square btn-sm sm:btn-md lg:btn-lg sm:w-24 lg:w-32 z-10 relative">
          <span className="hidden sm:inline text-xs lg:text-base">{t("common:common.explore")}</span>
          <ChevronRight className="rtl:rotate-y-180 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
        </button>
        {/* Main illustration - responsive sizing */}
        <img
          className="absolute bottom-1 ltr:right-4 rtl:left-4 rtl:rotate-y-180 
                     w-24 h-24 
                     sm:w-24 sm:h-24 sm:bottom-2 sm:ltr:right-6 sm:rtl:left-6
                     lg:w-[120px] lg:h-[120px] lg:bottom-4 lg:ltr:right-8 lg:rtl:left-8
                     xl:w-[160px] xl:h-[160px] 
                     2xl:w-[200px] 2xl:h-[200px] 2xl:ltr:right-7 2xl:rtl:left-7 2xl:top-1/2 2xl:-translate-y-1/2
                     object-contain"
          src="/images/illustrations/cd689e97d9aa3b284b79c1b84a25a3a141f929c8.png"
          alt="sports"
        />
        {/* Background grid mask - full coverage */}
        <img
          src="/images/illustrations/grid-mask.svg"
          alt=""
          className="absolute inset-0 w-full h-full rtl:rotate-y-180 opacity-20 object-cover"
        />
      </div>

      <div className="hidden lg:flex lg:col-span-2 bg-primary/10 relative rounded-box py-4 lg:py-7 flex-col justify-between items-center overflow-hidden min-h-full">
        <p className="font-bold text-base lg:text-xl xl:text-2xl text-center px-2 z-10 relative">{t("bonus:bonusHub.root")}</p>
        <button className="btn btn-primary btn-sm lg:btn-md xl:btn-lg z-20 w-10/12 max-w-32 text-xs lg:text-sm">Claim</button>
        {/* Responsive bonus illustration */}
        <img
          src="/images/illustrations/b64b4fb56de8b136b8c6835d3b0cfd761f66bc9c.png"
          alt=""
          className="absolute bottom-0 left-1/2 -translate-x-1/2
                     w-20 h-20
                     lg:w-24 lg:h-24
                     xl:w-32 xl:h-32
                     2xl:w-[170px] 2xl:h-[170px]
                     object-contain"
        />
      </div>
    </div>
  );
};
