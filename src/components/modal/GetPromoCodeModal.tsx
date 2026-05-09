import { Modal } from "@/components/ui/Modal.tsx";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { EBonus } from "@/sections/dollars/components.tsx";
import { useMqttTopicMessagesReadonly } from "@/contexts/mqtt";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useEffect } from "react";
import { useUserBuddyBallsHome } from "@/hooks/api/useAuth.ts";
import { SPORTS_BONUS_QUERY_KEY } from "@/query/sports-bonus.ts";

export const GetPromoCodeModal = (
  {
    data,
    open,
    onClose
  }: {
    data: Record<string, any>;
    open: boolean;
    onClose: () => void;
  }) => {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { t } = useTranslation();

  const { user } = useAuth();

  // 设置结算币种
  const { updateSettlementCurrency } = useSettlementCurrency();

  // 球游戏 -> 球游戏的主页信息
  const { refetch: refetchBuddyBallsHome } = useUserBuddyBallsHome();

  // EMQX - 优惠码使用结果通知
  const { parsedMessages } = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/promo_code_result` : null);

  const latest = parsedMessages?.[0];

  useEffect(() => {
    if (!data?.type?.includes("free_spin")) return;
    if (latest?.parsed?.result !== "success" || !latest?.parsed?.type?.includes("free_spin")) return;

    onClose();

    // TODO: FreeSpins优惠码获取成功,去首页领取FreeSpins
    void navigate({
      to: "/casino", search: {
        redirect: undefined,
        startapp: undefined,
        openLogin: undefined,
        openSignUp: undefined,
        openFinance: undefined
      }
    });
  }, [data?.type, latest?.parsed?.type, latest?.parsed?.result]);

  return (
    <Modal
      isOpen={open}
      title=""
      onClose={onClose}
      className="bg-base-400 md:max-w-[360px] hide-scrollbar"
      position="modal-middle"
    >
      <div className="flex flex-col gap-4 items-center font-semibold overflow-hidden">
        <div className="flex flex-col gap-4 items-center">
          <img src="/images/bonus/success.png" alt="" className={'w-25 h-25'} />
          <p className="text-lg font-extrabold">
            {data?.code === 0
              ? <span className={"text-primary"}>{t("bonus:congratulations")}</span>
              : <span className={"text-warning"}>{t("transaction:transactionStatus.failed")}</span>}
          </p>
          <p className="text-base-content/50 text-sm text-center">
            {data?.code === 0 && t("bonus:claim_successful")}
            {/*{data?.code === 51016 && t("bonus:promo_expired")}*/}
            {/*{data?.code === 51017 && t("bonus:promo_claimed")}*/}
            {/*{data?.code === 51007 && t("bonus:invalid_parameter")}*/}
            {/*{data?.code === 51008 && t("bonus:promo_invalid")}*/}
            {/*{data?.code === 51018 && t("bonus:promo_claim_limit")}*/}
            {/*{data?.code === 51014 && t("bonus:promo_unavailable")}*/}
            {/*{data?.code === 51019 && t("bonus:promo_claim_limit")}*/}
            {/*{data?.code === 51020 && t("bonus:similar_event")}*/}
            {/*{data?.code === 51021 && t("bonus:not_started_yet")}*/}
            {/*{data?.code === 51022 && t("bonus:not_eligible")}*/}
            {/*{data?.code === 51023 && t("bonus:cannot_claim")}*/}
          </p>
        </div>

        {/* TODO: FreeSpins较特殊,需要和其他手动优惠码区分 */}
        {!data?.type?.includes("free_spin") &&
          (<button
            className={"btn btn-primary min-w-30"}
            onClick={() => {
              onClose();

              // SportsBonusWallet 优惠码获取成功,去体育彩金详情页操作体育彩金
              // (放在 bonus_wallet 判断之前,因为 sports_bonus_wallet 也包含 bonus_wallet 子串)
              if (data?.type?.includes("sports_bonus_wallet")) {
                // 跳转前 invalidate sports wallet query,避免命中 claim 前的旧 cache(=null) 显示购买列表
                void queryClient.invalidateQueries({ queryKey: SPORTS_BONUS_QUERY_KEY });
                void navigate({ to: "/dollars/sports-bonus" as any });
                return;
              }

              // BonusWallet优惠码获取成功,去彩金详情页操作彩金
              if (data?.type?.includes("bonus_wallet")) {
                void navigate({ to: "/dollars/bonus" });
                void updateSettlementCurrency(EBonus.TOKEN);
                return;
              }

              // 幸运球优惠码获取成功,去幸运球游戏页
              if (data?.type?.includes("buddy_balls")) {
                void navigate({ to: "/buddy-balls" });
                void refetchBuddyBallsHome()
                return;
              }

              // 常规优惠码获取,无操作
              if (data?.type?.includes("manual_bonus")) {
              }
            }}>
            {t("bonus:gotIt")}
          </button>)}

        {/* TODO: 确保FreeSpins有数据了再完成跳转,用户可以第一时间在首页看到FreeSpins */}
        {data?.type?.includes("free_spin") &&
          (<ConfirmBox
            loading={!latest?.parsed?.type?.includes("free_spin") && data?.code === 0 && data?.type?.includes("free_spin")}
            onClick={() => null}
            className={"w-auto"}
          >{!latest?.parsed?.type?.includes("free_spin") ? t("bonus:item.ongoing") : t("bonus:completed")}</ConfirmBox>)}
      </div>
    </Modal>
  );
};

export default GetPromoCodeModal;
