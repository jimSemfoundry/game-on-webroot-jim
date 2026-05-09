import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useReferralLink } from "@/hooks/useReferralLink.ts";
import Copy from "@/components/ui/Copy.tsx";
import Iconify from "@/components/iconify";
import { shareTo } from "@/features/social/lib/socialShare";
import { toast } from "sonner";
import type { SocialNavigationResult } from "@/features/social/lib/socialNavigation";

const icons = [
  { id: "telegram", icon: "custom:telegram-2" },
  { id: "whatsapp", icon: "custom:whats-app" },
  { id: "messenger", icon: "custom:facebook-messenger" },
  { id: "facebook", icon: "custom:facebook" },
  { id: "instagram", icon: "custom:instagram" }
];

export const InnerShareLink = (
  {
    showQuickShareTitle = false,
    onClose
  }: {
    showQuickShareTitle?: boolean;
    onClose?: () => void;
  }
) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation(["common", "bonus", "referral", "buddyBalls"]);

  const { referralLink } = useReferralLink();
  const hasShareableLink = /^https?:\/\//i.test(referralLink);

  const shareText = "🎮 Join me on this amazing platform!";

  const notifyShareIssue = (result?: SocialNavigationResult) => {
    if (!result) {
      toast.error(t("referral:shareLinkUnavailable", "Share link isn't ready yet. Please try again."));
      return;
    }

    if (result.status === "blocked") {
      toast.error(
        t(
          "referral:sharePopupBlocked",
          "Unable to open the share target. Please allow pop-ups or open it in your browser."
        )
      );
      return;
    }

    if (result.status === "failed" && result.reason === "telegram-open-failed") {
      toast.error(
        t(
          "referral:shareTelegramFailed",
          "Unable to open this share target from Telegram right now."
        )
      );
      return;
    }

    if (result.status === "failed" && result.reason === "clipboard-failed") {
      toast.error(
        t(
          "referral:copyFailed",
          "Unable to copy the link right now. Please try again."
        )
      );
      return;
    }

    toast.error(t("common:error", "Something went wrong. Please try again."));
  };

  const handle = async (platform: string) => {
    try {
      const result = await shareTo(platform as any, {
        url: referralLink,
        text: shareText,
      });
      if (!result.handled) {
        notifyShareIssue();
        return;
      }
      if (result.copied) {
        toast.success(t("referral:linkCopiedOpenInstagram", "Link copied! Open Instagram to share."));
        return;
      }
      if (result.result?.status !== "opened") {
        notifyShareIssue(result.result);
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error(t("common:error", "Something went wrong. Please try again."));
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el && document.documentElement.dir === "rtl") {
      el.scrollLeft = -el.scrollWidth;
    }

    // 监听 dir 属性变化
    const observer = new MutationObserver(() => {
      if (el && document.documentElement.dir === "rtl") {
        el.scrollLeft = -el.scrollWidth;
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"]
    });

    return () => observer.disconnect();
  }, [referralLink]);

  return (
    <div className="px-4 py-3">
      <div className="">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Iconify icon="custom:share" />
            <span>{t("buddyBalls:share", "Share")}</span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="relative -top-[10px] -right-[15px] flex h-9 w-9 items-center justify-center rounded-xl bg-base-400 text-base-content/70 transition-colors hover:bg-base-300"
              aria-label="Close share"
            >
              <span className="relative -top-[0px] text-2xl leading-none text-base-content/50" aria-hidden="true">
                &times;
              </span>
            </button>
          )}
        </div>
        <div className="mt-3 min-w-0 rounded-md bg-base-400 flex items-center p-1 pl-2 gap-1 flex-1">
          <div className="flex-1 min-w-0 overflow-x-auto hide-scrollbar" ref={scrollRef}>
            <span className="text-base-content/50 text-xs sm:text-sm font-semibold whitespace-nowrap">
              {hasShareableLink
                ? referralLink
                : t("referral:loadingLink", "Loading link...")}
            </span>
          </div>
          <Copy
            text={hasShareableLink ? referralLink : ""}
            trigger={
              <button className="btn btn-primary btn-soft btn-square btn-xs sm:btn-sm shrink-0 rounded-md">
                <Iconify icon="custom:copied" />
              </button>
            }
          />
        </div>
      </div>

      {showQuickShareTitle && (
        <div className="mt-5 flex items-center gap-1">
          <span>{t("buddyBalls:quickShare", "Quick Share")}</span>
        </div>
      )}

      <div className={showQuickShareTitle ? "mt-6 flex items-center justify-center gap-3" : "mt-4 flex items-center justify-center gap-3"}>
        {icons.map((social) => (
          <button
            key={social.id}
            onClick={(e) => {
              e.stopPropagation();
              void handle(social.id);
            }}
            className="cursor-pointer rounded-md w-10 h-10 bg-base-200 hover:bg-base-300 transition-all hover:scale-110"
            aria-label={`Share on ${social.id}`}
            disabled={!hasShareableLink}
          >
            <Iconify icon={social.icon} width={28} height={28} />
          </button>
        ))}
      </div>
    </div>
  );
};
