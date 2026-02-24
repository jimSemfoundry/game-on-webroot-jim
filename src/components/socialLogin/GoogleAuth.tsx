import { useTranslation } from "react-i18next";
import i18n from "@/i18n.ts";
import { useCallback, useMemo } from "react";
import { useLocation } from "@tanstack/react-router";
import { useSocialList } from "@/components/socialLogin/helper.ts";
import { toUrlSearchParams } from "@/utils/urlSearchParams";

export default function GoogleAuth({ enabled }: {
  enabled?: boolean,
}) {
  const { search } = useLocation();

  // 当前站支持的社媒
  const { data: social } = useSocialList(enabled);

  const params = useMemo(() => {
    let baseParams: Record<string, any> = {
      locale: i18n.language || "en",
      service: import.meta.env.VITE_API_URL?.replace("/api", ""),
      redirect_uri: location.origin
    };

    const model = import.meta.env.VITE_PROMOTION_MODEL;
    const appid = import.meta.env.VITE_FOLDER;

    const startapp = toUrlSearchParams(search).get("startapp");

    // For RoiBest
    if (appid && model === "roibest") {
      baseParams = { ...baseParams, appid };
    }

    // For Referral Link
    if (startapp) {
      baseParams = { ...baseParams, startapp };
    }

    return baseParams;
  }, [search, i18n.language]);

  // social login website
  const getAuthLink = useCallback((url: string, auth_type: string) => {
    const searchParams = new URLSearchParams({ ...params, auth_type });
    window.location.href = `${url}?${searchParams}`;
  }, [params]);

  return <>
    {Array.isArray(social?.data) &&
      social?.data?.length > 0 &&
      social.data.map((s: {
        name: string;
        online_url: string;
        name_key: string;
      }) => {
        if (s?.name_key === "google")
          return (
            <SocialButton
              key={s.name}
              name={s.name}
              onClick={() => getAuthLink(s.online_url, s.name_key)}
            />);
      })}
  </>;
}

const SocialButton = ({ name, ...props }: React.ComponentProps<"button"> & { name: string }) => {
  const { t } = useTranslation();
  return (<button
    {...props}
    key={name}
    className="btn btn-md btn-primary font-bold px-2.5 tracking-tighter">
    {t("login:signInWith")}<img src={`/icons/social/${name}.svg`} className="h-6 w-6" alt="" />
  </button>);
};
