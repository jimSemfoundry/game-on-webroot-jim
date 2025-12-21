import { useMemo } from "react";
import { getNetworkType } from "@/components/ui/GameImage.tsx";

export const InnerGradient = () => {
  return useMemo(() => getNetworkType() !== "4g" ? null : (
    <>
      {/* Gradient Overlay Layers */}
      <div
        className="absolute inset-0 z-0 rounded-box"
        style={{
          background: "linear-gradient(45deg, transparent 18.45%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%)"
        }}
      />
      <div
        className="absolute inset-0 z-0 rounded-box"
        style={{
          background: "linear-gradient(270deg, transparent 1.67%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%)"
        }}
      />
      <div
        className="absolute inset-0 z-0 rounded-box"
        style={{
          background: "linear-gradient(0deg, transparent 0.33%, color-mix(in oklch, var(--color-base-300), transparent 0%) 100%)"
        }}
      />
      <div
        className="absolute inset-0 z-0 rounded-box"
        style={{
          background: "linear-gradient(180deg, transparent 0%, color-mix(in oklch, var(--color-base-300), transparent 20%) 100%)"
        }}
      />
    </>
  ), []);
};
