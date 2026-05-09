import { Modal } from "@/components/ui/Modal";
import Copy from "@/components/ui/Copy";
import Iconify from "@/components/iconify";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { shareTo } from "@/features/social/lib/socialShare";
import type { SocialNavigationResult } from "@/features/social/lib/socialNavigation";

type ReferralShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  referralLink?: string;
};

export const ReferralShareModal: React.FC<ReferralShareModalProps> = ({
  isOpen,
  onClose,
  referralLink = "",
}) => {
  const { t } = useTranslation(['referral', 'common']);
  const hasShareableLink = /^https?:\/\//i.test(referralLink);

  const shareText = t("referral:shareText", "🎮 Join me on this amazing platform!");

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

  const handleSocialShare = async (platform: string) => {
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

  const handleWhatsAppRecruit = async () => {
    try {
      const result = await shareTo("whatsapp", {
        url: referralLink,
        text: shareText,
      });
      if (!result.handled || result.result?.status !== "opened") {
        notifyShareIssue(result.result);
      }
    } catch (error) {
      console.error("WhatsApp share error:", error);
      toast.error(t("common:error", "Something went wrong. Please try again."));
    }
  };

  const socialIcons = [
    { id: "telegram", icon: "custom:telegram-2", color: "text-[#0088cc]" },
    { id: "whatsapp", icon: "custom:whats-app", color: "text-[#25D366]" },
    { id: "messenger", icon: "custom:facebook-messenger", color: "text-[#0084FF]" },
    { id: "facebook", icon: "custom:facebook", color: "text-[#1877F2]" },
    { id: "instagram", icon: "custom:instagram", color: "text-[#E4405F]" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideTitle
      zIndex={1111111}
      position="modal-middle"
      className="bg-base-400 max-w-full sm:w-[460px] sm:max-w-[92vw] rounded-t-3xl sm:rounded-3xl text-base-content shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
      closeButtonClassName="btn-sm btn-square bg-base-300/40 border-0 text-base-content/70 hover:bg-base-300"
      id="referral-share"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold text-base-content">
          <Iconify icon="mdi:share-variant" width={24} height={24} className="text-primary" />
          <span>{t("referral:spread_the_Love", "Spread the Love")}</span>
        </div>

        <div className="bg-base-300/70 rounded-field px-3 py-2 flex items-center gap-2 min-w-0">
          <div className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
            <span className="text-xs font-semibold text-base-content/60 whitespace-nowrap">
              {hasShareableLink
                ? referralLink
                : t("referral:loadingLink", "Loading link...")}
            </span>
          </div>
          {hasShareableLink && (
            <Copy
              text={referralLink}
              trigger={
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-primary hover:text-primary-focus focus:outline-none focus:ring-2 focus:ring-primary/60 shrink-0"
                  aria-label={t("referral:copyLink", "Copy link")}
                >
                  <Iconify icon="solar:copy-linear" width={14} height={14} />
                </button>
              }
            />
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-base-content/80 uppercase tracking-wide">
            {t("referral:quickShare", "Quick Share")}
          </h3>
          <div className="flex items-center justify-center gap-4">
            {socialIcons.map((social) => (
              <button
                key={social.id}
                onClick={() => {
                  void handleSocialShare(social.id);
                }}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-base-200 hover:bg-base-300 transition-all hover:scale-110"
                aria-label={`Share on ${social.id}`}
                disabled={!hasShareableLink}
              >
                <Iconify icon={social.icon} width={28} height={28} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-base-content">
            <span>{t("referral:need", "Need")} </span>
            <span className="text-primary">{t("referral:new_friends", "New Friends?")}</span>
          </h3>
          <p className="text-sm text-base-content/60">
            {t(
              "referral:timeToRecruit",
              "Time to recruit! Tap the button to tell a total stranger about us on WhatsApp."
            )}
          </p>
          <button
            onClick={() => {
              void handleWhatsAppRecruit();
            }}
            className="btn btn-lg w-full text-base rounded-field border-0 font-bold text-black bg-primary hover:bg-primary/80 transition-colors"
            disabled={!hasShareableLink}
          >
            {t("referral:sendOnWhatsapp", "Send on Whatsapp")}
          </button>
        </div>
      </div>
    </Modal>
  );
};
