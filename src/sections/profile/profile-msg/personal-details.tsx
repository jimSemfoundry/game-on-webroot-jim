import Iconify from "@/components/iconify";
import { YearMonthDay } from "./year-month-day";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PhoneEmailInput } from "./PhoneEmailInput";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import countriesminified from "@/json/countriesminified.json";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { QueryKycDetail, useCurrentUser } from "@/hooks/api/useAuth";
import { email_reg_exp } from "@/utils/regexp";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { KycDetail } from "@/types/profile";
import { authService } from "@/services/authService";

export function PersonalDetails() {

  const { t } = useTranslation();
  const { user } = useAuth();
  const { refetch } = useCurrentUser();

  const { data } = QueryKycDetail();

  const [status, setStatus] = useState<KycDetail>(  {
    id: 0,
    team_id: 0,
    user_id: 0,
    first_name: '',
    middle_name: '',
    last_name: '',
    birthday: '',
    country: '',
    state: '',
    city: '',
    address: '',
    zip_code: '',
    document_type: 0,
    document_url: '',
    status: 0,
    created_at: 0,
    updated_at: 0,
    email: '',
    nickname: '',
    phone: '',
  });

  useEffect(() => {
    if (data) {
      setStatus((v) => ({ ...v, ...data }));
    }
  }, [data]);

  const nickname_error = useMemo(() => status.nickname !== "" && !/^[A-Za-z_][A-Za-z0-9_]{5,15}$/.test(status.nickname), [status.nickname]);
  const email_format_error = useMemo(() => status.email !== "" && !email_reg_exp.test(status.email), [status.email]);
  // const first_name_error = useMemo(() => status.first_name !== "" && !/^[A-Za-z0-9]$/.test(status.first_name), [status.first_name]);
  // const last_name_error = useMemo(() => status.last_name !== "" && !/^[A-Za-z0-9]$/.test(status.last_name), [status.last_name]);
  // const phone_format_error = useMemo(() => {
  //   return status.phone !== "" && status.country !== "" && !isValidPhoneNumber(status.phone, status.country as Country);
  // }, [status.phone, status.country]);

  const [isResetUsernameValid, setIsResetUsernameValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const handle = () => {
    setLoading(true);

    authService.updateKyc(status).then((res) => {
      if (res.code === 0) {
        void refetch();
        toast.success(t("toast:editSuccess"));
      } else {
        toast.error(t("toast:editError"));
      }
    }).finally(() => {
      setLoading(false);
    });
  };

  // 设置默认数据
  useEffect(() => {
    if (user?.nickname) setStatus((v) => ({ ...v, nickname: user?.nickname }));
  }, [user?.nickname]);

  // Memoize the onChange function to prevent infinite re-renders
  const handleDateChange = useCallback((date: { day: string, month: string, year: string }) => {
    setStatus((v) => ({ ...v, birthday: date.year + '-' + date.month + '-' + date.day }));
  }, []);

  return (
    <div className="rounded-field bg-base-200 p-3 w-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Iconify icon='custom:recent-top' className='text-primary' />
        <h3 className="text-sm font-semibold sm:text-lg">Personal details</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {/* <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold sm:text-base">Email</h4>
          <input type="text"
            className="input bg-base-300 w-full border-0 !outline-0 font-semibold px-4 h-12"
            placeholder="Enter Email" />
        </div> */}
        <fieldset className="fieldset">
          <h4 className="text-xs font-semibold sm:text-base">Email</h4>
          <input
            type="text"
            value={status.email}
            placeholder="Enter Email"
            onChange={(e) => {
              setStatus((v) => ({ ...v, email: e.target.value }));
            }}
            className={"input bg-base-300 w-full border-0 !outline-0 font-semibold px-4 h-12"}
          />
          <ErrorMessageBox
            show={email_format_error}
            content={t("login:emailError")}
          />
        </fieldset>
        <fieldset className="fieldset">
          <h4 className="text-xs font-semibold sm:text-base">Nickname</h4>
          <input
            type="text"
            value={status.nickname}
            placeholder="Enter Nickname"
            onChange={(e) => {
              setStatus((v) => ({ ...v, nickname: e.target.value }));
            }}
            className="input bg-base-300 w-full border-0 !outline-0 font-semibold px-4 h-12"
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

        <fieldset className="fieldset">
          <h4 className="text-xs font-semibold sm:text-base">First Name</h4>
          <input
            type="text"
            value={status.first_name}
            placeholder="Enter"
            onChange={(e) => {
              setStatus((v) => ({ ...v, first_name: e.target.value }));
            }}
            className="input bg-base-300 w-full border-0 !outline-0 font-semibold px-4 h-12"
          />
          {/* <ErrorMessageBox
            show={first_name_error}
            content={<>Can only contain letters, numbers.</>} /> */}
        </fieldset>

        <fieldset className="fieldset">
          <h4 className="text-xs font-semibold sm:text-base">Last Name</h4>
          <input
            type="text"
            value={status.last_name}
            placeholder="Enter"
            onChange={(e) => {
              setStatus((v) => ({ ...v, last_name: e.target.value }));
            }}
            className="input bg-base-300 w-full border-0 !outline-0 font-semibold px-4 h-12"
          />
          {/* <ErrorMessageBox
            show={last_name_error}
            content={<>Can only contain letters, numbers.</>} /> */}
        </fieldset>

        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold sm:text-base">Date of Birth</h4>

          <div className="flex items-center gap-2">
            <YearMonthDay onChange={handleDateChange} value={{ day: status?.birthday?.split('-')[2] || '', month: status?.birthday?.split('-')[1] || '', year: status?.birthday?.split('-')[0] || '' }} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold sm:text-base">Phone number</h4>

          <div>
            <PhoneEmailInput
              value={status.phone}
              onChange={(value) => setStatus((old) => ({
                ...old,
                phone: value
              }))}
              onChangeCountryCallingCode={(value) => console.log(value)}
              onValidationChange={useCallback((isValid: boolean) => setIsResetUsernameValid(isValid), [])}
              ref={useRef<HTMLInputElement>(null)} mode="phone" />
            <ErrorMessageBox
              show={!isResetUsernameValid}
              content={<>手机号码格式错误</>} />
          </div>
        </div>

        <fieldset className="fieldset">
          <h4 className="text-xs font-semibold sm:text-base">Country</h4>

          <SelectDropdown
            title="Country"
            height="sm"
            options={countriesminified.map((country: any) => ({
              id: country.id,
              value: country.iso2,
              label: country.name,
              iso2: country.iso2
            }))}
            renderOption={(option: any) => (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4">
                  <img src={`/images/country-flags/${option.iso2.toLowerCase()}.svg`} className="object-cover" />
                </div>
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            )}
            renderValue={(option: any) => (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4">
                  <img src={`/images/country-flags/${option.iso2.toLowerCase()}.svg`} className="object-cover" />
                </div>
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            )}
            value={status.country}
            onChange={(_value: string | number, option: any) => {
              setStatus((old) => ({
                ...old,
                country: option.iso2
              }));
            }}
            placeholder="Select Country"
            buttonClassName="bg-base-300 border-0 hover:bg-base-300 h-12"
            showSearch
          />
          {/* <input type="text"
            className="input bg-base-300 w-full border-0 !outline-0 font-semibold px-4 h-12"
            placeholder="Select Country" /> */}
        </fieldset>

        <fieldset className="fieldset">
          <h4 className="text-xs font-semibold sm:text-base">City</h4>
          <input
            type="text"
            value={status.city}
            placeholder="Select City"
            onChange={(e) => {
              setStatus((v) => ({ ...v, city: e.target.value }));
            }}
            className="input bg-base-300 w-full border-0 !outline-0 font-semibold px-4 h-12"
          />
        </fieldset>

        <fieldset className="fieldset sm:col-span-2">
          <h4 className="text-xs font-semibold sm:text-base">Address</h4>
          <div className="relative">
            <input
              type="text"
              value={status.address}
              placeholder="Enter Address"
              onChange={(e) => {
                setStatus((v) => ({ ...v, address: e.target.value }));
              }}
              className="input bg-base-300 w-full border-0 !outline-0 font-semibold px-4 h-12"
            />
          </div>
        </fieldset>
      </div>

      <ConfirmBox
        className={'btn btn-primary h-10 sm:h-12 w-[139px] self-end'}
        loading={loading} onClick={handle}>
        {t("common.save")}
      </ConfirmBox>
    </div>
  )
}
