import { publicService } from "@/services/publicService.ts";
import { useQuery } from "@tanstack/react-query";

export function sleep(seconds = 3_000) {
  return new Promise((resolve) => setTimeout(() => {
    resolve(true);
  }, seconds));
}

export function getAdvertisementParams() {
  let ad_param = "";

  // For RoiBest
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("__rb_") && key.endsWith("_params")) {
      ad_param = localStorage.getItem(key) || "";
      break;
    }
  }

  return {
    fbp: cookie("_fbp") || "",
    fbc: cookie("_fbc") || "",
    pixel_id: import.meta.env.VITE_FACEBOOK_PIXEL_ID || "",
    ad_param
  };
}

export function cookie(name: string) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export function parseURLParamsToJson(uri: string) {
  return Object.fromEntries(new URLSearchParams(decodeURIComponent(uri)).entries());
}

export const auth_themes = {
  google: `linear-gradient(135deg,#4285f4 0%, #ea4335 25%,#fbbc04 50%,#34a853 75%,#4285f4 100%)`
};

export const useSocialList = () => {
  return useQuery({
    queryKey: ['socialList'],
    queryFn: () => publicService.getSocialList(),
    gcTime: 0
  });
};
