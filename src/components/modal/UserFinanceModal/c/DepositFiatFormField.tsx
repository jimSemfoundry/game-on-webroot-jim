import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { useBoundStore } from "@/store";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { email_reg_exp } from "@/utils/regexp.ts";
import { InputBox } from "@/components/modal/UserFinanceModal/c/InputBox.tsx";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";

export const Email = () => {
  const { t } = useTranslation();

  // from data store, share common data
  const { depositFiat, setDepositFiat } = useBoundStore();

  useEffect(() => {
    setDepositFiat({ email_error: depositFiat.formItem?.email !== "" && !email_reg_exp.test(depositFiat.formItem?.email) });
  }, [depositFiat.formItem?.email]);

  return (
    <div key="email" onClick={(e) => e.stopPropagation()}>
      <InputBox
        type="text"
        label={<RequireItem label={t(`finance:email`)} />}
        value={depositFiat.formItem?.email}
        onChange={(e) => setDepositFiat({ formItem: { email: e.target.value } })}
        placeholder={`${t("finance:enter")} ${t(`finance:email`)}`}
      />
      <ErrorMessageBox
        sample
        show={depositFiat.formItem?.email !== "" && !email_reg_exp.test(depositFiat.formItem?.email)}
        content={t("login:emailError")}
      />
    </div>
  );
};

export const Field = ({ name, field }: { name: string, field: Record<string, any> }) => {
  const { t } = useTranslation();

  // from data store, share common data
  const { depositFiat, setDepositFiat } = useBoundStore();

  return (
    <InputBox
      key={name}
      type={field.type}
      label={<RequireItem label={t(`finance:${field.label}`)} />}
      value={depositFiat.formItem?.[name]}
      onChange={(e) => setDepositFiat({ formItem: { [name]: e.target.value } })}
      placeholder={`${t("finance:enter")} ${t(`finance:${field.label}`)}`}
    />
  );
};
