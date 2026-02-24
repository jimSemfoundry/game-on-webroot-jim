import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrency, useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useFinanceModal, useWalletModal } from "@/contexts/ModalsProvider";
import { useCurrentUser, useUserBalance } from "@/hooks/api/useAuth";
import { useSupportedSettlementCurrencies } from "@/hooks/api/usePublic";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { HelpModalBuckInfo } from "@/components/modal/BuckInfoModal";
import { ChevronDown, Eye, EyeOff, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Iconify from "../iconify";
import { emitter } from "@/store/emitter.ts";
import { randomString } from "@/components/modal/UserFinanceModal/helper.ts";
import Decimal from "decimal.js";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { BonusWallet } from "@/sections/dollars/bonus-wallet.tsx";

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencySelect: (currency: string) => void;
  trigger?: React.ReactNode;
  showBalance?: boolean;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = (
  {
    selectedCurrency,
    onCurrencySelect,
    trigger,
    showBalance = true,
    className = ""
  }) => {
  const { openUserFinanceModal, openUserFinanceModalWithTab } = useFinanceModal();
  const { openModal: openWalletModal } = useWalletModal();
  const { t } = useTranslation();
  const { user, status } = useAuth();
  const { selectedCurrency: displayCurrency, groupedCurrencies } = useDisplayCurrency();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hideZeroBalances, setHideZeroBalances] = useState(() => {
    const saved = localStorage.getItem(`${user?.id}-wallet-hideZeroBalances`);
    return saved ? JSON.parse(saved) : false;
  });
  const [buckInfoOpen, setBuckInfoOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Currency hooks
  const { formatWithoutConversion, formatWithConversion, isLoading: isCurrencyLoading } = useDisplayCurrencyFormatter();
  const { data: currenciesData, isLoading } = useSupportedSettlementCurrencies();
  const currencies = currenciesData?.data || [];
  const { data: userBalanceData = [], isLoading: isBalanceLoading } = useUserBalance();
  const userBalances = userBalanceData || [];

  // Get current display currency info
  const currentDisplayCurrency = user?.currency_fiat || displayCurrency;
  const fiatCurrencies = groupedCurrencies?.fiat || [];
  const currentDisplayCurrencyData = fiatCurrencies.find((c: any) => c.currency === currentDisplayCurrency);

  const { closeUserFinanceModal } = useFinanceModal();

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Save hideZeroBalances setting to localStorage
  useEffect(() => {
    localStorage.setItem(`${user?.id}-wallet-hideZeroBalances`, JSON.stringify(hideZeroBalances));
  }, [hideZeroBalances, user?.id]);

  // Currency selection handlers
  const handleCurrencySelect = (currency: string) => {
    onCurrencySelect(currency);
    setDropdownOpen(false);
    setModalOpen(false);
    setSearchTerm("");
  };

  const handleCurrencySwitchClick = () => {
    const isMobileDevice = window.innerWidth < 768;
    if (isMobileDevice) {
      setModalOpen(true);
    } else {
      setDropdownOpen(!dropdownOpen);
      if (!dropdownOpen) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }

    closeUserFinanceModal();
  };

  // Get user balance by currency
  const getUserBalanceByCurrency = useMemo(() => {
    return (currency: string): number => {
      const balance = userBalances.find((b: any) => b.currency === currency);
      return balance ? parseFloat(balance.balance) : 0;
    };
  }, [userBalances]);

  const settlementCurrencyDisplayDecimalByCode = useMemo(() => {
    const map = new Map<string, number>();
    currencies.forEach((c: any) => {
      if (typeof c?.currency === "string" && typeof c?.display_decimal === "number") {
        map.set(c.currency, c.display_decimal);
      }
    });
    return map;
  }, [currencies]);

  // Format amount display
  const formatAmount = (amount: number, currency: string) => {
    if (isCurrencyLoading) return "...";
    const displayDecimal = settlementCurrencyDisplayDecimalByCode.get(currency);
    return formatWithoutConversion(amount, currency, {
      showSymbol: true,
      showCode: false,
      compact: false,
      minimizeDecimals: true,
      displayDecimal
    }).formatted;
  };

  // Format converted display currency amount
  const formatDisplayCurrencyAmount = (amount: number, fromCurrency: string) => {
    if (isCurrencyLoading) return "...";
    if (fromCurrency === currentDisplayCurrency) return null;

    return formatWithConversion(amount, fromCurrency, {
      showSymbol: true,
      showCode: false,
      compact: false,
      minimizeDecimals: true,
      displayDecimal: currentDisplayCurrencyData?.display_decimal
    }).formatted;
  };

  // Get current selected currency balance
  const currentBalance = getUserBalanceByCurrency(selectedCurrency);

  // Group and filter currencies
  const groupedAndFilteredCurrencies = useMemo(() => {
    let filteredCurrencies = currencies.filter((currency: any) => {
      const matchesSearch =
        !searchTerm ||
        currency.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (currency.name && currency.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const balance = getUserBalanceByCurrency(currency.currency);
      const hasBalance = !hideZeroBalances || balance > 0;

      return matchesSearch && hasBalance;
    });

    const fiatCurrencies = filteredCurrencies.filter((c: any) => c.currency_type === "FIAT");
    const cryptoCurrencies = filteredCurrencies.filter((c: any) => c.currency_type === "CRYPTO");
    const rewardsCurrencies = filteredCurrencies.filter((c: any) => c.currency_type === "REWARDS");
    const bonusCurrencies = filteredCurrencies.filter((c: any) => c.currency === "BONUS");

    const groups = {
      FIAT: fiatCurrencies,
      CRYPTO: [...bonusCurrencies, ...rewardsCurrencies, ...cryptoCurrencies],
      REWARDS: []
    };

    return groups;
  }, [currencies, searchTerm, hideZeroBalances, getUserBalanceByCurrency]);

  const totalFilteredCount = Object.values(groupedAndFilteredCurrencies).reduce((total, group) => total + group.length, 0);

  // Currency group renderer
  const renderCurrencyGroup = (groupName: string, currencies: any[], isDesktop = true) => {
    if (currencies.length === 0) return null;

    const groupTitle =
      {
        FIAT: t("finance:fiat"),
        CRYPTO: t("finance:crypto")
      }[groupName] || groupName;

    const showGroupHeader = groupName !== "REWARDS";

    return (
      <div key={groupName} className="">
        {showGroupHeader && (
          <div
            className={`px-3 py-1 text-xs font-semibold text-base-content tracking-wider ${
              !isDesktop ? "px-4 pt-2 rounded-lg text-sm" : ""
            }`}
          >
            {groupTitle}
          </div>
        )}

        <div className={`space-y-1 rounded-field p-3 bg-base-300 ${!isDesktop && showGroupHeader ? "mt-1" : ""}`}>
          {currencies.map((currency: any) => {
            const balance = getUserBalanceByCurrency(currency.currency);
            const displayAmount = formatDisplayCurrencyAmount(balance, currency.currency);
            const isRewards = currency.currency_type === "REWARDS";

            // TODO: 彩金钱包活动支持
            if (currency.currency === "BONUS") {
              return <BonusWallet
                key={currency.currency}
                currency={currency}
                selected={selectedCurrency}
                onSelect={handleCurrencySelect} />;
            }

            return (
              <div
                key={currency.currency}
                className={`flex items-center justify-between w-full ${
                  isDesktop ? "px-3 py-3" : "px-4 py-3"
                } rounded-lg transition-colors ${
                  isRewards
                    ? "cursor-not-allowed"
                    : selectedCurrency === currency.currency
                      ? "bg-primary/10 text-primary cursor-pointer"
                      : "hover:bg-primary/5 cursor-pointer"
                }`}
                onClick={() => !isRewards && handleCurrencySelect(currency.currency)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <CurrencyIcon currency={currency.currency} className={`${isDesktop ? "w-5 h-5" : "w-6 h-6"}`} />
                    <span className="font-medium">{currency.currency}</span>
                  </div>

                  {/* SWAP button for REWARDS */}
                  {isRewards && (
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-primary rounded-md btn-soft btn-xs px-2 mx-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (modalOpen) setModalOpen(false);
                          if (dropdownOpen) setDropdownOpen(false);
                          openUserFinanceModalWithTab(`swap_${randomString()}`);

                          emitter.emit("SWAP", currency.currency);
                        }}
                      >
                        {t("finance:swap")}
                      </button>
                      <button
                        className="btn btn-ghost btn-square btn-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBuckInfoOpen(true);
                        }}
                      >
                        <Iconify icon="custom:info" className="text-base-content/50 w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Amount display */}
                  {showBalance && (
                    <div className="text-right rtl:text-left">
                      {displayAmount ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-base-content">{displayAmount}</span>
                          {currency.currency !== currentDisplayCurrency && (
                            <span
                              className="text-xs text-base-content/50">{formatAmount(balance, currency.currency)}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-base-content/70">{formatAmount(balance, currency.currency)}</span>
                      )}
                    </div>
                  )}
                </div>
                {selectedCurrency === currency.currency && !isRewards && (
                  <Iconify icon="custom:check" className={`${isDesktop ? "w-4 h-4" : "w-5 h-5"} text-primary ml-2`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Default trigger button
  const defaultTrigger = (
    <button
      className={`h-10 gap-1 flex items-center flex-1 text-base-content/50 md:text-md font-semibold text-sm hover:text-base-content/70 transition-colors cursor-pointer ${className}`}
      onClick={handleCurrencySwitchClick}
    >
      <CurrencyIcon currency={selectedCurrency} className="w-6 h-6" />
      <SmallLoading
        className={"!min-w-12 h-5"}
        loading={isBalanceLoading || isCurrencyLoading}
        content={
          <InnerGuideDeposits
            amount={formatDisplayCurrencyAmount(currentBalance, selectedCurrency) || formatAmount(currentBalance, selectedCurrency)}
            currency={selectedCurrency}
            balances={userBalanceData}
            showBalance={showBalance}
          />
        }>
      </SmallLoading>
      <ChevronDown
        strokeWidth={3}
        className={`mr-1 rtl:ml-1 w-3 h-3 ltr:ml-auto rtl:mr-auto transition-transform ${dropdownOpen ? "rotate-180" : ""} flex-shrink-0`}
      />
    </button>
  );

  /**
   * 需求: 首冲用户充值成功之后需要自动隐0余额
   * 实现:
   *  - 余额数据会自动更新
   *  - /api/profile信息里有充值次数字段deposit_times
   *  - 配合本地缓存设置 / IndexDB
   * 场景:
   *  - 加密货币充值 - 自动更新
   *  - 法币充值
   *    1. 提前从三方返回时候如何更新 🤔
   *      - 此时返回 - 页面会自动刷新 /api/profile数据更新 此时 deposit_times = 0
   *    2. 等到法币充值完成之后再返回如何更新 🤔
   *      - 此时返回 - 页面会自动刷新 /api/profile数据更新 此时 deposit_times = 1
   */
    // 用户 /profile 数据更新
  const { refetch: refetchProfile } = useCurrentUser();

  // 用户余额数据 - 定时更新
  const { data: balances = [] } = useUserBalance();

  useEffect(() => {
    const has_it_been_set_hide_balance = localStorage.getItem(`${user?.id}-balance-hidden`);
    const current_status_hide_zero_balance = localStorage.getItem(`${user?.id}-wallet-hideZeroBalances`);
    const some_balance_match = balances?.some((m: Record<string, any>) => Decimal(m?.balance || 0).gt(0));

    if (has_it_been_set_hide_balance !== "true" &&
      (!current_status_hide_zero_balance || current_status_hide_zero_balance === "false") &&
      (status?.deposit_times === 0 || status?.deposit_times === 1) &&
      some_balance_match
    ) {
      setHideZeroBalances(true);

      localStorage.setItem(`${user?.id}-balance-hidden`, "true");

      // 用户 /profile数据更新
      // TODO 特例: 当结算币为BONUS的时候,会有充值X币种,X转换为BONUS余额的过程,我们不希望在结算币为BONUS期间因为充值导致币种变更
      if (selectedCurrency !== "BONUS") void refetchProfile();
    }
  }, [user?.id, balances, status?.deposit_times, selectedCurrency]);

  return (
    <>
      <div className="relative z-[1002]" ref={dropdownRef}>
        {trigger ? (
          <div onClick={handleCurrencySwitchClick}>{trigger}</div>
        ) : (
          defaultTrigger
        )}

        {/* Desktop Dropdown */}
        {dropdownOpen && !isLoading && !isCurrencyLoading && (
          <div
            className="absolute p-3 top-full ltr:right-0 rtl:left-0 mt-2 bg-base-400 rounded-lg shadow-xl z-[1002] min-w-[420px] min-h-[514px] overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Iconify icon="custom:wallet" className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold">{t("finance:wallet")}</span>
              </div>
              <button className="btn btn-square btn-sm" onClick={() => setDropdownOpen(false)}>
                <X className="w-4 h-4 text-base-content/50" />
              </button>
            </div>
            <div>
              {/* Search box */}
              <div className="mb-2 flex items-center gap-2">
                <label
                  className="input input-ghost input-md bg-base-300 focus-within:bg-base-300 focus-within:outline-none flex-1 rounded-lg flex items-center gap-2">
                  <Search className="text-base-content/50 w-4 h-4" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder={t("common:common.search")}
                    className="grow bg-transparent focus:outline-none text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>
                <button
                  className="btn btn-square btn-md bg-base-300 border-none"
                  onClick={() => setHideZeroBalances(!hideZeroBalances)}
                  title={hideZeroBalances ? t("finance:showZeroBalances") : t("finance:hideZeroBalances")}
                >
                  {hideZeroBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button className="btn btn-primary btn-square btn-md btn-soft" onClick={openUserFinanceModal}>
                  <Iconify icon="custom:wallet" className="w-5 h-5" />
                </button>
              </div>

              {/* Currency list */}
              <div className="overflow-y-auto max-h-[310px] rounded-field">
                {totalFilteredCount === 0 ? (
                  <div className="text-center py-4 text-base-content/50 text-sm">{t("common:common.noData")}</div>
                ) : (
                  <div className="space-y-3">
                    {renderCurrencyGroup("FIAT", groupedAndFilteredCurrencies.FIAT, true)}
                    {renderCurrencyGroup("CRYPTO", groupedAndFilteredCurrencies.CRYPTO, true)}
                  </div>
                )}
              </div>

              {/* Game Currency footer */}
              <div className="bg-base-300 absolute bottom-0 left-0 right-0 h-22 px-5">
                <div className="flex items-center justify-between w-full h-full">
                  <p className="font-bold text-base-content/50 text-lg">{t("menu:gameCurrency")}</p>
                  <button
                    className="btn btn-primary btn-lg btn-soft flex items-center gap-2"
                    onClick={() => {
                      setDropdownOpen(false);
                      openWalletModal();
                    }}
                  >
                    <CurrencyIcon currency={currentDisplayCurrency} className="w-5 h-5" />
                    <p
                      className="font-bold text-base">{currentDisplayCurrencyData?.display_name || currentDisplayCurrency}</p>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Modal */}
      <Modal
        isOpen={modalOpen}
        zIndex={1002}
        onClose={() => {
          setModalOpen(false);
          setSearchTerm("");
        }}
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Iconify icon="custom:wallet" className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold">{t("finance:wallet")}</span>
            </div>
          </div>
        }
        position={isMobile ? "modal-bottom" : "modal-middle"}
        className="bg-base-400 md:w-[480px] max-w-md overflow-hidden h-[75vh] max-h-[75vh] md:max-h-[500px] !pb-0 relative"
      >
        <div className="flex flex-col h-[75vh] md:h-[460px] max-h-[75vh] pb-[130px]">
          {/* Fixed search area */}
          <div className="flex-shrink-0 pb-2">
            <div className="flex items-center gap-2">
              <label
                className="input bg-base-300 input-ghost focus-within:bg-base-300 focus-within:!outline-none focus:!outline-none flex-1 rounded-field">
                <Search className="text-base-content/50 w-4 h-4 md:w-5 md:h-5" />
                <input
                  type="search"
                  placeholder={t("common:common.search")}
                  className="input w-full focus-within:!outline-none focus:!outline-none text-sm md:text-base font-semibold px-0"
                  value={searchTerm}
                  autoComplete={"off"}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
              <button
                className="btn btn-square btn-md bg-base-300 border-none"
                onClick={() => setHideZeroBalances(!hideZeroBalances)}
                title={hideZeroBalances ? t("finance:showZeroBalances") : t("finance:hideZeroBalances")}
              >
                {hideZeroBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button className="btn btn-primary btn-square btn-md btn-soft" onClick={() => {
                setModalOpen(false);
                openUserFinanceModal();
              }}>
                <Iconify icon="custom:wallet" className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable currency list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading || isCurrencyLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : totalFilteredCount === 0 ? (
              <div className="text-center py-8 text-base-content/50">{t("common:common.noData")}</div>
            ) : (
              <div className="space-y-2 pb-4">
                {renderCurrencyGroup("FIAT", groupedAndFilteredCurrencies.FIAT, false)}
                {renderCurrencyGroup("CRYPTO", groupedAndFilteredCurrencies.CRYPTO, false)}
              </div>
            )}
          </div>
        </div>

        {/* Fixed bottom footer */}
        <div
          className="bg-base-300 flex-shrink-0 flex items-center justify-center absolute bottom-0 left-0 right-0"
          style={{ height: "80px", minHeight: "80px" }}
        >
          <div className="flex px-5 items-center justify-between w-full">
            <p className="font-bold text-base-content/50 text-sm">{t("menu:gameCurrency")}</p>
            <button
              className="btn btn-primary btn-md btn-soft flex items-center gap-2"
              onClick={() => {
                // 先关闭当前modal，避免覆盖问题
                setModalOpen(false);
                // 稍微延迟打开新modal，确保动画流畅
                setTimeout(() => {
                  openWalletModal();
                }, 100);
              }}
            >
              <CurrencyIcon currency={currentDisplayCurrency} />
              <p className="font-semibold">{currentDisplayCurrencyData?.display_name || currentDisplayCurrency}</p>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Modal>

      {/* BUCK Info Modal */}
      {buckInfoOpen && <HelpModalBuckInfo
        isOpen={buckInfoOpen}
        onClose={() => setBuckInfoOpen(false)}
      />}
    </>
  );
};

const InnerGuideDeposits = ({ amount, currency, balances, showBalance }: {
  amount: string,
  currency: string,
  balances: Record<string, any>,
  showBalance: boolean
}) => {
  const is_all_zero = useMemo(() => {
    if (balances.length === 0) return true;
    return balances.every((b: { balance: string }) => Number(b.balance) === 0);
  }, [balances]);
  return !is_all_zero && <div className="text-[13px] font-bold tracking-tighter text-base-content/60">
    {showBalance ? amount : currency}
  </div>;
};
