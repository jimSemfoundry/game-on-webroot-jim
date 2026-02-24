import { ComponentProps } from "react";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import clsx from "clsx";
import { isIOS, isMobile } from "@/utils/browser";

 const isStandalonePwa = () => {
   const isIosStandalone = typeof (navigator as any)?.standalone === 'boolean' && (navigator as any).standalone;
   const isDisplayModeStandalone = typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)')?.matches;
   return Boolean(isIosStandalone || isDisplayModeStandalone);
 }

 const getExternalLinkTarget = () => {
   return (isStandalonePwa() || (isMobile() && isIOS())) ? '_self' : '_blank';
 }

type TMedia = 'telegram' |
  'twitter' |
  'facebook' |
  'youtube' |
  'whatsapp' |
  'instagram'

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
  return (<div className={clsx("flex gap-1.5", className)}>
    {baseConf?.data?.media_links && Object.entries(baseConf?.data?.media_links).map(([a, b]) => {
      const url = typeof b === 'string' ? b : '';
      if (url) {
        const target = getExternalLinkTarget();
        return (
          <InnerLink
            key={a}
            icon={media_info_match[a as TMedia]?.icon}
            href={url}
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          />
        )
      }

      return null;
    })}
  </div>)
}

const InnerLink = (props: ComponentProps<'a'> & { icon: string }) => {
  return (<a {...props} className="btn btn-ghost btn-lg bg-base-100 p-0 w-12">
    <img src={`https://image.1st.game/public/social-logo/${props.icon}`} alt=""/>
  </a>)
}
