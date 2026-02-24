import { Modal } from "@/components/ui/Modal";
import React, { useState } from "react";
import { AnimatePresence, m as motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { toast } from "sonner";
import { useHasMysteryBox } from "@/query/bouns";
import { useBoundStore } from "@/store";
import { useClaimBonusMutation } from "@/hooks/api/useAuth";
import { IVipBonusClaim } from "@/types/bonus";
import { useEarliestPendingRecord } from "@/query/free-spins.tsx";

interface MysteryBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = "closed" | "opening" | "opened";

export function MysteryBoxModal({ isOpen, onClose }: MysteryBoxModalProps) {
  const [modalState, setModalState] = useState<ModalState>("closed");
  const { t } = useTranslation('bonus');
  const { formatWithoutConversion } = useDisplayCurrencyFormatter();
  const claimBonusMutation = useClaimBonusMutation();
  const { refetch: refetchEarliestPendingRecord } = useEarliestPendingRecord()

  // Assets for burst animation
  const coinImages = [
    "/images/rewards/mystery-box/coin-1.png",
    "/images/rewards/mystery-box/coin-2.png",
    "/images/rewards/mystery-box/coin-3.png",
    "/images/rewards/mystery-box/coin-4.png",
    "/images/rewards/mystery-box/coin-5.png",
    "/images/rewards/mystery-box/coin-6.png"
  ];


  // Handle open box action
  // const handleOpenBox = async () => {
  //   // 进入 opening 状态，保持关闭态界面但触发"摇一摇"动画
  //   setModalState("opening");

  //   setTimeout(() => {
  //     setModalState("opened");
  //   }, 1000);
  // };


  const [isLoading, setIsLoading] = useState(false);
  const [mysteryBoxData, setMysteryBoxData] = useState<IVipBonusClaim | null>(null);
  const { setSyncAction } = useBoundStore();
  const { refetch } = useHasMysteryBox();

  const handleOpenBox = async () => {

    setIsLoading(true);
    claimBonusMutation.mutateAsync({
      item: "vip_bonus_mystery_box"
    }).then((res) => {
      if (res.code === 200 || res.code === 0) {
        // toast.success(res.msg);
        setMysteryBoxData(res.data);
        setModalState("opening");

        setTimeout(() => {
          setModalState("opened");
        }, 1000);

        refetch();
      } else {
        if (res.code === 4001) {
          toast.error(t("bonus:not_in_claim_time_range"));
        } else if (res.code === 4002) {
          toast.error(t("bonus:bonus_already_claimed"));
        } else if (res.code === 4003) {
          toast.error(t("bonus:wager_requirement_not_met"));
        } else {
          toast.error(t("bonus:claim_failed"));
        }
        setSyncAction("OPEN_BONUS_CLAIM_RESPONSE_MODAL", {
          code: res.code,
          tryAgain: () => handleOpenBox()
        });
      }
    }).finally(() => {
      setIsLoading(false);
    });
  };

  // Render closed box state
  const renderClosedBox = (shaking: boolean = false) => (
    <div
      className="flex flex-col items-center sm:h-[600px] relative overflow-hidden"
      style={{
        transform: "translateZ(0)", // 启用硬件加速
        backfaceVisibility: "hidden" // 减少重绘
      }}
    >

      {/* Title */}
      <div className="mb-2 text-center z-10">
        <div className="flex flex-col">
          <h1
            className="text-[70px] sm:text-[86px] font-[Lobster]"
            style={{
              background:
                "linear-gradient(183deg, color(display-p3 0.8246 0.6993 1) 2.12%, color(display-p3 0.9325 0.9206 1) 57.21%, color(display-p3 0.726 0.599 1) 57.33%, color(display-p3 1 0.6815 0.9416) 102.79%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",

              filter: "drop-shadow(0 4px 0 #AB1EE6) drop-shadow(0 4px 7px #6F00CB)"
            }}
          >
            {t("bonus:mystery")}
          </h1>
          <h1
            className="text-[70px] font-[Lobster] -mt-10 text-right w-full"
            style={{
              background:
                "linear-gradient(183deg, color(display-p3 0.8246 0.6993 1) 2.12%, color(display-p3 0.9325 0.9206 1) 57.21%, color(display-p3 0.726 0.599 1) 57.33%, color(display-p3 1 0.6815 0.9416) 102.79%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",

              filter: "drop-shadow(0 4px 0 #AB1EE6) drop-shadow(0 4px 7px #6F00CB)"
            }}
          >
            {t("bonus:box")}
          </h1>
        </div>
      </div>

      {/* Mystery Box Image */}
      <div className="relative mb-8 z-10 w-full">
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.img
            key={shaking ? "box-closed-shake" : "box-closed-static"}
            src="/images/rewards/mystery-box/box-close.png"
            alt="Mystery Box"
            className="object-contain z-40 m-4 w-[238px]"
            style={{
              filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.6)) drop-shadow(0 4px 16px rgba(0, 0, 0, 0.3))",
              transform: "translateZ(0)" // 启用硬件加速
            }}
            animate={
              shaking
                ? {
                  rotate: [0, -8, 8, -6, 6, -4, 4, 0],
                  x: [0, -6, 6, -5, 5, -3, 3, 0],
                  transition: { duration: 0.6, ease: "easeInOut" }
                }
                : undefined
            }
            onAnimationComplete={() => {
              if (shaking) {
                setModalState("opened");
              }
            }}
          />

          {/*<motion.img*/}
          {/*  src="/images/rewards/mystery-box/light.svg"*/}
          {/*  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover -z-10 opacity-15 w-[400px]"*/}
          {/*  animate={{*/}
          {/*    rotate: 360*/}
          {/*  }}*/}
          {/*  transition={{*/}
          {/*    repeat: Infinity,*/}
          {/*    duration: 20, // 减慢动画速度以提高性能*/}
          {/*    repeatType: "loop",*/}
          {/*    ease: "linear"*/}
          {/*  }}*/}
          {/*  style={{*/}
          {/*    willChange: "transform", // 优化动画性能*/}
          {/*    transform: "translateZ(0)" // 启用硬件加速*/}
          {/*  }}*/}
          {/*/>*/}
        </div>
      </div>

      {/* Open Box Button */}
      <button
        onClick={handleOpenBox}
        disabled={isLoading}
        className="btn btn-primary btn-lg px-16 mb-4 z-10 mt-6 sm:btn-xl"
      >
        {t("bonus:open_box")} {isLoading ? <span className="loading loading-spinner"></span> : ""}
      </button>
    </div>
  );

  const renderOpened = (data: IVipBonusClaim | null) => (
    <div
      className="flex flex-col items-center sm:h-[600px] relative overflow-hidden"
      style={{
        transform: "translateZ(0)", // 启用硬件加速
        backfaceVisibility: "hidden" // 减少重绘
      }}
    >
      {/* Title */}
      <div className="mb-8 text-center z-10">
        <div className="flex flex-col">
          <h1
            className="text-[70px] sm:text-[86px] font-[Lobster]"
            style={{
              background:
                "linear-gradient(183deg, color(display-p3 0.8246 0.6993 1) 2.12%, color(display-p3 0.9325 0.9206 1) 57.21%, color(display-p3 0.726 0.599 1) 57.33%, color(display-p3 1 0.6815 0.9416) 102.79%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",

              filter: "drop-shadow(0 4px 0 #AB1EE6) drop-shadow(0 4px 7px #6F00CB)"
            }}
          >
            {t("bonus:you_win")}
          </h1>
        </div>
      </div>

      {/* Mystery Box Image */}
      <div className="relative mb-8 z-10 w-full">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-[214px] h-[238px] -translate-x-3 translate-y-6">
            <img
              src="/images/rewards/mystery-box/box-open-body.svg"
              alt="Mystery Box"
              className="object-contain z-40 m-4 w-[214px] absolute top-12"
              style={{
                filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.6)) drop-shadow(0 4px 16px rgba(0, 0, 0, 0.3))"
              }}
            />
            <motion.img
              key="box-open-in"
              animate={{
                rotate: 16,
                y: -80,
                x: 60
              }}
              transition={{
                duration: 1,
                ease: "easeInOut"
              }}
              src="/images/rewards/mystery-box/box-open-in.svg"
              alt="Mystery Box"
              className="object-contain z-40 m-4 w-[176px] absolute top-2 -rotate-11 left-1/2 -translate-x-[calc(50%+5px)]"
              style={{
                filter: "drop-shadow(0 0 8px rgba(0, 0, 0, 0.6)) drop-shadow(0 4px 16px rgba(0, 0, 0, 0.3))"
              }}
            />
            <motion.img
              key="light-2"
              src="/images/rewards/mystery-box/light-2.png"
              className="absolute top-18 left-[calc(50%-8px)] -translate-y-1/2 object-cover w-[400px] z-300 opacity-0"
              style={{ transform: "translateX(calc(50% * -0.85))" }}
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              transition={{
                duration: 1,
                ease: "easeInOut"
              }}
            />
          </div>
          <motion.div
            className="absolute w-full top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 z-400"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            transition={{
              duration: 2,
              ease: "easeInOut"
            }}
          >
            <div className="flex flex-col items-center justify-center -mt-8">
              {!data?.free_spin_record_id && <CurrencyIcon currency={data?.claim?.currency ?? "BUCK"} className="h-8 w-8" />}
              <h2 className="font-bold text-2xl"
                  style={{ color: "rgba(67, 57, 95, 1)" }}>
                {!data?.free_spin_record_id && formatWithoutConversion(data?.claim?.value ?? 0, data?.claim?.currency ?? "BUCK", {
                  showSymbol: false,
                  showCode: false
                }).formatted}
                {data?.free_spin_record_id &&
                  <div className={"text-center text-3xl font-bold text-base-300"}>50<br />{t("casino:freeSpins")}</div>}
              </h2>
            </div>
          </motion.div>
          {/* Optimized celebration animation - Fewer elements, larger distances */}
          <div className="absolute -inset-20 flex items-center justify-center pointer-events-none z-50"
               style={{ willChange: "transform" }}>

            {/* Persistent floating coins for first 3 */}
            {Array.from({ length: 3 }).map((_, i) => {
              const angle = (i * 120); // 3 coins at 120° apart
              const distance = 140 + i * 30;
              const dx = Math.sin((angle * Math.PI) / 180) * distance;
              const dy = -Math.cos((angle * Math.PI) / 180) * distance - 40;
              const floatDelay = i * 0.3;

              return (
                <motion.img
                  key={`coin-float-${i}`}
                  src={coinImages[i]}
                  className="absolute drop-shadow-2xl"
                  style={{
                    width: "32px",
                    height: "32px",
                    left: `calc(50% + ${dx}px)`,
                    top: `calc(50% + ${dy}px)`
                  }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0, 0, 0, 0.5],
                    y: [0, 0, 0, 0, -10, 10, -10],
                    rotate: [0, 0, 0, 0, -5, 5, -5],
                    filter: [
                      "brightness(1) drop-shadow(0 0 0px rgba(255, 215, 0, 0))",
                      "brightness(1) drop-shadow(0 0 0px rgba(255, 215, 0, 0))",
                      "brightness(1) drop-shadow(0 0 0px rgba(255, 215, 0, 0))",
                      "brightness(1) drop-shadow(0 0 0px rgba(255, 215, 0, 0))",
                      "brightness(1.2) drop-shadow(0 0 6px rgba(255, 215, 0, 0.5))"
                    ]
                  }}
                  transition={{
                    opacity: { duration: 3.2, times: [0, 0.7, 0.8, 0.9, 1] },
                    y: {
                      delay: 3.2 + floatDelay,
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    },
                    rotate: {
                      delay: 3.2 + floatDelay,
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    },
                    filter: { duration: 3.2, times: [0, 0.7, 0.8, 0.9, 1] }
                  }}
                />
              );
            })}

            {/* Persistent stars with scale animation */}
            {Array.from({ length: 4 }).map((_, i) => {
              const angles = [45, 135, 225, 315];
              const angle = angles[i];
              const distance = 160 + (i % 2) * 40;
              const dx = Math.sin((angle * Math.PI) / 180) * distance;
              const dy = -Math.cos((angle * Math.PI) / 180) * distance - 20;

              return (
                <motion.img
                  key={`star-persist-${i}`}
                  src="/images/rewards/mystery-box/star.svg"
                  className="absolute"
                  style={{
                    width: "24px",
                    height: "24px",
                    left: `calc(50% + ${dx}px)`,
                    top: `calc(50% + ${dy}px)`
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0, 0, 0, 1],
                    scale: [0, 0, 0, 0, 1, 1.3, 1]
                  }}
                  transition={{
                    opacity: { duration: 3.5, times: [0, 0.6, 0.7, 0.8, 1] },
                    scale: {
                      duration: 3.5,
                      times: [0, 0.6, 0.7, 0.8, 0.9, 0.95, 1],
                      repeat: Infinity,
                      repeatDelay: 0,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }
                  }}
                />
              );
            })}

            {/* Persistent vectors without animation */}
            {Array.from({ length: 6 }).map((_, i) => {
              const angles = [30, 90, 150, 210, 270, 330];
              const angle = angles[i];
              const distance = 130 + (i % 3) * 30;
              const dx = Math.sin((angle * Math.PI) / 180) * distance;
              const dy = -Math.cos((angle * Math.PI) / 180) * distance;
              const isVector1 = i % 2 === 0;
              const src = isVector1 ? "/images/rewards/mystery-box/vector1.png" : "/images/rewards/mystery-box/vector2.png";

              return (
                <motion.img
                  key={`vector-persist-${i}`}
                  src={src}
                  className="absolute"
                  style={{
                    width: "28px",
                    height: "28px",
                    left: `calc(50% + ${dx}px)`,
                    top: `calc(50% + ${dy}px)`
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0, 0, 0, 1],
                    scale: [0, 0, 0, 0, 1]
                  }}
                  transition={{
                    opacity: { duration: 3.2, times: [0, 0.5, 0.6, 0.7, 1] },
                    scale: { duration: 3.2, times: [0, 0.5, 0.6, 0.7, 1] }
                  }}
                />
              );
            })}

            {/* Main coin explosion - Reduced count, increased distance */}
            {Array.from({ length: 10 }).map((_, i) => {
              const angle = (i * 36) - 18; // 10 coins spread evenly
              const distance = 180 + Math.random() * 120; // Much larger distance: 180-300px
              const dx = Math.sin((angle * Math.PI) / 180) * distance;
              const dy = -Math.cos((angle * Math.PI) / 180) * distance - 60;
              const delay = Math.random() * 0.15;
              const size = 36 + Math.random() * 20; // Slightly larger coins
              const rotation = Math.random() * 900 + 360;
              const src = coinImages[i % coinImages.length];

              return (
                <motion.img
                  key={`coin-main-${i}`}
                  src={src}
                  className="absolute drop-shadow-2xl"
                  style={{ width: `${size}px`, height: `${size}px` }}
                  initial={{
                    opacity: 0,
                    scale: 0.4,
                    x: 0,
                    y: 10,
                    rotate: 0,
                    filter: "brightness(1.3) drop-shadow(0 0 10px rgba(255, 215, 0, 0.7))"
                  }}
                  animate={{
                    // 前 3 个币：最后还留一点，不完全消失
                    opacity: i < 3 ? [0, 1, 0.6] : [0, 1, 0],
                    scale: [0.4, 1.1, 0.9],
                    x: [0, dx],
                    y: [10, dy + 60],
                    rotate: [0, rotation]
                    // 不再对 filter 做多段 keyframe，保持 initial/animate 之间的平滑过渡即可
                  }}
                  transition={{
                    duration: 3.2,
                    delay: delay,
                    ease: "easeOut"
                  }}
                />
              );
            })}

            {/* Stars explosion - Fewer count, much wider spread */}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i * 60) + 30; // 6 stars with 60° spacing
              const distance = 200 + Math.random() * 150; // Very large distance: 200-350px
              const dx = Math.sin((angle * Math.PI) / 180) * distance;
              const dy = -Math.cos((angle * Math.PI) / 180) * distance - 50;
              const delay = 0.1 + Math.random() * 0.1;
              const size = 28 + Math.random() * 16;
              const rotation = Math.random() * 720 + 180;

              return (
                <motion.img
                  key={`star-${i}`}
                  src="/images/rewards/mystery-box/star.svg"
                  className="absolute"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))"
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0.1,
                    x: 0,
                    y: 15,
                    rotate: 0
                  }}
                  animate={{
                    opacity: i < 2 ? [0, 1, 0.8, 0.3] : [0, 1, 0.8, 0], // 保留前2个星星
                    scale: [0.1, 1.4, 1.1, 0.7],
                    x: [0, dx * 0.4, dx * 0.9, dx * 1.5],
                    y: [15, dy * 0.3, dy + 30, dy + 120],
                    rotate: [0, rotation * 0.5, rotation]
                  }}
                  transition={{
                    duration: 2.8,
                    delay: delay,
                    ease: "easeOut"
                  }}
                />
              );
            })}

            {/* Confetti ribbons - Reduced count, larger spread */}
            {Array.from({ length: 4 }).map((_, i) => {
              const isVector1 = i % 2 === 0;
              const angle = (i * 90) + 45 + Math.random() * 30 - 15; // 4 ribbons in corners
              const distance = 160 + Math.random() * 140; // Large distance: 160-300px
              const dx = Math.sin((angle * Math.PI) / 180) * distance;
              const dy = -Math.cos((angle * Math.PI) / 180) * distance - 40;
              const delay = 0.05 + Math.random() * 0.08;
              const size = 35 + Math.random() * 25; // Larger ribbons
              const rotation = Math.random() * 360;
              const src = isVector1 ? "/images/rewards/mystery-box/vector1.png" : "/images/rewards/mystery-box/vector2.png";

              return (
                <motion.img
                  key={`ribbon-${i}`}
                  src={src}
                  className="absolute opacity-90"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))"
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0.3,
                    x: 0,
                    y: 10,
                    rotate: rotation
                  }}
                  animate={{
                    opacity: [0, 0.9, 0.7, 0],
                    scale: [0.3, 1.1, 0.9, 0.5],
                    x: [0, dx * 0.5, dx * 1.3],
                    y: [10, dy * 0.4, dy + 80]
                    // rotate: [rotation, rotation + 180, rotation + 360],
                  }}
                  transition={{
                    duration: 2,
                    delay: delay,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                />
              );
            })}

            {/* Sparkling particles - Reduced count, wider spread */}
            {Array.from({ length: 15 }).map((_, i) => {
              const angle = Math.random() * 360;
              const distance = 100 + Math.random() * 200; // Much wider: 100-300px
              const dx = Math.sin((angle * Math.PI) / 180) * distance;
              const dy = -Math.cos((angle * Math.PI) / 180) * distance + (Math.random() - 0.5) * 60;
              const delay = Math.random() * 0.3;
              const size = 3 + Math.random() * 4; // Slightly larger particles

              return (
                <motion.div
                  key={`spark-${i}`}
                  className="absolute bg-gradient-to-r from-yellow-200 to-yellow-400 rounded-full"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    boxShadow: "0 0 8px rgba(255, 215, 0, 0.9), 0 0 16px rgba(255, 215, 0, 0.5)"
                  }}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0.8, 0],
                    scale: [0, 2.5, 1.8, 0],
                    x: [0, dx * 0.6, dx * 1.2],
                    y: [0, dy * 0.7, dy + 50]
                  }}
                  transition={{
                    duration: 2.0,
                    delay: delay,
                    ease: "easeOut"
                  }}
                />
              );
            })}

            {/* Continuous sparkles that appear after explosion */}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = i * 60;
              const radius = 120;
              const x = Math.sin((angle * Math.PI) / 180) * radius;
              const y = -Math.cos((angle * Math.PI) / 180) * radius - 30;

              return (
                <motion.div
                  key={`continuous-spark-${i}`}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`
                  }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0, 0, 0, 0.6, 0.3, 0.6]
                  }}
                  transition={{
                    opacity: {
                      duration: 5,
                      delay: 2.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      times: [0, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
                    }
                  }}
                >
                  <div
                    className="w-2 h-2 bg-gradient-to-r from-yellow-300 to-yellow-100 rounded-full"
                    style={{
                      boxShadow: "0 0 6px rgba(255, 215, 0, 0.8), 0 0 12px rgba(255, 215, 0, 0.4)"
                    }}
                  />
                </motion.div>
              );
            })}
            {/* <motion.img
              src="/images/rewards/mystery-box/light.svg"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover -z-10 opacity-15 w-[400px]"
              animate={{
                rotate: 360,
              }}
              transition={{
                repeat: Infinity,
                duration: 20, // 减慢动画速度以提高性能
                repeatType: "loop",
                ease: "linear",
              }}
              style={{
                willChange: "transform", // 优化动画性能
                transform: "translateZ(0)", // 启用硬件加速
              }}
            /> */}
          </div>
          <motion.img
            src="/images/rewards/mystery-box/light.svg"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover -z-10 opacity-15 w-[400px]"
            animate={{
              rotate: 360
            }}
            transition={{
              repeat: Infinity,
              duration: 20, // 减慢动画速度以提高性能
              repeatType: "loop",
              ease: "linear"
            }}
            style={{
              willChange: "transform", // 优化动画性能
              transform: "translateZ(0)" // 启用硬件加速
            }}
          />
        </div>
      </div>

      {/* Claim Button */}
      <button
        onClick={() => {
          onClose()
          void refetchEarliestPendingRecord()
        }}
        className="btn btn-primary btn-lg px-16 mb-4 z-10 mt-6 sm:btn-xl"
      >
        {t("bonus:continue")}
      </button>
    </div>
  );

  // Render content based on state
  const renderContent = (data: IVipBonusClaim | null) => {
    if (modalState === "opening") {
      // 从 closed 进入 opening：不需要任何淡入淡出过渡，直接显示摇动版本
      return renderClosedBox(true);
    }

    return (
      <AnimatePresence mode="wait">
        {modalState === "closed" && (
          <motion.div
            key="state-closed"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {renderClosedBox(false)}
          </motion.div>
        )}

        {modalState === "opened" && data && (
          <motion.div
            key="state-opened"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {renderOpened(data)}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setModalState("closed");
      // Reset mutation state if needed
    }
  }, [isOpen]);

  // 预加载图片以提高性能
  React.useEffect(() => {
    if (isOpen) {
      const preloadImages = [
        "/images/rewards/mystery-box/box-close.png",
        "/images/rewards/mystery-box/light.png",
        "/images/rewards/mystery-box/box-open-body.png",
        "/images/rewards/mystery-box/light-2.png",
        "/images/rewards/mystery-box/box-open-in.png"
      ];

      preloadImages.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideTitle={true}
      className="md:w-[500px] max-w-lg p-0 rounded-box"
      position="modal-middle"
      closeButtonClassName="bg-transparent hover:bg-white/10 border-0 text-white/70 hover:text-white z-50"
      style={{
        background: "linear-gradient(175.38deg, color(display-p3 0.227 0.200 0.337) -1.75%, color(display-p3 0.118 0.106 0.204) 54.33%)",
        borderRadius: "12px",
        boxShadow: "0 4px 250px 1000px rgba(0, 0, 0, 0.50)"
      }}
    >
      <div className="relative overflow-hidden">
        {/* Main Content */}
        {renderContent(mysteryBoxData)}
      </div>
    </Modal>
  );
}
