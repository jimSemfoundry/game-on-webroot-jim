import { type ButtonHTMLAttributes } from "react";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  buildOfficialChannelTarget,
  type OfficialPlatform,
} from "@/features/social/lib/socialTargets";
import { openSocialTarget } from "@/features/social/lib/socialNavigation";

type TMedia = OfficialPlatform;

const media_info_match: {
  [key in TMedia]: { icon: string }
} = {
  'telegram': { icon: 'telegram.svg' },
  'twitter': { icon: 'twitter.svg' },
  'facebook': { icon: 'facebook.svg' },
  'youtube': { icon: 'youtube.svg' },
  'whatsapp': { icon: 'whatsapp.svg' },
  'instagram': { icon: 'instagram.svg' },
}

export const SocialMedia = ({className}:{className?: string}) => {
  const { data: baseConf } = useBaseConfig()
  const { t } = useTranslation("common");

  const handleSocialClick = async (media: TMedia, rawUrl: string) => {
    const target = buildOfficialChannelTarget({
      platform: media,
      rawUrl,
    });
    const result = await openSocialTarget(target);

    if (result.status === "opened") {
      return;
    }

    if (result.status === "blocked") {
      toast.error(
        t(
          "socialLinkPopupBlocked",
          "Unable to open the link. Please allow pop-ups or open it in your browser."
        )
      );
      return;
    }

    if (result.status === "failed" && result.reason === "telegram-open-failed") {
      toast.error(
        t(
          "socialLinkTelegramFailed",
          "Unable to open this link from Telegram right now."
        )
      );
      return;
    }

    toast.error(
      t(
        "socialLinkUnavailable",
        "This social link is unavailable right now."
      )
    );
  };

  return (<div className={clsx("flex gap-1", className)}>
    {baseConf?.data?.media_links && Object.entries(baseConf?.data?.media_links).map(([a, b]) => {
      if (!(a in media_info_match)) {
        return null;
      }

      const url = typeof b === "string" ? b : "";
      if (url.trim()) {
        const media = a as TMedia;
        return (
          <InnerButton
            key={a}
            icon={media_info_match[media].icon}
            onClick={() => {
              void handleSocialClick(media, url);
            }}
            aria-label={`Open ${media} official channel`}
          />
        )
      }

      return null;
    })}
  </div>)
}

const InnerButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement> & { icon: string }
) => {
  const { icon, className, type, ...rest } = props;

  return (
    <button
      {...rest}
      type={type ?? "button"}
      className={clsx("btn btn-ghost btn-lg bg-base-100 p-0 w-12", className)}
    >
      <img
        src={`https://image.1st.game/public/social-logo/${icon}`}
        alt=""
      />
    </button>
  );
}
