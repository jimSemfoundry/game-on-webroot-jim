import { useMemo } from "react";
import { getNetworkType } from "@/components/ui/GameImage.tsx";

export const InnerEffect = () => {
  // 缓存effect以避免重新创建，这是性能优化的关键
  return useMemo(
    () => {
      return getNetworkType() !== "4g" ? <div className={"absolute top-0 left-0 bottom-0 right-0 bg-base-200/30"} /> : (
        <>
          <div
            className="absolute -top-[109px] ltr:left-[182px] w-[135px] h-[411px] bg-primary/20 skew-x-[12deg] rotate-[36deg] translate-x-4 rtl:-translate-x-4 sm:translate-x-16 sm:left-auto sm:right-[159px] sm:-top-[57px] sm:w-[148px] sm:h-[652px] transform-gpu"
            style={{
              mixBlendMode: "normal",
              willChange: "transform",
              backfaceVisibility: "hidden"
            }}
          />
          <div
            className="absolute -top-[60px] ltr:-right-[90px] w-[162px] h-[513px] skew-x-[12deg] rotate-[36deg] bg-primary/10 border-primary/20 ltr:border-l-[26px] rtl:border-r-[26px] translate-x-2 rtl:-translate-x-2 sm:right-[-84px] sm:-top-[60px] sm:w-[230px] sm:h-[732px] sm:border-l-[38px] transform-gpu"
            style={{
              mixBlendMode: "normal",
              willChange: "transform",
              backfaceVisibility: "hidden"
            }}
          />
          <div
            className="absolute top-[111px] ltr:left-[142px] w-[426px] h-[244px] rounded-full bg-primary/80 blur-[38px] z-0 sm:-left-[63px] sm:top-[215px] sm:w-[600px] sm:h-[348px] sm:blur-[80px] transform-gpu" />
          <div
            className="absolute -top-[299px] ltr:left-[82px] w-[420px] h-[420px] rounded-full bg-base-300 blur-[38px] z-10 sm:left-[102px] sm:-top-[369px] sm:w-[600px] sm:h-[600px] sm:blur-[80px] transform-gpu" />
        </>
      );
    },
    []
  );
};
