import { ComponentProps } from "react";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import classNames from "classnames";

type TMedia = 'telegram' |
  'twitter' |
  'facebook' |
  'youtube' |
  'whatsapp' |
  'instagram'

const media_info_match: {
  [key in TMedia]: Record<string, any>
} = {
  'telegram': {
    icon: 'telegram.svg',
    click: (url: string) => {
      window.open(url);
    }
  },
  'twitter': {
    icon: 'twitter.svg',
    click: (url: string) => {
      window.open(url);
    }
  },
  'facebook': {
    icon: 'facebook.svg',
    click: (url: string) => {
      window.open(url);
    }
  },
  'youtube': {
    icon: 'youtube.svg',
    click: (url: string) => {
      window.open(url);
    }
  },
  'whatsapp': {
    icon: 'whatsapp.svg',
    click: (url: string) => {
      window.open(url);
    }
  },
  'instagram': {
    icon: 'instagram.svg',
    click: (url: string) => {
      window.open(url);
    }
  },
}

export const SocialMedia = ({className}:{className?: string}) => {
  const { data: baseConf } = useBaseConfig()
  return (<div className={classNames("flex gap-1.5", className)}>
    {baseConf?.data?.media_links && Object.entries(baseConf?.data?.media_links).map(([a, b]) => {
      if (b) {
        return (
          <InnerButton
            key={a}
            icon={media_info_match[a as TMedia]?.icon}
            onClick={() => media_info_match[a as TMedia]?.click(b)}
          />
        )
      }
    })}
  </div>)
}

const InnerButton = (props: ComponentProps<'button'> & { icon: string }) => {
  return (<button {...props} className="btn btn-ghost btn-lg bg-base-100 p-0 w-12">
    <img src={`https://image.1st.game/public/social-logo/${props.icon}`} alt=""/>
  </button>)
}
