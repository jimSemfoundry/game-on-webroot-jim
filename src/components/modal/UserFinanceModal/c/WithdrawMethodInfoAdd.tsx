import { Loading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn.ts";
import { useClickAway, useToggle } from "ahooks";
import classNames from "classnames";
import { TFunction } from "i18next";
import { ChevronLeft, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useUserWithdrawFiatInfo } from "@/components/modal/UserFinanceModal/helper.ts";
import { orderBy } from "lodash-es";
import { authService } from "@/services/authService.ts";
import { sleep } from "@/components/socialLogin/helper.ts";
import {
  DisplayContent,
  ImageWithPlaceholder,
  InnerMaintenance
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

interface StateProps {
  selected: Record<string, any> | undefined;
  create: boolean;
}

const initState = {
  selected: undefined,
  create: false
};

export const WithdrawMethodInfoAdd = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const ref = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const [status, setStatus] = useState<StateProps>(initState);

  // from data store, share common data
  const { withdrawFiat, withdrawFiatV2, setSyncAction, setWithdrawFiatV2 } = useBoundStore();

  // 法币提现用用户添加的快捷信息列表
  const { data: wallets, isLoading: l1 } = useUserWithdrawFiatInfo(withdrawFiat.currency?.currency);

  // 法币提现用用户添加的快捷信息列表
  const currentWallet = useMemo(() => (Array.isArray(wallets?.data) ? wallets?.data : []), [wallets]);

  // 设置默认选中
  useEffect(() => {
    /**
     * FIXME: 这是什么错误
     * {
     *     "code": 500,
     *     "msg": "UserWithdrawInfo Data failed",
     *     "data": "Undefined array key \"bind\""
     * }
     */
    if (currentWallet.length > 0) {
      setStatus((old) => ({
        ...old,
        selected: currentWallet.find((c: { is_default: number; }) => c.is_default === 1)
      }));

      setWithdrawFiatV2({ method: currentWallet.find((c: { is_default: number; }) => c.is_default === 1) });
    } else {
      setWithdrawFiatV2({ method: null, formItem: { amount: "" } });
    }
  }, [currentWallet]);

  useClickAway(() => {
    setStatus((v) => ({ ...v, create: false }));
  }, [ref]);

  return (
    <div>
      <p className="pb-2 text-xs text-base-content/50 font-semibold">{t("finance:withdrawalDetails")}</p>
      <div className="bg-base-300 rounded-lg flex flex-col justify-center">
        {l1 && <Loading className={"h-52"} />}

        {/* 无快捷信息 */}
        <DisplayContent status={!l1 && (currentWallet.length === 0)}>
          <InnerAddAddr t={t} onClick={() => {
            setSyncAction("OPEN_WITHDRAW_METHOD_ADD_MODAL");
          }} />
        </DisplayContent>

        {/* 有快捷信息 */}
        <DisplayContent status={!l1 && currentWallet.length > 0}>
          <div className="relative">
            {/* 当前正在使用的快捷信息 */}
            {(withdrawFiatV2.method) && <InnerAddress
              data={withdrawFiatV2.method}
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
            />}
            {/* 未选择快捷信息 */}
            {(!withdrawFiatV2.method && currentWallet.length > 0) && <InnerPleaseSelect extra={<button
              className="btn btn-square btn-sm btn-soft"
              onClick={(e) => {
                e.stopPropagation();
                setStatus((v) => ({ ...v, create: !status.create }));
                return false;
              }}
            >
              <ChevronsUpDown className="text-primary w-4 h-4" strokeWidth={4} />
            </button>} />}

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
                      <InnerAddressList
                        data={currentWallet}
                        onSelect={async (v: Record<string, any>) => {
                          setWithdrawFiatV2({ method: v });

                          await sleep(250);

                          setStatus((old) => ({ ...old, create: false }));

                          void authService.setUserWithdrawInfoDefaultById({ id: v?.id });
                        }}
                      />
                      <InnerAddAddr
                        t={t}
                        className="p-0"
                        onClick={() => {
                          setStatus((old) => ({ ...old, create: false }));
                          setSyncAction("OPEN_WITHDRAW_METHOD_ADD_MODAL");
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
                      transition={{ duration: 0.2 }}
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
                        <InnerAddressList
                          data={currentWallet}
                          onSelect={async (v: Record<string, any>) => {
                            setWithdrawFiatV2({ method: v });

                            await sleep(250);

                            setStatus((old) => ({ ...old, create: false }));

                            void authService.setUserWithdrawInfoDefaultById({ id: v?.id });
                          }}
                        />
                        <InnerAddAddr
                          t={t}
                          className="p-0"
                          onClick={() => {
                            setStatus((old) => ({ ...old, create: false }));
                            setSyncAction("OPEN_WITHDRAW_METHOD_ADD_MODAL");
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
const InnerAddAddr = ({ t, onClick, className }: { t: TFunction; onClick: () => void; className?: string }) => {
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
            className="text-xs text-base-content/50">{t("Please fill in your fiat currency withdrawal information.")}</p>
        </div>
      </div>
      <button className="btn btn-square btn-sm btn-soft">
        <Plus className="text-primary w-4 h-4" strokeWidth={4} />
      </button>
    </div>
  );
};
// 地址详情
const InnerAddress = (
  {
    data,
    edit,
    extra,
    trash,
    className,
    onClick
  }: {
    data: Record<string, any>;
    edit?: boolean;
    trash?: boolean;
    extra?: ReactNode;
    className?: string;
    onClick?: (v: Record<string, any>) => void;
  }) => {
  const { withdrawFiat, withdrawFiatV2 } = useBoundStore();

  // 法币提现用用户添加的快捷信息列表
  const { refetch, isFetching } = useUserWithdrawFiatInfo(withdrawFiat.currency?.currency);

  const [loading, { set }] = useToggle<boolean>(false);

  const source = useMemo(() => data?.params ? orderBy(Object.values(parser(data?.params)), ["weight"], ["desc"]) : [], [data?.params]);

  return <div
    className={classNames("relative bg-base-200 flex items-center gap-3 p-4 rounded-field font-semibold cursor-pointer", className)}
    onClick={() => {
      if (withdrawFiatV2.method?.id !== data?.id && (!loading || isFetching)) onClick?.(data);
    }}
  >
    <InnerDisplayContent show={Boolean(edit)}>
      <input type="radio" checked={withdrawFiatV2.method?.id === data?.id} className="radio radio-sm radio-primary" />
    </InnerDisplayContent>
    <ImageWithPlaceholder src={data?.icon} className="max-w-25 min-h-8 min-w-8 !bg-base-400 rounded-lg p-2" />
    <div className="flex-1 flex flex-col gap-2 text-xs truncate">
      {
        source.map((v: any) => {
          if (["accountname", "name"].includes(v.name)) {
            return (<div key={v.name} className="flex items-center gap-1 font-bold text-sm">
              {data[v.name]}
            </div>);
          }
          if (!v.hide) {
            return (<div key={v.name} className="text-base-content/50">{data[v.name]}</div>);
          }
          return null;
        })
      }
    </div>
    {extra}
    {trash && ((loading) ? <span className="loading loading-spin loading-xs" /> :
      <Trash2 className="text-base-content/50 w-4 h-4 cursor-pointer" onClick={
        async (e) => {
          e.stopPropagation();
          set(true);
          await authService.deleteUserWithdrawInfo({ id: data?.id });
          void refetch();
          set(false);
        }} />)}
    <InnerMaintenance show={data.status === 0} className="py-0.5 rounded-bl-field rounded-tr-field top-0 right-0" />
  </div>;
};
// 地址列表
const InnerAddressList = (
  {
    data,
    onSelect
  }: {
    data: Record<string, any>[];
    onSelect: (v: Record<string, any>) => void;
  }) => {
  const { withdrawFiat } = useBoundStore();

  // 法币提现用用户添加的快捷信息列表
  const { isFetching } = useUserWithdrawFiatInfo(withdrawFiat.currency?.currency);

  return (
    <>
      {isFetching &&
        <div className="p-2 text-xs text-center text-base-content/50">Updating withdrawal address, please wait...</div>}
      {data.map((item) => (
        <InnerAddress
          key={item.id}
          data={item} edit
          // trash={withdrawFiatV2?.method?.id !== item?.id}
          trash
          onClick={onSelect} />
      ))}
    </>
  );
};

const InnerPleaseSelect = ({ extra }: { extra: ReactNode }) => {
  const { t } = useTranslation();
  return (<div
    className={classNames("relative bg-base-300 flex items-center gap-2 p-4 rounded-field font-semibold cursor-pointer")}>
    <div className="flex-1 flex flex-col gap-2 text-xs">
      {t("Please select a withdrawal method.")}
    </div>
    {extra}
  </div>);
};

function parser(payload: string) {
  if (!/^{.*}$/.test(payload)) return payload;
  return JSON.parse(payload);
}

export const InnerDisplayContent = ({ show, children }: { show: boolean, children: ReactNode }) => {
  return show ? (children) : null;
};
