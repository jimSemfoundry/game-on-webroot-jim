import Iconify from "@/components/iconify";
import { cn } from "@/utils/cn.ts";
import { ReactNode, useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export interface CopyProps {
  icon?: ReactNode; // 拷贝的icon
  text: string;
  trigger?: ReactNode;
  onCopy?: () => void;
  copyCls?: string; // 默认状态的的icon颜色class
  copiedCls?: string; // 已拷贝状态的icon颜色class
  className?: string;
}

const Copy = ({ text, icon, onCopy, trigger, copyCls, copiedCls, className }: CopyProps) => {
  const { t } = useTranslation();

  const [v, setV] = useState<boolean>(false);

  useEffect(() => {
    if (!v) return;
    const t = setTimeout(() => {
      setV(() => false);
    }, 1000);

    return () => clearTimeout(t);
  }, [v]);

  return text ? (
    <CopyToClipboard
      text={text}
      onCopy={() => {
        setV(true);
        onCopy?.();
        toast.success(t("common:copied"));
      }}
    >
      <span className={!v ? copyCls || "text-base-content/50" : copiedCls || "text-primary"}>
        {trigger}
        {!trigger && (icon || <Iconify icon="custom:copied" className={cn("w-5 h-5 cursor-pointer", className)} />)}
      </span>
    </CopyToClipboard>
  ) : null;
};

export default Copy;
