import { useSupportedGameCurrencies } from "@/hooks/api/usePublic.ts";
import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";

export const CurrencyIconPlaceholder = ({
  alt,
  className,
  currency,
  ...props
}: React.ComponentProps<"img"> & {
  currency: string;
}) => {
  const { data: currencies } = useSupportedGameCurrencies();
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const target = useMemo(() => {
    if (currencies?.data) {
      const info = currencies?.data?.find((cur: Record<string, any>) => cur?.currency?.toUpperCase() === currency?.toUpperCase());
      if (info?.icon) return info.icon;
      return `/icons/currency/${currency?.toLowerCase()}.svg`;
    }
    return "";
  }, [currency, currencies?.data]);
  useEffect(() => {
    if (!target) return;
    setImageLoaded(false);
    const img = new Image();
    img.src = target;
    img.onload = () => setImageLoaded(true);
  }, [target]);
  return imageLoaded ? (
    <img {...props} src={target} className={classNames("w-5 h-5 rounded-full", className)} alt={alt} />
  ) : (
    <div className={classNames("skeleton bg-base-200 w-5 h-5 rounded-full", className)} />
  );
};
