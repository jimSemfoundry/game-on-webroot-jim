import { Loading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useUserWithdrawWallet } from "@/hooks/api/useAuth.ts";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn.ts";
import { useClickAway } from "ahooks";
import classNames from "classnames";
import { TFunction } from "i18next";
import { ChevronLeft, ChevronsUpDown, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
// import { authService } from "@/services/authService.ts";
// import { toast } from "sonner";

interface StateProps {
  selected: Record<string, any> | undefined;
  create: boolean;
}

const initState = {
  selected: undefined,
  create: false
};

export const WithdrawAddressAdd = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const [status, setStatus] = useState<StateProps>(initState);

  const { withdrawCrypto, setWithdrawCrypto, setSyncAction } = useBoundStore();

  // 用户钱包地址列表
  const { data: wallets, isLoading: l1 } = useUserWithdrawWallet(withdrawCrypto.network?.network);

  // 当前网络的用户钱包地址
  const currentWallet = useMemo(() => {
    return (wallets?.data ?? []).filter((o: { network: string }) => o.network === withdrawCrypto.network?.network);
  }, [wallets, withdrawCrypto.network]);

  useClickAway(() => {
    setStatus((v) => ({ ...v, create: false }));
  }, [ref]);

  /**
   * FIXME:
   *  1. 有些网关没钱包地址
   *  2. 有些网关用户添加了地址
   *  切换数据的时候要重置存储的值
   */
  useEffect(() => {
    if (currentWallet?.length > 0) {
      setStatus((old) => ({ ...old, selected: currentWallet[0] }));
      setWithdrawCrypto({ toWallet: currentWallet[0]?.address });
    } else {
      setStatus((old) => ({ ...old, selected: undefined }));
      setWithdrawCrypto({ toWallet: "" });
    }
  }, [currentWallet]);

  return (
    <div className="flex flex-col">
      <p className="pb-2 text-xs text-base-content/50 font-semibold">{t("finance:withdrawalAddress")}</p>

      <div className="min-h-23 bg-base-300 rounded-lg">
        {l1 && <Loading />}

        {/* 当前网络无钱包地址 */}
        <DisplayContent
          status={!l1 && (wallets?.data?.length === 0 || (wallets?.data?.length > 0 && currentWallet.length === 0))}>
          <AddAddr
            t={t}
            onClick={() => {
              setSyncAction("OPEN_WITHDRAW_ADDRESS_ADD_MODAL");
            }}
          />
        </DisplayContent>

        {/* 操作现有地址的入口和窗口 */}
        <DisplayContent status={!l1 && wallets?.data?.length > 0 && currentWallet.length > 0}>
          <div className="relative">
            {/* 当前正在使用的钱包地址 */}
            <Address
              data={status.selected!}
              extra={
                <button
                  className="btn btn-square btn-sm btn-soft"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatus((v) => ({ ...v, create: !status.create }));
                    return false;
                  }}
                >
                  <ChevronsUpDown className="text-primary w-4 h-4" strokeWidth={4} />
                </button>
              }
              className="bg-base-300"
            />

            {/*桌面端*/}
            {!isMobile && (
              <AnimatePresence>
                {status.create && (
                  <motion.div
                    className="bg-base-300 absolute z-1 mt-1 w-full rounded-lg shadow-xs overflow-hidden shadow-lg"
                    exit={{ height: 0 }}
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    transition={{ duration: 0.1 }}
                  >
                    <div className="h-2 bg-base-300 sticky top-0" />
                    <div
                      className="relative flex max-h-[412px] flex-col gap-2 px-3 py-1 overflow-y-auto hide-scrollbar">
                      <p className="h-5 text-xs font-semibold">{t("finance:withdrawalAddress")}</p>
                      <AddressList
                        data={currentWallet}
                        selected={status.selected}
                        onSelect={(v: Record<string, any>) => {
                          setStatus((old) => ({ ...old, selected: v, create: false }));
                          setWithdrawCrypto({ toWallet: v?.address });
                        }}
                      />
                      <AddAddr
                        t={t}
                        className="p-0"
                        onClick={() => {
                          setStatus((old) => ({ ...old, create: false }));
                          setSyncAction("OPEN_WITHDRAW_ADDRESS_ADD_MODAL");
                        }}
                      />
                    </div>
                    <div className="h-2 bg-base-300 sticky bottom-0" />
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* 移动端 */}
            {isMobile &&
              createPortal(
                <AnimatePresence>
                  {status.create && (
                    <motion.div
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
                      className="px-4 py-6 bg-base-300 fixed w-full z-1001 top-0 bottom-0 flex flex-col"
                    >
                      <p className="flex items-center justify-center relative text-lg font-semibold h-7">
                        <button
                          className={"absolute left-0 btn btn-square rounded-lg"}
                          onClick={() => setStatus((v) => ({ ...v, create: false }))}
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        {t("finance:withdrawalAddress")}
                      </p>
                      <div className="mt-6 overflow-y-auto flex-1 hide-scrollbar flex flex-col gap-4">
                        <AddressList
                          data={currentWallet}
                          selected={status.selected}
                          onSelect={(v: Record<string, any>) => {
                            setStatus((old) => ({ ...old, selected: v }));

                            setWithdrawCrypto({ toWallet: v?.address });

                            setTimeout(() => {
                              setStatus((old) => ({ ...old, create: false }));
                            }, 100);
                          }}
                        />
                        <AddAddr
                          t={t}
                          className="p-0"
                          onClick={() => {
                            setStatus((old) => ({ ...old, create: false }));
                            setSyncAction("OPEN_WITHDRAW_ADDRESS_ADD_MODAL");
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>,
                document.body
              )}
          </div>
        </DisplayContent>
      </div>
    </div>
  );
};

// 触发新增地址窗口
const AddAddr = ({ t, onClick, className }: { t: TFunction; onClick: () => void; className?: string }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-base-300 hover:bg-base-300/60 flex cursor-pointer justify-between items-center gap-4 rounded-lg p-4 transition-colors",
        className
      )}
    >
      <div className="flex items-center gap-4 font-semibold">
        <img src="/icons/isometric/8.svg" className="h-12 w-12" alt="" />
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">{t("finance:add_withdrawal_address")}</p>
          <p
            className="text-xs text-base-content/50">{t("finance:kindly_fill_in_your_crypto_withdrawal_address_details")}</p>
        </div>
      </div>
      <button className="btn btn-square btn-sm btn-soft">
        <Plus className="text-primary w-4 h-4" strokeWidth={4} />
      </button>
    </div>
  );
};

const Address = ({
                   data,
                   edit,
                   extra,
                   className,
                   selected,
                   onClick
                 }: {
  data: Record<string, any>;
  selected?: Record<string, any>;
  edit?: boolean;
  extra?: ReactNode;
  className?: string;
  onClick?: (v: Record<string, any>) => void;
}) => {
  // const [loading, { set }] = useToggle<boolean>(false);

  // from data store, share common data
  // const { withdrawCrypto } = useBoundStore();

  // 用户钱包地址列表
  // const { refetch } = useUserWithdrawWallet(withdrawCrypto.network?.network);

  // 删除钱包地址
  // const submit = async () => {
  //   set(true);
  //   authService.deleteUserWithdrawWallet(data?.id)
  //     .then((res) => {
  //       if (res.code === 0) {
  //         void refetch(); // 更新用户钱包地址列表
  //       }
  //     })
  //     .catch(() => {
  //       set(false);
  //     })
  //     .finally(() => {
  //       set(false);
  //     });
  // };

  return (
    <div
      className={classNames("bg-base-200 flex items-center gap-2 p-3 rounded-field font-semibold cursor-pointer", className)}
      onClick={() => onClick?.(data)}
    >
      {edit && <input type="radio" checked={selected?.id === data?.id} className="radio radio-sm radio-primary" />}
      <img src={`/icons/currency/${data?.network?.toLowerCase()}.svg`} className="h-6 w-6" alt="" />
      <div className="flex-1 flex flex-col gap-2">
        <p className="text-sm">{data?.name}</p>
        <p className="text-xs text-base-content/50 break-all">{data?.address}</p>
        <span className="badge badge-neutral text-xs rounded-sm px-1.5">{data?.id}</span>
      </div>
      {/*{edit && (<Trash2 className="text-base-content/50 w-4 h-4 cursor-pointer" onClick={submit} />)}*/}
      {extra}
    </div>
  );
};

const AddressList = ({
                       data,
                       selected,
                       onSelect
                     }: {
  data: Record<string, any>[];
  selected?: Record<string, any>;
  onSelect: (v: Record<string, any>) => void;
}) => {
  return (
    <>
      {data.map((item) => (
        <Address key={item.id} data={item} edit selected={selected} onClick={onSelect} />
      ))}
    </>
  );
};
