import { Modal } from "@/components/ui/Modal";
import Copy from "@/components/ui/Copy";
import Iconify from "@/components/iconify";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { isMobile } from "@/utils/browser";
import { toast } from "sonner";

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
  const { t } = useTranslation();

  const shareMessage = useMemo(() => {
    return encodeURIComponent(
      `🎮 Join me on this amazing platform! Use my referral link: ${referralLink}`
    );
  }, [referralLink]);

  const handleSocialShare = (platform: string) => {
    try {
      let url = "";
      
      switch (platform) {
        case "telegram":
          url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("🎮 Join me on this amazing platform!")}`;
          break;
        case "whatsapp":
          if (isMobile()) {
            const whatsappMobileLink = `whatsapp://send?text=${shareMessage}`;
            const link = document.createElement('a');
            link.href = whatsappMobileLink;
            link.setAttribute('data-action', 'share/whatsapp/share');
            link.setAttribute('target', '_blank');
            link.click();

            setTimeout(() => {
              window.location.href = `https://api.whatsapp.com/send?text=${shareMessage}`;
            }, 300);
            return;
          } else {
            url = `https://web.whatsapp.com/send?text=${shareMessage}`;
          }
          break;
        case "messenger":
          if (isMobile()) {
            url = `fb-messenger://share/?link=${encodeURIComponent(referralLink)}`;
          } else {
            url = `https://www.messenger.com/t/?link=${encodeURIComponent(referralLink)}`;
          }
          break;
        case "facebook":
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
          break;
        case "instagram":
          navigator.clipboard?.writeText(referralLink);
          toast.success(t("referral:linkCopiedOpenInstagram", "Link copied! Open Instagram to share."));
          return;
        default:
          return;
      }
      
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Share error:", error);
      toast.error(t("common:error", "Something went wrong. Please try again."));
    }
  };

  const handleWhatsAppRecruit = () => {
    try {
      if (isMobile()) {
        const whatsappMobileLink = `whatsapp://send?text=${shareMessage}`;
        const link = document.createElement('a');
        link.href = whatsappMobileLink;
        link.setAttribute('data-action', 'share/whatsapp/share');
        link.setAttribute('target', '_blank');
        link.click();

        setTimeout(() => {
          window.location.href = `https://api.whatsapp.com/send?text=${shareMessage}`;
        }, 300);
      } else {
        const url = `https://web.whatsapp.com/send?text=${shareMessage}`;
        window.open(url, "_blank", "noopener,noreferrer");
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
      position="modal-middle"
      className="bg-base-400 max-w-full sm:w-[460px] sm:max-w-[92vw] rounded-t-3xl sm:rounded-3xl text-base-content shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
      closeButtonClassName="btn-sm btn-square bg-base-300/40 border-0 text-base-content/70 hover:bg-base-300"
      id="referral-share"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold text-base-content">
          <Iconify icon="mdi:share-variant" width={24} height={24} className="text-primary" />
          <span>{t("referral:spreadTheLove", "Spread the Love")}</span>
        </div>

        <div className="bg-base-300/70 rounded-field px-3 py-2 flex items-center gap-2 min-w-0">
          <div className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
            <span className="text-xs font-semibold text-base-content/60 whitespace-nowrap">
              {referralLink || "https://game.on/start?323z1DF"}
            </span>
          </div>
          {referralLink && (
            <Copy
              text={referralLink}
              trigger={
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-primary hover:text-primary-focus focus:outline-none focus:ring-2 focus:ring-primary/60 flex-shrink-0"
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
                onClick={() => handleSocialShare(social.id)}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-base-200 hover:bg-base-300 transition-all hover:scale-110"
                aria-label={`Share on ${social.id}`}
              >
                <Iconify icon={social.icon} width={28} height={28} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-base-content">
            <span>{t("referral:need", "Need")} </span>
            <span className="text-primary">{t("referral:newFriends", "New Friends")}</span>
            <span>?</span>
          </h3>
          <p className="text-sm text-base-content/60">
            {t(
              "referral:timeToRecruit",
              "Time to recruit! Tap the button to tell a total stranger about us on WhatsApp."
            )}
          </p>
          <button
            onClick={handleWhatsAppRecruit}
            className="btn btn-lg w-full text-base rounded-field border-0 font-bold text-black bg-primary hover:bg-primary/80 transition-colors"
          >
            {t("referral:sendOnWhatsapp", "Send on Whatsapp")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

