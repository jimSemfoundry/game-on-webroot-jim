import { CSSProperties, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card } from "@/sections/profile/c/Card.tsx";
import Iconify from "@/components/iconify";
import { QueryKycDetail } from "@/hooks/api/useAuth.ts";
import { authService } from "@/services/authService.ts";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { email_reg_exp } from "@/utils/regexp.ts";
import { PhoneAreaCodeSelect } from "@/sections/profile/security/PhoneAreaCodeSelect.tsx";
import { useCountryCodeByIp } from "@/sections/profile/security/helper.ts";
import { CountryCodeSelect } from "@/sections/profile/settings/CountryCodeSelect.tsx";
import { DayPicker } from "react-day-picker";
import clsx from "clsx";

interface IStatus {
  loading: boolean
  city: string
  email: string
  address: string
  birthday: Date | undefined
  nickname: string
  last_name: string
  first_name: string
  middle_name: string
  phone: string,
  country: string,
  country_code: string,
}

const initStatus = {
  loading: false,
  city: "",
  email: "",
  phone: "",
  country: "",
  address: "",
  birthday: undefined,
  nickname: "",
  last_name: "",
  first_name: "",
  middle_name: "",
  country_code: ""
};

export function Personal({ className }: { className?: string }) {
  const { t } = useTranslation('profile');

  const { data, refetch } = QueryKycDetail();

  // 当前用户IP对应的地区
  const { data: defaultCode, isLoading: ipLoading } = useCountryCodeByIp();

  const [status, setStatus] = useState<IStatus>(initStatus);

  const nickname_error = useMemo(() => status.nickname !== "" && !/^[A-Za-z_][A-Za-z0-9_]{5,15}$/.test(status.nickname), [status.nickname]);
  const last_name_error = useMemo(() => status.last_name !== "" && !/^[A-Za-z0-9]$/.test(status.last_name), [status.last_name]);
  const first_name_error = useMemo(() => status.first_name !== "" && !/^[A-Za-z0-9]$/.test(status.first_name), [status.first_name]);
  const email_format_error = useMemo(() => status.email !== "" && !email_reg_exp.test(status.email), [status.email]);
  const phone_format_error = useMemo(() => status.phone !== "" && !/^[1-9]\d{6,14}$/.test(status.phone), [status.phone]);

  const disabled = useMemo(() => {
    return (status.nickname === "" ||
      status.city === "" ||
      status.email === "" ||
      status.phone === "" ||
      status.country === "" ||
      status.address === "" ||
      status.birthday === undefined ||
      status.last_name === "" ||
      status.first_name === "" ||

      data.nickname === status.nickname ||
      data.city === status.city ||
      data.email === status.email ||
      data.phone === status.phone ||
      data.country === status.country ||
      data.address === status.address ||
      // data.birthday === status.birthday ||
      data.last_name === status.last_name ||
      data.first_name === status.first_name ||

      nickname_error ||
      last_name_error ||
      first_name_error ||
      email_format_error ||
      phone_format_error);
  }, [
    nickname_error,
    last_name_error,
    first_name_error,
    email_format_error,
    phone_format_error
  ]);

  const handle = () => {
    setStatus((v) => ({ ...v, loading: true }));

    authService.updateKyc(status)
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

  return (
    <Card
      className={clsx("md:p-6 md:gap-4 mx-5 md:mx-0", className)} title={"Personal Details"}
      icon={<Iconify icon="custom:user" className="text-primary" />}>
      <div className="flex w-full flex-col items-center gap-3">
        <div className={`
        flex w-full flex-col gap-2 font-semibold text-base-content/50
        md:grid md:grid-cols-2 md:gap-4
        `}>

          {/* Personal Details - Email */}
          <fieldset className="fieldset">
            <h4>Email</h4>
            <input
              type="text"
              value={status.email || data.email}
              placeholder="Enter"
              onChange={(e) => {
                setStatus((v) => ({ ...v, email: e.target.value }));
              }}
              className={"input w-full rounded-md px-4 text-sm bg-base-300 border-none !outline-none text-white"}
            />
            <ErrorMessageBox
              show={email_format_error}
              content={t("login:emailError")}
            />
          </fieldset>

          {/* Personal Details - Nickname */}
          <fieldset className="fieldset">
            <h4>Nickname</h4>
            <input
              type="text"
              value={status.nickname}
              placeholder="Enter"
              onChange={(e) => {
                setStatus((v) => ({ ...v, nickname: e.target.value }));
              }}
              className={"input w-full rounded-md px-4 text-sm bg-base-300 border-none !outline-none text-white"}
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
            <h4>First Name</h4>
            <input
              type="text"
              value={status.first_name || data?.first_name}
              placeholder="Enter"
              onChange={(e) => {
                setStatus((v) => ({ ...v, first_name: e.target.value }));
              }}
              className={"input w-full rounded-md px-4 text-sm bg-base-300 border-none !outline-none text-white"}
            />
            <ErrorMessageBox
              show={first_name_error}
              content={<>Can only contain letters, numbers.</>} />
          </fieldset>

          {/* Personal Details - Last Name */}
          <fieldset className="fieldset">
            <h4>Last Name</h4>
            <input
              type="text"
              value={status.last_name || data?.last_name}
              placeholder="Enter"
              onChange={(e) => {
                setStatus((v) => ({ ...v, last_name: e.target.value }));
              }}
              className={"input w-full rounded-md px-4 text-sm bg-base-300 border-none !outline-none text-white"}
            />
            <ErrorMessageBox
              show={last_name_error}
              content={<>Can only contain letters, numbers.</>} />
          </fieldset>

          {/* Personal Details - Birth Date */}
          <fieldset className="fieldset">
            <h4>Date of Birth</h4>
            <button popoverTarget="rdp-popover" className="btn bg-base-300 btn-md justify-start"
                    style={{ anchorName: "--rdp" } as CSSProperties}>
              {status.birthday ? status.birthday.toLocaleDateString() :
                <span className={"text-base-content/50"}>Pick a date</span>}
            </button>
            <div popover="auto" id="rdp-popover" className="dropdown rounded-lg top-1"
                 style={{ positionAnchor: "--rdp" } as CSSProperties}>
              <DayPicker
                className="react-day-picker rounded-lg text-white"
                mode="single"
                selected={status.birthday || new Date(data?.birthday)}
                onSelect={(d) => {
                  setStatus((v) => ({ ...v, date: d }));
                }} />
            </div>
          </fieldset>

          {/* Personal Details - Phone Number */}
          <fieldset className="fieldset">
            <h4>Phone Number</h4>
            <PhoneAreaCodeSelect
              loading={ipLoading}
              defaultValue={data?.phone}
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
              content={<>Invalid phone number format.</>} />
          </fieldset>

          {/* Personal Details - Country */}
          <fieldset className="fieldset">
            <h4>Country</h4>
            <CountryCodeSelect
              loading={ipLoading}
              defaultCode={data?.country || defaultCode?.data?.country_code}
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
            <h4>City</h4>
            <input
              type="text"
              value={status.city || data?.city}
              placeholder="Enter"
              onChange={(e) => {
                setStatus((v) => ({ ...v, city: e.target.value }));
              }}
              className={"input w-full rounded-md px-4 text-sm bg-base-300 border-none !outline-none text-white"}
            />
          </fieldset>

          {/* Personal Details - Address */}
          <fieldset className="fieldset">
            <h4>Address</h4>
            <div className="relative">
              <input
                type="text"
                value={status.address || data?.address}
                placeholder="Enter"
                onChange={(e) => {
                  setStatus((v) => ({ ...v, address: e.target.value }));
                }}
                className={"input w-full rounded-md px-4 text-sm bg-base-300 border-none !outline-none  text-white"}
              />
            </div>
          </fieldset>
        </div>

        <ConfirmBox
          disabled={disabled}
          className={"md:w-auto md:ml-auto md:px-10"}
          loading={status.loading} onClick={handle}>
          {t("common:common.save")}
        </ConfirmBox>
      </div>
    </Card>
  );
}
