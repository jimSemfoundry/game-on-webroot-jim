import { useCallback, useEffect, useMemo } from "react";
import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import i18n from "i18next";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { publicService } from "@/services/publicService.ts";
import { sleep, parseURLParamsToJson, getAdvertisementParams } from "@/components/socialLogin/helper.ts";
import { trackCustomEvent, uuidv4Generate } from "@/utils/helper.ts";
import { getLogoFullUrl } from "@/utils/assetPaths";

const controller = new AbortController();

export const Route = createFileRoute("/_blank/booting/")({
  component: RouteComponent
});

export function RouteComponent() {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { search, hash } = useLocation();

  // 用户信息和信息存储
  const { setUser, setStatus } = useAuth();

  // 解析入参数
  const urlParams = useMemo(() => {
    if (hash && hash.includes("?state=")) {
      return parseURLParamsToJson(hash.split("?")[1]);
    }

    return search;
  }, [hash, search]);

  // 当前登录社媒的类型，从链接参数解析得到
  const authType = useMemo(() => {
    const searchParams = new URLSearchParams(atob(urlParams?.state ?? ""));

    return searchParams.get("auth_type");
  }, [urlParams]);

  const googleAuth = useCallback(async () => {
    // link携带的必要参数 state（经过 atob 处理）
    if (!urlParams?.state) return;

    // link携带的必要参数 state（经过 atob 处理）需解码（atob）处理
    const searchParams = new URLSearchParams(atob(urlParams.state));

    // 区分是哪个社媒来登录
    const auth_type = searchParams.get("auth_type");

    // 区分是哪个社媒来登录，是否是google
    if (auth_type !== "google") return;

    // google auth return code
    const code = searchParams.get("code");

    // 广告参数
    const startapp = localStorage.getItem("startapp") ?? "";

    // auth站地址
    const redirect_uri = searchParams.get("redirect_uri");

    // 设备指纹
    const device_id = uuidv4Generate();

    // 不能缺少必要参数
    if (!code || !redirect_uri || !device_id) return toast.error(t("toast:signInFailed"));

    // 获取广告推广参数
    const adParams = getAdvertisementParams();

    // 延长联动效果窗口
    await sleep();

    // google auth login
    publicService.loginByGoogle({
        code,
        startapp,
        device_id,
        redirect_uri,
        ...adParams
      },
      controller.signal,
      {
        "Accept-Language": i18n.language || "en"
      })
      .then((res) => {
        if (res.code === 0) {
          toast.success(t("toast:signInSuccess"));

          // 存储用户信息
          setUser(res.user);
          setStatus(res.status);
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("username", res.data.username);
          localStorage.setItem("user", JSON.stringify(res?.user));
          localStorage.setItem("status", JSON.stringify(res?.status));

          void navigate({
            to: "/casino",
            search: { openLogin: undefined, openSignUp: undefined, redirect: undefined, startapp: undefined, openFinance: undefined }
          });

          // GTM 记录推送
          trackCustomEvent('login', 'userLogin', {
            id: res?.user?.id,
            username: res?.user?.username,
            nick_name: res?.user?.nickname,
            country: res?.user?.country
          })
        } else {
          toast.error(t("toast:signInFailed"));
        }
      })
      .catch(() => {
        toast.error(t("toast:signInFailed"));
      });

  }, [search, i18n.language, urlParams]);

  const facebookAuth = useCallback(async () => {
    const parsedParams = urlParams;

    // link携带的必要参数 state（经过 atob 处理）
    if (!parsedParams?.state) return;

    // link携带的必要参数 state（经过 atob 处理）需解码（atob）处理
    const searchParams = new URLSearchParams(atob(parsedParams.state));

    // 区分是哪个社媒来登录
    const auth_type = searchParams.get("auth_type");

    // 区分是哪个社媒来登录，是否是google
    if (auth_type !== "facebook") return;

    // google auth return code
    const code = searchParams.get("code");

    // 广告参数
    const startapp = localStorage.getItem("startapp") ?? "";

    // auth站地址
    const redirect_uri = searchParams.get("redirect_uri");

    // 设备指纹
    const device_id = uuidv4Generate();

    // 不能缺少必要参数
    if (!code || !redirect_uri || !device_id) return toast.error(t("toast:signInFailed"));

    // 获取广告推广参数
    const adParams = getAdvertisementParams();

    // 延长联动效果窗口
    await sleep();

    // facebook auth login
    publicService.loginByFacebook({
        code,
        startapp,
        device_id,
        redirect_uri,
        ...adParams
      },
      controller.signal,
      {
        "Accept-Language": i18n.language || "en"
      })
      .then((res) => {
        if (res.code === 0) {
          toast.success(t("toast:signInSuccess"));

          // 存储用户信息
          setUser(res.user);
          setStatus(res.status);
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("username", res.data.username);

          navigate({ to: "/casino", search: { openLogin: undefined, openSignUp: undefined, redirect: undefined, startapp: undefined, openFinance: undefined } });
        } else {
          toast.error(t("toast:signInFailed"));
        }
      })
      .catch(() => {
        toast.error(t("toast:signInFailed"));
      });

  }, [search, i18n.language, urlParams]);

  useEffect(() => {
    // For Google Auth
    void googleAuth();

    // For Facebook
    void facebookAuth();

    // For Twitter

    // For Telegram
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col gap-4 items-center justify-center p-1 rounded-2xl w-full max-w-[90%] md:w-80"
        // style={{ background: `${auth_themes["google"]}` }}
      >
        <div className={"w-full py-6 md:p-6 flex flex-col justify-center bg-base-400/80 rounded-2xl"}>
          <div
            className="flex flex-col gap-6 mb-6">
            {/* 站点的标志性图标 */}
            <img src={getLogoFullUrl(import.meta.env.VITE_THEME ?? "1stgame")} className="h-8" alt="" />
            {/* 当前社媒图标 */}
            <AuthIcon authType={authType} />
          </div>
          <div className="text-center">
            <button
              className="btn btn-soft btn-sm"
              onClick={() => {
                controller.abort(); // 主动取消social login请求
                void navigate({
                  to: "/casino",
                  search: { openLogin: undefined, openSignUp: undefined, redirect: undefined, startapp: undefined, openFinance: undefined }
                });
              }}>
              {t("common.cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const AuthIcon = ({ authType }: { authType: string | null }) => (
  <div className="relative flex justify-center">
    <img src={`/icons/social/${authType}.svg`}
         className="h-10 absolute top-[50%] translate-y-[-50%]"
         alt="" /><span
    className="loading loading-circle text-primary w-15 h-15" /></div>);
