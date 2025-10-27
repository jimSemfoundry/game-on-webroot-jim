import { Modal } from "@/components/ui/Modal";
import React, { useState } from "react";
import { m, AnimatePresence } from "motion/react";
import { FreeSpinModalProps, ModalState } from './types';
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function FreeSpinModal({ 
  isOpen, 
  onClose, 
  onContinue, 
  freeSpinData,
  modalState: externalModalState,
  onModalStateChange,
  wonAmount: externalWonAmount,
  onWonAmountChange
}: FreeSpinModalProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  // const { t } = useTranslation();
  const [internalModalState, setInternalModalState] = useState<ModalState>("closed");
  const [internalWonAmount, setInternalWonAmount] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  // const claimRewardMutation = useClaimReward();

  // 使用外部状态（如果提供）或内部状态
  const modalState = externalModalState !== undefined ? externalModalState : internalModalState;
  const wonAmount = externalWonAmount !== undefined ? externalWonAmount : internalWonAmount;

  const freeSpinsCount = freeSpinData?.bet_count || 0;

  // 状态更新函数
  const updateModalState = (newState: ModalState) => {
    if (onModalStateChange) {
      onModalStateChange(newState);
    } else {
      setInternalModalState(newState);
    }
  };

  const updateWonAmount = (newAmount: number) => {
    if (onWonAmountChange) {
      onWonAmountChange(newAmount);
    } else {
      setInternalWonAmount(newAmount);
    }
  };

  // Assets for burst animation
  const coinImages = [
    "/images/rewards/mystery-box/coin-1.png",
    "/images/rewards/mystery-box/coin-2.png",
    "/images/rewards/mystery-box/coin-3.png",
    "/images/rewards/mystery-box/coin-4.png",
    "/images/rewards/mystery-box/coin-5.png",
    "/images/rewards/mystery-box/coin-6.png",
  ];

  // Handle open box action - 直接显示免费旋转次数
  const handleOpenBox = () => {
    setIsAnimating(true);
    updateModalState("opening");
    
    // 设置获得的免费旋转次数
    updateWonAmount(freeSpinsCount);
    
    // 延迟1秒后显示开启状态（与 Mystery Box 一致）
    setTimeout(() => {
      updateModalState("opened");
      setIsAnimating(false);
    }, 1000);
  };

  // Render closed box state
  const renderClosedBox = (shaking: boolean = false) => (
    <div
      className="flex flex-col items-center sm:h-[600px] relative overflow-hidden"
      style={{
        transform: "translateZ(0)", // 启用硬件加速
        backfaceVisibility: "hidden", // 减少重绘
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

              filter: "drop-shadow(0 4px 0 #AB1EE6) drop-shadow(0 4px 7px #6F00CB)",
            }}
          >
            Starter
          </h1>
          <h1
            className="text-[70px] font-[Lobster] -mt-12 text-end w-full -mr-5"
            style={{
              background:
                "linear-gradient(183deg, color(display-p3 0.8246 0.6993 1) 2.12%, color(display-p3 0.9325 0.9206 1) 57.21%, color(display-p3 0.726 0.599 1) 57.33%, color(display-p3 1 0.6815 0.9416) 102.79%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",

              filter: "drop-shadow(0 4px 0 #AB1EE6) drop-shadow(0 4px 7px #6F00CB)",
            }}
          >
            Pack
          </h1>
        </div>
      </div>

      {/* Mystery Box Image */}
      <div className="relative mb-8 z-10 w-full">
        <div className="relative w-full h-full flex items-center justify-center">
          <m.img
            key={shaking ? "box-closed-shake" : "box-closed-static"}
            src="/images/rewards/mystery-box/box-close.svg"
            alt="Mystery Box"
            className="object-contain z-40 m-4 sm:w-[340px] w-[240px]"
            style={{
              filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.6)) drop-shadow(0 4px 16px rgba(0, 0, 0, 0.3))",
              transform: "translateZ(0)", // 启用硬件加速
            }}
            animate={
              shaking
                ? {
                    rotate: [0, -8, 8, -6, 6, -4, 4, 0],
                    x: [0, -6, 6, -5, 5, -3, 3, 0],
                    transition: { duration: 0.6, ease: "easeInOut" },
                  }
                : undefined
            }
            onAnimationComplete={() => {
              if (shaking) {
                updateModalState("opened");
                setIsAnimating(false);
              }
            }}
          />

          <m.img
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
          />
        </div>
      </div>

      {/* Open Box Button */}
      <button 
        onClick={handleOpenBox} 
        disabled={isAnimating} 
        className="btn btn-primary btn-lg px-16 mb-4 z-10 mt-6 sm:btn-xl"
      >
        {isAnimating ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          "Open Box"
        )}
      </button>
    </div>
  );

  const renderOpened = () => (
    <div
      className="flex flex-col items-center sm:h-[600px] relative overflow-hidden"
      style={{
        transform: "translateZ(0)", // 启用硬件加速
        backfaceVisibility: "hidden", // 减少重绘
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

              filter: "drop-shadow(0 4px 0 #AB1EE6) drop-shadow(0 4px 7px #6F00CB)",
            }}
          >
            You Win
          </h1>
        </div>
      </div>

      {/* Mystery Box Image */}
      <div className="relative mb-8 z-10 w-full">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-[290px] h-[290px] -translate-x-3 sm:translate-y-6 translate-y-8">
            <img
              src="/images/rewards/mystery-box/box-open-body.svg"
              alt="Mystery Box"
              className="object-contain z-40 m-4 sm:w-[300px] absolute top-12 left-1/2 -translate-x-1/2"
              style={{
                filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.6)) drop-shadow(0 4px 16px rgba(0, 0, 0, 0.3))",
              }}
            />
            <m.img
              key="box-open-in"
              animate={{
                rotate: 16,
                y: isMobile ? -80 : -110,
                x: isMobile ? 40 : 60,
              }}
              transition={{
                duration: 1,
                ease: "easeInOut",
              }}
              src="/images/rewards/mystery-box/box-open-in.svg"
              alt="Mystery Box"
              className="object-contain z-40 m-4 sm:w-[240px] w-[170px] absolute top-2 -rotate-11 left-1/2 -translate-x-[calc(50%+7px)]"
              style={{
                filter: "drop-shadow(0 0 8px rgba(0, 0, 0, 0.6)) drop-shadow(0 4px 16px rgba(0, 0, 0, 0.3))",
              }}
            />
          </div>
          {/* Optimized celebration animation - Fewer elements, larger distances */}
          <div className="absolute -inset-20 flex items-center justify-center pointer-events-none z-50 overflow-hidden" style={{ willChange: "transform" }}>
            
            {/* Persistent floating coins for first 3 */}
            {Array.from({ length: 3 }).map((_, i) => {
              const angle = (i * 120); // 3 coins at 120° apart
              const distance = 140 + i * 30;
              const dx = Math.sin((angle * Math.PI) / 180) * distance;
              const dy = -Math.cos((angle * Math.PI) / 180) * distance - 40;
              const floatDelay = i * 0.3;
              
              return (
                <m.img
                  key={`coin-float-${i}`}
                  src={coinImages[i]}
                  className="absolute drop-shadow-2xl"
                  style={{ 
                    width: '32px', 
                    height: '32px',
                    left: `calc(50% + ${dx}px)`,
                    top: `calc(50% + ${dy}px)`,
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
                      "brightness(1.2) drop-shadow(0 0 6px rgba(255, 215, 0, 0.5))",
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
                <m.img
                  key={`star-persist-${i}`}
                  src="/images/rewards/mystery-box/star.svg"
                  className="absolute"
                  style={{ 
                    width: '24px', 
                    height: '24px',
                    left: `calc(50% + ${dx}px)`,
                    top: `calc(50% + ${dy}px)`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0, 0, 0, 1],
                    scale: [0, 0, 0, 0, 1, 1.3, 1],
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
                    },
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
              const src = isVector1 ? "/images/rewards/mystery-box/vector1.svg" : "/images/rewards/mystery-box/vector2.svg";
              
              return (
                <m.img
                  key={`vector-persist-${i}`}
                  src={src}
                  className="absolute"
                  style={{ 
                    width: '28px', 
                    height: '28px',
                    left: `calc(50% + ${dx}px)`,
                    top: `calc(50% + ${dy}px)`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0, 0, 0, 1],
                    scale: [0, 0, 0, 0, 1],
                  }}
                  transition={{
                    opacity: { duration: 3.2, times: [0, 0.5, 0.6, 0.7, 1] },
                    scale: { duration: 3.2, times: [0, 0.5, 0.6, 0.7, 1] },
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
                <m.img
                  key={`coin-main-${i}`}
                  src={src}
                  className="absolute drop-shadow-2xl"
                  style={{ width: `${size}px`, height: `${size}px` }}
                  initial={{ 
                    opacity: 0, 
                    scale: 0.2, 
                    x: 0, 
                    y: 20, 
                    rotate: 0,
                    filter: "brightness(1.3) drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))"
                  }}
                  animate={{
                    opacity: i < 3 ? [0, 1, 1, 0.9, 0.4] : [0, 1, 1, 0.9, 0], // 保留前3个币
                    scale: [0.2, 1.5, 1.2, 0.9, 0.6],
                    x: [0, dx * 0.3, dx * 0.7, dx * 1.1, dx * 1.6],
                    y: [20, dy * 0.2, dy * 0.6, dy + 60, dy + 150],
                    rotate: [0, rotation * 0.3, rotation * 0.6, rotation * 0.9, rotation],
                    filter: [
                      "brightness(1.3) drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))",
                      "brightness(1.6) drop-shadow(0 0 16px rgba(255, 215, 0, 1))",
                      "brightness(1.4) drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))",
                      "brightness(1.2) drop-shadow(0 0 6px rgba(255, 215, 0, 0.4))",
                      i < 3 ? "brightness(1.1) drop-shadow(0 0 4px rgba(255, 215, 0, 0.3))" : "brightness(1) drop-shadow(0 0 0px rgba(255, 215, 0, 0))"
                    ]
                  }}
                  transition={{ 
                    duration: 3.2, 
                    delay: delay,
                    ease: [0.23, 1, 0.32, 1]
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
                <m.img
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
                    rotate: [0, rotation * 0.5, rotation],
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
              const src = isVector1 ? "/images/rewards/mystery-box/vector1.svg" : "/images/rewards/mystery-box/vector2.svg";
              
              return (
                <m.img
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
                    y: [10, dy * 0.4, dy + 80],
                    rotate: [rotation, rotation + 180, rotation + 360],
                  }}
                  transition={{ 
                    duration: 2.6, 
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
                <m.div
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
                    y: [0, dy * 0.7, dy + 50],
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
                <m.div
                  key={`continuous-spark-${i}`}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0, 0, 0, 0.6, 0.3, 0.6],
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
                </m.div>
              );
            })}
          </div>
          <m.img
            key="light-2"
            src="/images/rewards/mystery-box/light-2.png"
            className="absolute sm:top-18 top-20.5 sm:left-[calc(50%-8px)] left-[calc(50%-4px)] -translate-x-1/2 -translate-y-1/2 object-cover opacity-80 sm:w-[400px] w-[300px] z-30"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 1,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>

      {/* Free Spins Display - 放在 light-2 上方 2rem */}
      {wonAmount > 0 && (
        <div className="absolute top-[calc(50%-2rem)] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-40">
          <div className="text-4xl font-bold text-base-100">
            {wonAmount} SPINS
          </div>
        </div>
      )}

      {/* Continue Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onContinue) {
            onContinue();
          } else {
            onClose();
          }
        }}
        className="btn btn-success btn-lg px-16 mb-4 z-10 mt-6 sm:btn-xl"
      >
        Continue
      </button>
    </div>
  );

  // Render content based on state
  const renderContent = () => {
    if (modalState === "opening") {
      return renderClosedBox(true);
    }

    return (
      <AnimatePresence mode="wait">
        {modalState === "closed" && (
          <m.div
            key="state-closed"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {renderClosedBox(false)}
          </m.div>
        )}

        {modalState === "opened" && (
          <m.div
            key="state-opened"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {renderOpened()}
          </m.div>
        )}
      </AnimatePresence>
    );
  };

  // Reset state when modal opens (only if not controlled externally)
  React.useEffect(() => {
    if (isOpen && externalModalState === undefined) {
      updateModalState("closed");
      updateWonAmount(0);
      setIsAnimating(false);
    }
  }, [isOpen, externalModalState]);

  // 预加载图片以提高性能
  React.useEffect(() => {
    if (isOpen) {
      const preloadImages = [
        "/images/rewards/mystery-box/box-close.svg",
        "/images/rewards/mystery-box/light.svg",
        "/images/rewards/mystery-box/box-open-body.svg",
        "/images/rewards/mystery-box/light-2.png",
        "/images/rewards/mystery-box/box-open-in.svg",
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
      hideTitle
      className="md:w-[500px] max-w-lg p-0 rounded-box"
      position="modal-middle"
      closeButtonClassName="bg-transparent hover:bg-white/10 border-0 text-white/70 hover:text-white z-50"
      style={{
        background: "linear-gradient(175deg, color(display-p3 0.226 0.2013 0.3357) -1.75%, color(display-p3 0.3059 0.0549 0.298) 54.33%)",
        borderRadius: "12px",
        boxShadow: "0 4px 250px 1000px color(display-p3 0 0 0 / 0.50)",
      }}
    >
      <div className="relative ">
        {/* Main Content */}
        <div>{renderContent()}</div>
      </div>
    </Modal>
  );
}