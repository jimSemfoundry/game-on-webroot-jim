import { useMediaQuery } from "@/hooks/useMediaQuery";

interface BonusCollectorCardProps {
  className?: string;
}

export function BonusCollectorCard({ className = "" }: BonusCollectorCardProps) {

  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <div
      className={`w-full rounded-field sm:rounded-box p-4 ${className} sm:border-base-content/20 sm:border sm:cursor-pointer sm:hover:border-base-content/50`}
      style={{
        background: isMobile  ? `repeating-linear-gradient(
        135deg,
        oklch(from var(--color-base-100) l c h / 0.6) 0px,
        oklch(from var(--color-base-100) l c h / 0.6) 8px,
        oklch(from var(--color-base-100) l c h / 0.5) 8px,
        oklch(from var(--color-base-100) l c h / 0.5) 16px
      )` : 'var(--color-base-300)'
      }}
    >
      <div className="flex items-center gap-4">
        <img src="/images/rewards/bonus-collector.png" alt="Collector" className="w-15 h-15" />
        <div className="flex flex-col">
          <p className="text-sm font-bold sm:text-xl">The Collector</p>
          <p className="text-xs text-primary sm:text-base sm:font-semibold">Eligible Rewards, One Click</p>
        </div>
        <button className="btn btn-primary btn-soft btn-md sm:hidden">Claim All</button>
      </div>
    </div>
  );
}
