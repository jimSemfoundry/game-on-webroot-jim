import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { Card } from "@/sections/profile/c/Card.tsx";
import Iconify from "@/components/iconify";
import { useCurrentUser } from "@/hooks/api/useAuth.ts";
import { authService } from "@/services/authService.ts";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { email_reg_exp } from "@/utils/regexp.ts";
import { PhoneAreaCodeSelect } from "@/sections/profile/security/PhoneAreaCodeSelect.tsx";
import { useCountryCodeByIp } from "@/sections/profile/security/helper.ts";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Country } from "react-phone-number-input/min";
import { CountryCodeSelect } from "@/sections/profile/settings/CountryCodeSelect.tsx";
import { DayPicker } from "react-day-picker";
import classNames from "classnames";

export function Personal({ className }:{ className?: string }) {
  const { t } = useTranslation();

  const { user } = useAuth();

  const { refetch } = useCurrentUser();

  /**
   * 当前用户IP对应的地区
   */
  const { data: defaultCode, isLoading: ipLoading } = useCountryCodeByIp();

  const [status, setStatus] = useState<{
    loading: boolean
    date: Date | undefined
    city: string
    email: string
    address: string
    nickname: string
    last_name: string
    first_name: string
    phone: string,
    country: string,
    country_code: string,
    opt_code: string,
  }>({
    loading: false,
    date: undefined,
    city: "",
    email: "",
    address: "",
    nickname: "",
    last_name: "",
    first_name: "",
    phone: "",
    opt_code: "",
    country: "",
    country_code: ""
  });

  const nickname_error = useMemo(() => status.nickname !== "" && !/^[A-Za-z_][A-Za-z0-9_]{5,15}$/.test(status.nickname), [status.nickname]);
  const email_format_error = useMemo(() => status.email !== "" && !email_reg_exp.test(status.email), [status.email]);
  const first_name_error = useMemo(() => status.first_name !== "" && !/^[A-Za-z0-9]$/.test(status.first_name), [status.first_name]);
  const last_name_error = useMemo(() => status.last_name !== "" && !/^[A-Za-z0-9]$/.test(status.last_name), [status.last_name]);
  const phone_format_error = useMemo(() => {
    return status.phone !== "" && status.country !== "" && !isValidPhoneNumber(status.phone, status.country as Country);
  }, [status.phone, status.country]);

  const handle = () => {
    setStatus((v) => ({ ...v, loading: true }));

    authService.updateUser({
      nickname: status.nickname
    })
      .then((res) => {
        if (res.code === 0) {
          void refetch();
          toast.success(t("toast:editSuccess"));
        } else {
          toast.error(t("toast:editError"));
        }
      })
      .finally(() => {
        setStatus((v) => ({ ...v, loading: false }));
      });
  };

  // 设置默认数据
  useEffect(() => {
    if (user?.nickname) setStatus((v) => ({ ...v, nickname: user?.nickname }));
  }, [user?.nickname]);

  return (
    <Card
      className={classNames("md:p-6 md:gap-4 mx-5 md:mx-0", className)} title={"Personal Details"}
      icon={<Iconify icon="custom:user" className="text-primary" />}>
      <div className="flex w-full flex-col items-center gap-3">
        <div className={`
        flex w-full flex-col gap-2 font-semibold text-base-content/50
        md:grid md:grid-cols-2 md:gap-4
        `}>

          {/* Personal Details - Email */}
          <fieldset className="fieldset">
            <h4 className="text-xs text-base-content">Email</h4>
            <input
              type="text"
              value={status.email}
              placeholder="Enter"
              onChange={(e) => {
                setStatus((v) => ({ ...v, email: e.target.value }));
              }}
              className={"input w-full rounded-md px-4 text-sm bg-base-300 border-none !outline-none"}
            />
            <ErrorMessageBox
              show={email_format_error}
              content={t("login:emailError")}
            />
          </fieldset>

          {/* Personal Details - Nickname */}
          <fieldset className="fieldset">
            <h4 className="text-xs text-base-content">Nickname</h4>
            <input
              type="text"
              value={status.nickname}
              placeholder="Enter"
              onChange={(e) => {
                setStatus((v) => ({ ...v, nickname: e.target.value }));
              }}
              className={"input w-full rounded-md px-4 text-sm bg-base-300 border-none !outline-none"}
              maxLength={16}
              minLength={6}
            />
            <ErrorMessageBox
              show={nickname_error}
              content={<>
                {t("profile:nicknameIsRequired")}<br />Can only contain letters, numbers, and underscores, and cannot
                start with a number
              </>} />
          </fieldset>

          {/* Personal Details - First Name */}
          <fieldset className="fieldset">
            <h4 className="text-xs text-base-content">First Name</h4>
            <input
              type="text"
              value={status.first_name}
              placeholder="Enter"
              onChange={(e) => {
                setStatus((v) => ({ ...v, first_name: e.target.value }));
              }}
              className={"input w-full rounded-md px-4 text-sm bg-base-300 border-none !outline-none"}
            />
            <ErrorMessageBox
              show={first_name_error}
              content={<>Can only contain letters, numbers.</>} />
          </fieldset>

          {/* Personal Details - Last Name */}
          <fieldset className="fieldset">
            <h4 className="text-xs text-base-content">Last Name</h4>
            <input
              type="text"
              value={status.last_name}
              placeholder="Enter"
              onChange={(e) => {
                setStatus((v) => ({ ...v, last_name: e.target.value }));
              }}
              className={"input w-full rounded-md px-4 text-sm bg-base-300 border-none !outline-none"}
            />
            <ErrorMessageBox
              show={last_name_error}
              content={<>Can only contain letters, numbers.</>} />
          </fieldset>

          {/* Personal Details - Birth Date */}
          <fieldset className="fieldset">
            <h4 className="text-xs text-base-content">Date of Birth</h4>
            <button popoverTarget="rdp-popover" className="btn bg-base-300 btn-md justify-start"
                    style={{ anchorName: "--rdp" } as CSSProperties}>
              {status.date ? status.date.toLocaleDateString() :
                <span className={"text-base-content/50"}>Pick a date</span>}
            </button>
            <div popover="auto" id="rdp-popover" className="dropdown rounded-lg top-1"
                 style={{ positionAnchor: "--rdp" } as CSSProperties}>
              <DayPicker
                className="react-day-picker rounded-lg"
                mode="single"
                selected={status.date}
                onSelect={(d) => {
                  setStatus((v) => ({ ...v, date: d }));
                }} />
            </div>
          </fieldset>

          {/* Personal Details - Phone Number */}
          <fieldset className="fieldset">
            <h4 className="text-xs text-base-content">Phone Number</h4>
            <PhoneAreaCodeSelect
              loading={ipLoading}
              defaultCode={defaultCode?.data?.country_code}
              onPhoneChange={(v) => {
                setStatus((old) => ({
                  ...old,
                  phone: v
                }));
              }}
              onCodeChange={(v) => {
                setStatus((old) => ({
                  ...old,
                  country: v
                }));
              }}
            />
            <ErrorMessageBox
              show={phone_format_error}
              content={<>手机号码格式错误</>} />
          </fieldset>

          {/* Personal Details - Country */}
          <fieldset className="fieldset">
            <h4 className="text-xs text-base-content">Country</h4>
            <CountryCodeSelect
              loading={ipLoading}
              defaultCode={defaultCode?.data?.country_code}
              onCodeChange={(v) => {
                setStatus((old) => ({
                  ...old,
                  country: v
                }));
              }}
            />
          </fieldset>

          {/* Personal Details - City */}
          <fieldset className="fieldset">
            <h4 className="text-xs text-base-content">City</h4>
            <input
              type="text"
              value={status.city}
              placeholder="Enter"
              onChange={(e) => {
                setStatus((v) => ({ ...v, city: e.target.value }));
              }}
              className={"input w-full rounded-md px-4 text-sm bg-base-300 border-none !outline-none"}
            />
          </fieldset>

          {/* Personal Details - Address */}
          <fieldset className="fieldset">
            <h4 className="text-xs text-base-content">Address</h4>
            <div className="relative">
              <input
                type="text"
                value={status.address}
                placeholder="Enter"
                onChange={(e) => {
                  setStatus((v) => ({ ...v, address: e.target.value }));
                }}
                className={"input w-full rounded-md px-4 text-sm bg-base-300 border-none !outline-none"}
              />
            </div>
          </fieldset>
        </div>

        <ConfirmBox
          className={'md:w-auto md:ml-auto md:px-10'}
          disabled={true}
          loading={status.loading} onClick={handle}>
          {t("common.save")}
        </ConfirmBox>
      </div>
    </Card>
  );
}
