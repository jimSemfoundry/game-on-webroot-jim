import React, { useEffect, useMemo, useState } from "react";
import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useCreateAdTag } from "@/hooks/api/useAuth";
import { cn } from "@/utils/cn";
import { useTranslation } from "react-i18next";
import Copy from "@/components/ui/Copy";
import { toast } from "sonner";

type CreateCampaignModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

const COMMISSION_OPTIONS = [0, 10, 25, 50];

const generateCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { t } = useTranslation();
  const createCampaign = useCreateAdTag();

  const [commissionSplit, setCommissionSplit] = useState<number>(25);
  const [campaignName, setCampaignName] = useState("");
  const [referralCode, setReferralCode] = useState(generateCode());
  const [isDefaultCampaign, setIsDefaultCampaign] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCommissionSplit(25);
      setCampaignName("");
      setReferralCode(generateCode());
      setIsDefaultCampaign(false);
    }
  }, [isOpen]);

  const { youReceive, referralReceive } = useMemo(() => {
    const referral = commissionSplit;
    return {
      youReceive: Math.max(0, 100 - referral),
      referralReceive: referral,
    };
  }, [commissionSplit]);

  const referralLink = useMemo(() => {
    return referralCode ? `${location.origin}?startapp=${referralCode}` : "";
  }, [referralCode]);

  const handleGenerateCode = () => {
    setReferralCode(generateCode());
  };

  const handleClose = () => {
    if (!createCampaign.isPending) {
      onClose();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (createCampaign.isPending) return;
    if (!campaignName.trim() || !referralCode.trim()) return;
    
    if (referralCode.trim().length < 6) {
      toast.error(t("referral:referralCodeMinLength", "Referral code must be at least 6 characters long"));
      return;
    }

    try {
      await createCampaign.mutateAsync({
        campaign: campaignName.trim(),
        code: referralCode.trim().toUpperCase(),
        is_default: isDefaultCampaign,
        share: commissionSplit.toString(),
      });
      onCreated?.();
      onClose();
    } catch (error) {
      // toast handled by hook
    }
  };

  const isSubmitDisabled =
    !campaignName.trim() ||
    !referralCode.trim() ||
    createCampaign.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      hideTitle
      className="bg-base-400 w-full max-w-full sm:w-[420px] sm:max-w-[92vw] rounded-t-3xl sm:rounded-3xl text-base-content shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
      closeButtonClassName="btn-sm btn-square bg-base-300/40 border-0 text-base-content/70 hover:bg-base-300"
      id="create-campaign"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold text-base-content">
          <Iconify icon="custom:speaker" width={22} height={22} className="text-primary" />
          <span>{t("referral:createCampaign", "Create Campaign")}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-field bg-base-300/70 px-4 py-3 flex flex-col gap-1">
            <span className="text-xs uppercase font-semibold text-base-content/60">
              {t("referral:youReceive", "You Receive")}
            </span>
            <span className="text-2xl font-bold text-base-content">{youReceive}%</span>
          </div>
          <div className="rounded-field bg-base-300/40 px-4 py-3 flex flex-col gap-1">
            <span className="text-xs uppercase font-semibold text-base-content/40">
              {t("referral:referralReceives", "Referral")}
            </span>
            <span className="text-2xl font-bold text-base-content/80">{referralReceive}%</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold text-base-content/60">
              {t("referral:commissionSplit", "Commission Split")}
            </span>
            <Iconify icon="mdi:information-outline" width={16} height={16} className="text-base-content/40" />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {COMMISSION_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCommissionSplit(option)}
                className={cn(
                  "rounded-full px-3 py-2 text-xs font-semibold transition-all border border-base-300/40",
                  commissionSplit === option
                    ? "bg-primary text-black"
                    : "bg-base-300/40 text-base-content/80 hover:bg-base-300/60"
                )}
              >
                {option}%
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase font-semibold text-base-content/60 block" htmlFor="campaign-name">
            {t("referral:campaignName")}
          </label>
          <label className="input input-md bg-base-300/70 input-ghost focus-within:bg-base-300 w-full rounded-field">
            <input
              id="campaign-name"
              type="text"
              className="w-full bg-transparent font-semibold text-base-content placeholder:text-base-content/40 focus:outline-none"
              placeholder={t("referral:enterCampaignName", "Campaign name")}
              value={campaignName}
              onChange={(event) => setCampaignName(event.target.value)}
              maxLength={40}
            />
          </label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase font-semibold text-base-content/60" htmlFor="referral-code">
              {t("referral:referralCodeAndLink")}
            </label>
            <button
              type="button"
              onClick={handleGenerateCode}
              className="text-xs font-semibold text-primary hover:text-primary-focus"
            >
              {t("common:generate", "Generate")}
            </button>
          </div>

          <div className="bg-base-300/70 rounded-field px-3 py-2 flex items-center gap-2">
            <Iconify icon="solar:ticket-linear" width={18} height={18} className="text-primary" />
            <input
              id="referral-code"
              type="text"
              className="flex-1 bg-transparent font-semibold text-base-content uppercase tracking-wide focus:outline-none"
              value={referralCode}
              onChange={(event) => setReferralCode(event.target.value.toUpperCase())}
              minLength={6}
              maxLength={12}
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(referralCode).catch(() => {});
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-primary hover:text-primary-focus focus:outline-none focus:ring-2 focus:ring-primary/60"
              aria-label={t("referral:copyCode", "Copy code")}
            >
              <Iconify icon="solar:copy-linear" width={14} height={14} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase font-semibold text-base-content/60 block">
            {t("referral:referralLink", "Referral Link")}
          </label>
          <div className="bg-base-300/70 rounded-field px-3 py-2 flex items-center gap-2 min-w-0">
            <div className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
              <span className="text-xs font-semibold text-base-content/60 whitespace-nowrap">
                {referralLink || t("referral:enterCodeToGenerateLink", "Enter code to generate link")}
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
        </div>

        <label className="flex items-center gap-3 text-sm font-semibold text-base-content/80 select-none">
          <input
            type="checkbox"
            className="checkbox checkbox-sm bg-base-300 border-base-300 text-primary"
            checked={isDefaultCampaign}
            onChange={(event) => setIsDefaultCampaign(event.target.checked)}
          />
          <span>{t("referral:setAsDefaultCampaign")}</span>
        </label>

        <button
          type="submit"
          className={cn(
            "btn btn-lg w-full rounded-field border-0 font-bold text-black bg-primary hover:bg-primary/80 transition-colors",
            isSubmitDisabled && "pointer-events-none opacity-60"
          )}
          disabled={isSubmitDisabled}
        >
          {createCampaign.isPending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            t("referral:createCampaign", "Create Campaign")
          )}
        </button>
      </form>
    </Modal>
  );
};
