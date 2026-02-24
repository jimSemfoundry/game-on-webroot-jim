import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import {
  useSupportedCryptoWithdrawGatewaysFilter, validateAddress
} from "@/components/modal/UserFinanceModal/helper.ts";
import { Modal } from "@/components/ui/Modal.tsx";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { AUTH_QUERY_KEYS, useUserWithdrawWallet } from "@/hooks/api/useAuth.ts";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";

interface ISelectedOption {
  network: string;
  address: string;
  name: string;
  loading: boolean;
  showModal: boolean;
}

const initSelected = {
  name: "",
  network: "",
  address: "",
  loading: false,
  showModal: false
};

export const WithdrawAddressAddModal = () => {
  // 服务于数据更新
  const queryClient = useQueryClient();

  const { t } = useTranslation();

  const [status, setStatus] = useState<ISelectedOption>(initSelected);

  // from data store, share common data
  const { withdrawCrypto, syncAction } = useBoundStore();

  // 用户钱包地址列表
  // useUserWithdrawWallet的第二个参数@effect是标记只为本组件服务，不影响外围数据
  // 本组件中有自己的网络选择，要查询用户有多少地址
  const { data: wallets, isLoading } = useUserWithdrawWallet(status.network, true);

  // 币种支持提款的链
  const [l1, , networks] = useSupportedCryptoWithdrawGatewaysFilter(withdrawCrypto.currency?.currency);

  const isError1 = useMemo(() => {
    return !status.network || !status.name || !status.address;
  }, [status.network, status.name, status.address]);

  // 验证各个链的地址是否合法
  const isError2 = useMemo(() => {
    if (status.network && status.address) return !validateAddress(status.network, status.address);
    return false;
  }, [status.address, status.network]);

  // 添加钱包地址
  const submit = useCallback(async () => {
    setStatus((v) => ({ ...v, loading: true }));
    authService
      .addUserWithdrawWallet(status)
      .then((res) => {
        if ([200, 0].includes(res.code)) {
          // 更新用户目标链的钱包地址
          void queryClient.refetchQueries({ queryKey: [...AUTH_QUERY_KEYS.userWithdrawWallet, withdrawCrypto.network?.network, false] }); // 更新用户钱包地址列表

          toast.success(t("toast:walletAddressAddedSuccessfully"));

          setStatus((v) => ({ ...v, showModal: false, name: "", address: "" }));
        } else if (res.code === 1) {
          toast.error(t("finance:repeat_address_added"));
        } else if (res.code === 4) {
          toast.error(t("finance:address_failed_validation"));
        } else {
          toast.error(t("toast:failedToAddAddress"));
        }
      })
      .catch(() => {
        toast.error(t("toast:failedToAddAddress"));
        setStatus((v) => ({ ...v, loading: false }));
      })
      .finally(() => {
        setStatus((v) => ({ ...v, loading: false }));
      });
  }, [status]);

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "OPEN_WITHDRAW_ADDRESS_ADD_MODAL") setStatus((v) => ({ ...v, showModal: true }));
  }, [syncAction]);

  // 设置网络默认值 & 设置地址名称默认值
  useEffect(() => {
    if (withdrawCrypto && status.showModal)
      setStatus((old) => ({
        ...old,
        network: withdrawCrypto.network?.network
      }));
  }, [withdrawCrypto.network, status.showModal]);

  // 设置网络默认值 & 设置地址名称默认值
  useEffect(() => {
    if (status.showModal)
      setStatus((old) => ({
        ...old,
        name: `${status.network} ADDRESS ${(wallets?.data ?? [])?.length + 1}`
      }));
  }, [wallets, status.network, status.showModal]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-x-2">
          <p className="text-sm font-bold">{t("finance:add_withdrawal_address")}</p>
        </div>
      }
      isOpen={status.showModal}
      onClose={() => setStatus((v) => ({ ...v, showModal: false, address: "", name: "" }))}
      position="modal-middle"
      className="bg-base-400 md:max-w-[360px] shadow-lg"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <RequireItem label={<label
            className="text-xs text-base-content/50 font-semibold">{t("finance:withdrawal_network")}</label>} />
          <SelectDropdown
            title={t("finance:withdrawalNetwork")}
            height="sm"
            options={networks}
            value={status.network}
            onChange={(v) => {
              setStatus((old) => ({
                ...old,
                network: v as string
              }));
            }}
            placeholder={t("common.selectNetwork")}
            showSearch
            loading={l1}
          />
        </div>

        <div className="flex flex-col gap-2">
          <RequireItem
            label={<label className="text-xs text-base-content/50 font-semibold">{t("finance:address_name")}</label>} />
          <SmallLoading loading={isLoading} className="h-10 bg-base-300 !rounded-lg" content={
            <input
              type="text"
              readOnly
              className="input w-full bg-base-300 !outline-0 border-0 font-semibold px-4 text-base-content/50"
              placeholder={t("finance:address_name")}
              value={status.name}
            />
          } />
        </div>

        <div className="flex flex-col gap-2">
          <RequireItem
            label={<label className="text-xs text-base-content/50 font-semibold">{t("finance:address")}</label>} />

          <div className="relative">
            <input
              type="text"
              className="input w-full bg-base-300 !outline-0 border-0 font-semibold px-4"
              placeholder={t("finance:address")}
              value={status.address}
              onChange={(v) => {
                setStatus((old) => ({
                  ...old,
                  address: v.target.value
                }));
              }}
            />
            <ErrorMessageBox sample content={t("finance:address_failed_validation")} show={isError2} />
          </div>
        </div>

        <p className="text-base-content/50 font-semibold leading-4 text-xs">{t("finance:double_check")}</p>

        <ConfirmBox disabled={isError1 || isError2 || status.loading} onClick={submit} loading={status.loading}>
          {t("common:common.confirm")}
        </ConfirmBox>
      </div>
    </Modal>
  );
};

export default WithdrawAddressAddModal;