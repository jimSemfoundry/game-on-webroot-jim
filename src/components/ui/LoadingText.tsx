import { m } from 'motion/react';
import { useState, useEffect } from 'react';

interface LoadingTextProps {
  text?: string;
  textColor?: string;
  fontSize?: string;
  letterDelay?: number;
  springDuration?: number;
  letterImages?: string[];
  enableHover?: boolean;
  autoSweep?: boolean;
  sweepDuration?: number;
  sweepInterval?: number;
}

export function LoadingText({
  text = 'LOADING',
  textColor = 'text-primary',
  fontSize = 'text-6xl md:text-8xl',
  letterDelay = 0.08,
  springDuration = 600,
  letterImages = [],
  enableHover = true,
  autoSweep = true,
  sweepDuration = 1.5,
  sweepInterval = 2,
}: LoadingTextProps) {
  const [showPulse, setShowPulse] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [sweepIndex, setSweepIndex] = useState<number>(-1);

  useEffect(() => {
    // 在字母动画完成后开始脉冲动画和自动扫描
    const lastLetterDelay = (text.length - 1) * letterDelay;
    const totalDelay = lastLetterDelay * 1000 + springDuration;

    const timer = setTimeout(() => {
      setShowPulse(true);
      if (autoSweep && letterImages.length > 0) {
        setSweepIndex(0); // 开始自动扫描
      }
    }, totalDelay);

    return () => clearTimeout(timer);
  }, [text.length, letterDelay, springDuration, autoSweep, letterImages.length]);

  // 自动扫描效果
  useEffect(() => {
    if (!autoSweep || !showPulse || letterImages.length === 0) return;

    const sweepTimer = setInterval(() => {
      setSweepIndex((prev) => {
        // 循环：-1 表示暂停，然后从 0 到 text.length-1
        if (prev >= text.length - 1) {
          return -1; // 重置，等待下一轮
        }
        return prev + 1;
      });
    }, (sweepDuration * 1000) / text.length);

    return () => clearInterval(sweepTimer);
  }, [autoSweep, showPulse, text.length, sweepDuration, letterImages.length]);

  // 在完成一轮扫描后，等待一段时间再开始下一轮
  useEffect(() => {
    if (sweepIndex === -1 && showPulse && autoSweep && letterImages.length > 0) {
      const pauseTimer = setTimeout(() => {
        setSweepIndex(0);
      }, sweepInterval * 1000);

      return () => clearTimeout(pauseTimer);
    }
  }, [sweepIndex, showPulse, autoSweep, sweepInterval, letterImages.length]);

  // 是否有图片背景
  const hasImages = letterImages.length > 0;
  
  // 确定当前字母是否应该显示图片（手动悬停或自动扫描）
  const isImageVisible = (index: number) => {
    if (enableHover && hoveredIndex === index) return true;
    if (autoSweep && sweepIndex === index) return true;
    return false;
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex">
        {text.split('').map((letter, index) => {
          const showImage = isImageVisible(index);
          
          return (
            <m.span
              key={index}
              onMouseEnter={() => enableHover && hasImages && setHoveredIndex(index)}
              onMouseLeave={() => enableHover && setHoveredIndex(null)}
              className={`${fontSize} font-black tracking-tight relative overflow-hidden ${enableHover && hasImages ? 'cursor-pointer' : ''}`}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: index * letterDelay,
                duration: 0.3,
                ease: 'easeOut',
              }}
            >
              {/* 基础文字层 */}
              <m.span
                className={`absolute inset-0 ${textColor}`}
                animate={{
                  opacity: showImage ? 0 : 1,
                }}
                transition={{
                  duration: 0.3,
                }}
              >
                {letter}
              </m.span>

              {/* 图片文字层 */}
              {hasImages && (
                <m.span
                  className="text-transparent bg-clip-text bg-cover bg-center bg-no-repeat"
                  animate={{
                    opacity: showImage ? 1 : 0,
                    backgroundPosition: showImage ? ['50% 50%', '40% 50%', '60% 50%'] : '50% 50%',
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                    backgroundPosition: {
                      duration: 2,
                      ease: 'easeInOut',
                      repeat: showImage ? Infinity : 0,
                    },
                  }}
                  style={{
                    backgroundImage: `url('${letterImages[index % letterImages.length]}')`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {letter}
                </m.span>
              )}
            </m.span>
          );
        })}
      </div>
      
      {/* 三个跳动的点 */}
      {/* {showPulse && (
        <div className="flex gap-1 ml-2">
          {[0, 1, 2].map((i) => (
            <m.div
              key={i}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full bg-current ${textColor}`}
              animate={{
                y: [0, -10, 0],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                delay: i * 0.15,
                duration: 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )} */}
    </div>
  );
}

