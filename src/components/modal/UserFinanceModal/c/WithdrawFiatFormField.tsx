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
  const { withdrawFiat, setWithdrawFiat } = useBoundStore();

  useEffect(() => {
    setWithdrawFiat({ email_error: withdrawFiat.formItem?.email !== "" && !email_reg_exp.test(withdrawFiat.formItem?.email) });
  }, [withdrawFiat.formItem?.email]);

  return (
    <div key="email" onClick={(e) => e.stopPropagation()}>
      <InputBox
        type="text"
        label={<RequireItem label={t(`finance:email`)} />}
        value={withdrawFiat.formItem?.email}
        onChange={(e) => setWithdrawFiat({ formItem: { email: e.target.value } })}
        placeholder={`${t("finance:enter")} ${t(`finance:email`)}`}
      />
      <ErrorMessageBox
        sample
        show={withdrawFiat.formItem?.email !== "" && !email_reg_exp.test(withdrawFiat.formItem?.email)}
        content={t("login:emailError")}
      />
    </div>
  );
};

export const Field = ({ name, field }: { name: string, field: Record<string, any> }) => {
  const { t } = useTranslation();

  // from data store, share common data
  const { withdrawFiat, setWithdrawFiat } = useBoundStore();

  return (
    <InputBox
      key={name}
      type={field.type}
      label={<RequireItem label={t(`finance:${field.label}`)} />}
      value={withdrawFiat.formItem?.[name]}
      onChange={(e) => setWithdrawFiat({ formItem: { [name]: e.target.value } })}
      placeholder={`${t("finance:enter")} ${t(`finance:${field.label}`)}`}
    />
  );
};
