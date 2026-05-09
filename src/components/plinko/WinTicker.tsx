import { type MouseEvent, useRef, useState } from 'react';

interface WinTickerProps {
  wins: Array<{ id: number; amount: number; displayAmount: string; currencySymbol: string; colorBg: string; colorBorder: string; colorNum: string }>;
}

export const WinTicker = ({ wins }: WinTickerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);

  if (wins.length === 0) return null;

  const mix = (base: string, other: string, ratio: number) => {
    const t = Math.max(0, Math.min(1, ratio));
    return `color-mix(in oklab, ${base} ${(1 - t) * 100}%, ${other} ${t * 100}%)`;
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    setIsDragging(true);
    setDragStartX(event.clientX);
    setScrollStartLeft(container.scrollLeft);
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !isDragging) return;
    const deltaX = event.clientX - dragStartX;
    container.scrollLeft = scrollStartLeft - deltaX;
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className={`absolute left-2 right-2 top-2 z-10 flex items-center gap-1.5 overflow-x-auto overflow-y-hidden whitespace-nowrap md:top-1/2 md:-translate-y-1/2 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {wins.map((win) => {
        const scale = 1;
        //const opacity = Math.max(0.5, 1 - index * 0.05);
        const opacity = 1;
        const bgTop = mix(win.colorBg, win.colorNum, 0.06);
        const bgMid = mix(win.colorBg, win.colorBorder, 0.12);
        const bgBot = mix(win.colorBg, 'black', 0.18);
        const border = mix(win.colorBorder, win.colorNum, 0.12);
        const glow = mix(win.colorBorder, 'transparent', 0.4);
        
        return (
          <div
            key={win.id}
            className="px-2 py-1 rounded-md text-xs font-bold animate-slide-in-left whitespace-nowrap border transition-all duration-300"
            style={{ 
              background: `linear-gradient(180deg, ${bgTop} 0%, ${bgMid} 54%, ${bgBot} 100%)`,
              color: win.colorNum,
              borderColor: border,
              textShadow: `0 0 10px ${mix(win.colorNum, 'transparent', 0.18)}`,
              boxShadow: `0 0 0 1px ${mix(border, 'transparent', 0.2)}, 0 10px 18px rgba(0,0,0,0.25), 0 0 18px ${glow}`,
              transform: `scale(${scale})`,
              opacity,
            }}
          >
            +{win.displayAmount}
          </div>
        );
      })}
    </div>
  );
};
