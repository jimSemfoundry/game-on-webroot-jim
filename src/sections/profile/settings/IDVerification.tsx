import Iconify from "@/components/iconify";
import { useTranslation } from "react-i18next";

export function IDVerification() {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-lg mx-4"
      style={{
        background:
          "radial-gradient(141.2% 102.86% at 8.36% -4.57%, color(display-p3 0.7086 0.9316 0.0953 / 0.53) 0%, color(display-p3 0.0941 0.1137 0.1412 / 0.00) 56.25%), var(--d-color-base-200, color(display-p3 0.0941 0.1137 0.1412))",
      }}
    >
      <div className={"flex items-center gap-4"}>
        <img src={"/images/profile/id-verification.png"} alt="" />
        <div>
          <h4 className={"font-semibold"}>{t("profile:idVerification")}</h4>
          <p className={"text-base-content/80 text-sm"}>{t("profile:idVerificationDescription1")}</p>
        </div>
      </div>
      <button className={"btn btn-primary btn-md"}>{t("common:common.verify")}</button>
      <div
        className={"flex items-center gap-4 rounded-lg p-4"}
        style={{
          background: "color(display-p3 1 0.7451 0 / 0.10)",
        }}
      >
        <Iconify icon={"custom:warning"} className="w-5 h-5 text-warning" />
        <p className={"text-sm flex-1"}>
          {t("profile:idVerificationDescription2")}
        </p>
      </div>
    </div>
  );
}
