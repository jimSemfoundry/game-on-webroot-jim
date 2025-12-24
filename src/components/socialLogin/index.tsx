import { useTranslation } from "react-i18next";
import i18n from "@/i18n.ts";
import { useCallback, useMemo } from "react";
import { useLocation } from "@tanstack/react-router";
import { useSocialList } from "@/components/socialLogin/helper.ts";
import { toUrlSearchParams } from "@/utils/urlSearchParams";

export default function SocialLogin() {
  const { t } = useTranslation();

  const { search } = useLocation();

  // 当前站支持的社媒
  const { data: social } = useSocialList();

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
    {Array.isArray(social?.data) && social?.data?.length > 0 && (<div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <div className="flex-1 h-px bg-gradient-to-r from-base-content/0 to-base-content/10" />
        <span className="whitespace-nowrap uppercase">{t("login:orLoginDirectlyWith")}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-base-content/10 to-base-content/0" />
      </div>

      <div className="flex justify-center gap-2">
        {
          (social?.data ?? []).map((s: { name: string; online_url: string; name_key: string; }) => (
            <SocialButton
              key={s.name}
              name={s.name}
              onClick={() => getAuthLink(s.online_url, s.name_key)}
            />))
        }
      </div>
    </div>)}
  </>;
}

const SocialButton = ({ name, ...props }: React.ComponentProps<"button"> & { name: string }) => {
  return (<button
    {...props}
    key={name}
    className="btn btn-square btn-md md:btn-lg flex items-center justify-center rounded-selector">
    <img src={`/icons/social/${name}.svg`} className="h-5 w-5" alt="" />
  </button>);
};
