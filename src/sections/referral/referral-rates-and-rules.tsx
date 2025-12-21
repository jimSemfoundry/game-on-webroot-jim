import Iconify from "@/components/iconify";
import { Select, type SelectOption } from "@/components/ui/Select";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import { useGameCategories, useVipConfig } from "@/hooks/api/usePublic";
import { cn } from "@/utils/cn";
import { formatInputDisplay, isValidNumberInput } from "@/utils/format-number";
import Decimal from "decimal.js";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ReferralRewardsSchedule } from "./referral-rewards-schedule";

type GameSelectOption = SelectOption & {
  spare?: string | number;
  name_key?: string;
};

type VipSelectOption = SelectOption & {
  spare?: string | number;
  vipLevel?: string;
};

const BASE_COMMISSION_RATE = new Decimal(0.01);

export const ReferralRatesAndRules = () => {
  const { t } = useTranslation();
  const { status, user } = useAuth();
  const { selectedCurrency, getCurrencySymbol } = useDisplayCurrency();

  const [hideInfographic, setHideInfographic] = useState(false);
  const [selectedReferralType, setSelectedReferralType] = useState<"direct" | "indirect">("direct");
  const [selectedWager, setSelectedWager] = useState<string>("1000");
  const [selectedGameCategory, setSelectedGameCategory] = useState<string>("");
  const [selectedDirectVip, setSelectedDirectVip] = useState<string>("");
  const [selectedIndirectSelfVip, setSelectedIndirectSelfVip] = useState<string>("");
  const [selectedIndirectHighestVip, setSelectedIndirectHighestVip] = useState<string>("");
  const [isInfographicReady, setIsInfographicReady] = useState(false);
  const isInfographicVisible = !hideInfographic;
  const infographicByType = useMemo(
    () => ({
      direct: "/images/illustrations/direct-commission.png",
      indirect: "/images/illustrations/indirect-commission.png",
    }),
    [],
  );
  const activeInfographicSrc = infographicByType[selectedReferralType] ?? infographicByType.direct;
  const activeInfographicAlt =
    selectedReferralType === "indirect"
      ? t("referral:indirectInfographic", "Indirect referral commissions infographic")
      : t("referral:directInfographic", "Direct referral commissions infographic");

  const currencySymbol = getCurrencySymbol(selectedCurrency) || selectedCurrency;

  const { data: gameCategoriesData, isLoading: isLoadingGameCategories, error: gameCategoriesError } = useGameCategories();
  const { data: vipConfigData, isLoading: isLoadingVipConfig, error: vipConfigError } = useVipConfig();

  const handleWagerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (!isValidNumberInput(inputValue, 2)) {
      return;
    }

    const numericValue = inputValue.replace(/,/g, "");
    if (numericValue === ".") {
      setSelectedWager("0.");
      return;
    }

    // remove leading 0s if not a decimal
    // Example: "02" -> "2", "002" -> "2", but "0.2" -> "0.2", "00.2" -> "0.2"
    let processedValue = numericValue;
    const dotIndex = numericValue.indexOf(".");
    if (dotIndex === -1) {
      // No dot: remove leading 0s
      // Example: "02" -> "2", "002" -> "2", "0" -> "0"
      processedValue = numericValue.replace(/^0+/, "") || "0";
    } else if (dotIndex > 0) {
      // If there is a dot: remove leading 0s from the integer part, keep "0" if needed
      // Example: "00.2" -> "0.2", "002.5" -> "2.5"
      const integerPart = numericValue.substring(0, dotIndex);
      const decimalPart = numericValue.substring(dotIndex);
      const cleanedInteger = integerPart.replace(/^0+/, "") || "0";
      processedValue = cleanedInteger + decimalPart;
    }
    // If it starts with "0." then keep it (dotIndex === 0)

    setSelectedWager(processedValue);
  };

  const gameOptions = useMemo<GameSelectOption[]>(() => {
    if (gameCategoriesError || !gameCategoriesData?.data) {
      return [];
    }

    return (gameCategoriesData.data as any[])
      .filter((gameType) => gameType?.parent_name_key === "-")
      .map((gameType) => {
        const baseLabel = String(t(`explore:${gameType.name_key}`, gameType.name || gameType.categoryName || gameType.title || ""));

        return {
          value: String(gameType.id),
          label: baseLabel,
          spare: gameType.group_rate,
          name_key: gameType.name_key,
        } satisfies GameSelectOption;
      });
  }, [gameCategoriesData?.data, gameCategoriesError, t]);

  const vipOptions = useMemo<VipSelectOption[]>(() => {
    if (vipConfigError || !vipConfigData?.data) {
      return [];
    }

    return (vipConfigData.data as any[]).map(
      (vipLevel) =>
        ({
          value: String(vipLevel.id),
          label: `VIP ${vipLevel.vip}`,
          spare: vipLevel.group,
          vipLevel: String(vipLevel.vip),
        }) satisfies VipSelectOption,
    );
  }, [vipConfigData?.data, vipConfigError]);

  const defaultVipOption = useMemo(() => {
    if (!vipOptions.length) return undefined;
    const userVipLevel = status?.vip ? String(status.vip) : undefined;
    if (userVipLevel) {
      const matched = vipOptions.find((option) => option.vipLevel === userVipLevel);
      if (matched) {
        return matched;
      }
    }
    return vipOptions[0];
  }, [status?.vip, vipOptions]);

  useEffect(() => {
    if (!selectedGameCategory && gameOptions.length > 0) {
      setSelectedGameCategory(String(gameOptions[0].value));
    }
  }, [gameOptions, selectedGameCategory]);

  useEffect(() => {
    if (!vipOptions.length) {
      return;
    }

    if (!selectedDirectVip && defaultVipOption) {
      setSelectedDirectVip(String(defaultVipOption.value));
    }

    if (!selectedIndirectSelfVip && defaultVipOption) {
      setSelectedIndirectSelfVip(String(defaultVipOption.value));
    }

    if (!selectedIndirectHighestVip) {
      setSelectedIndirectHighestVip(String(vipOptions[0].value));
    }
  }, [defaultVipOption, selectedDirectVip, selectedIndirectSelfVip, selectedIndirectHighestVip, vipOptions]);

  const selectedGameOption = useMemo(
    () => gameOptions.find((option) => String(option.value) === selectedGameCategory),
    [gameOptions, selectedGameCategory],
  );
  const directVipOption = useMemo(
    () => vipOptions.find((option) => String(option.value) === selectedDirectVip),
    [vipOptions, selectedDirectVip],
  );
  const indirectSelfVipOption = useMemo(
    () => vipOptions.find((option) => String(option.value) === selectedIndirectSelfVip),
    [vipOptions, selectedIndirectSelfVip],
  );
  const indirectHighestVipOption = useMemo(
    () => vipOptions.find((option) => String(option.value) === selectedIndirectHighestVip),
    [vipOptions, selectedIndirectHighestVip],
  );

  const wagerDecimal = useMemo(() => {
    if (!selectedWager || selectedWager === "0." || selectedWager === ".") {
      return new Decimal(0);
    }

    try {
      return new Decimal(selectedWager);
    } catch (error) {
      console.warn("Invalid wager input", error);
      return new Decimal(0);
    }
  }, [selectedWager]);

  const gameRateDecimal = useMemo(() => {
    if (!selectedGameOption?.spare) return undefined;
    try {
      return new Decimal(selectedGameOption.spare);
    } catch (error) {
      console.warn("Invalid game rate", error);
      return undefined;
    }
  }, [selectedGameOption?.spare]);

  const directCommission = useMemo(() => {
    if (!directVipOption?.spare || !gameRateDecimal) {
      return new Decimal(0);
    }

    try {
      const vipRate = new Decimal(directVipOption.spare);
      if (vipRate.lte(0) || gameRateDecimal.lte(0) || wagerDecimal.lte(0)) {
        return new Decimal(0);
      }

      return wagerDecimal.mul(BASE_COMMISSION_RATE).mul(vipRate).mul(gameRateDecimal);
    } catch (error) {
      console.warn("Failed to calculate direct commission", error);
      return new Decimal(0);
    }
  }, [directVipOption?.spare, gameRateDecimal, wagerDecimal]);

  const indirectRateDifference = useMemo(() => {
    if (!indirectSelfVipOption?.spare || !indirectHighestVipOption?.spare) {
      return new Decimal(0);
    }

    try {
      const myRate = new Decimal(indirectSelfVipOption.spare);
      const highestRate = new Decimal(indirectHighestVipOption.spare);
      const diff = myRate.minus(highestRate);
      return diff.gt(0) ? diff : new Decimal(0);
    } catch (error) {
      console.warn("Failed to calculate indirect rate difference", error);
      return new Decimal(0);
    }
  }, [indirectHighestVipOption?.spare, indirectSelfVipOption?.spare]);

  const indirectCommission = useMemo(() => {
    if (!gameRateDecimal || wagerDecimal.lte(0) || indirectRateDifference.lte(0)) {
      return new Decimal(0);
    }

    return wagerDecimal.mul(BASE_COMMISSION_RATE).mul(indirectRateDifference).mul(gameRateDecimal);
  }, [gameRateDecimal, indirectRateDifference, wagerDecimal]);

  const commissionDecimal = selectedReferralType === "direct" ? directCommission : indirectCommission;

  const formattedCommissionValue = useMemo(() => {
    const value = commissionDecimal.gt(0) ? Number(commissionDecimal.toFixed(5)).toString() : "0.00";
    return formatInputDisplay(value, 5);
  }, [commissionDecimal]);

  const indirectSelfPercent = indirectSelfVipOption?.spare ? new Decimal(indirectSelfVipOption.spare).mul(100).toFixed(1) : undefined;
  const indirectHighestPercent = indirectHighestVipOption?.spare
    ? new Decimal(indirectHighestVipOption.spare).mul(100).toFixed(1)
    : undefined;
  const indirectDifferencePercent = indirectRateDifference.mul(100).toFixed(1);

  useEffect(() => {
    let isCancelled = false;

    const loadImage = (src: string) =>
      new Promise<void>((resolve) => {
        const image = new Image();
        let settled = false;

        const settle = () => {
          if (settled) return;
          settled = true;
          resolve();
        };

        image.onload = settle;
        image.onerror = settle;
        image.src = src;

        if (image.decode) {
          image.decode().then(settle).catch(settle);
        }
      });

    Promise.all(Object.values(infographicByType).map(loadImage)).then(() => {
      if (!isCancelled) {
        setIsInfographicReady(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [infographicByType]);

  const gameSelectPlaceholder = gameCategoriesError
    ? t("common:loadError", "Load failed")
    : isLoadingGameCategories
      ? t("common:loading", "Loading...")
      : t("referral:selectGame", "Select a game");

  const vipSelectPlaceholder = vipConfigError
    ? t("common:loadError", "Load failed")
    : isLoadingVipConfig
      ? t("common:loading", "Loading...")
      : t("referral:selectVipLevel", "Select VIP level");

  const showIndirectBreakdown = selectedReferralType === "indirect" && indirectSelfPercent && indirectHighestPercent;

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-base-200 rounded-field p-3 sm:p-6 flex flex-col gap-5 w-full">
        <div className="flex items-center gap-4">
          <Iconify icon="custom:commission-calculator" className="w-8 h-8 sm:w-13 sm:h-13" />
          <h3 className="text-base sm:text-xl font-bold">{t("referral:commissionCalculator")}</h3>
        </div>

        {selectedReferralType === "direct" && (
          <p className="text-xs sm:text-sm text-base-content/50 block -mt-3">{t("referral:calculatorDirectDescription")}</p>
        )}

        <div className="flex flex-col lg:flex-row lg:flex-nowrap gap-3">
          <div className="flex flex-row gap-3 lg:contents">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <p className="text-xs font-semibold text-base-content/50">{t("referral:referralType")}</p>
              <Select
                className="bg-base-300 rounded-field"
                size="md"
                dropdownClassName="bg-base-100"
                renderOption={(option) => <p className="text-xs sm:text-sm font-semibold flex items-center gap-2">{option?.label}</p>}
                renderValue={(option) => <p className="text-xs sm:text-sm font-semibold flex items-center gap-2">{option?.label}</p>}
                options={[
                  { label: t("referral:direct"), value: "direct" },
                  { label: t("referral:indirect"), value: "indirect" },
                ]}
                value={selectedReferralType}
                onChange={(value) => setSelectedReferralType(String(value) as "direct" | "indirect")}
              />
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <p className="text-xs font-semibold text-base-content/50">{t("referral:gameType")}</p>
              <Select
                className={cn(
                  "bg-base-300 rounded-field",
                  (isLoadingGameCategories || gameCategoriesError) && "opacity-70 pointer-events-none",
                )}
                dropdownClassName="bg-base-100"
                size="md"
                loading={isLoadingGameCategories}
                placeholder={gameSelectPlaceholder}
                options={gameOptions}
                value={selectedGameCategory}
                onChange={(value) => setSelectedGameCategory(String(value))}
                renderOption={(option) => {
                  const gameOption = option as GameSelectOption;
                  return (
                    <div className="flex items-center justify-between gap-3 w-full">
                      <p className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                        <Iconify
                          icon={`custom:${gameOption.name_key || "casino"}`}
                          className="w-4 h-4"
                          fallback={<Iconify icon="custom:casino" className="w-4 h-4" />}
                        />
                        <span>{gameOption.label}</span>
                      </p>
                      {gameOption.spare && (
                        <span className="text-xs sm:text-sm font-semibold">({new Decimal(gameOption.spare).mul(100).toFixed(1)}%)</span>
                      )}
                    </div>
                  );
                }}
                renderValue={(option) => {
                  const gameOption = option as GameSelectOption;
                  return (
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xs sm:text-sm font-semibold">{gameOption?.label}</p>
                      {gameOption?.spare && (
                        <span className="text-xs sm:text-sm font-semibold">({new Decimal(gameOption.spare).mul(100).toFixed(1)}%)</span>
                      )}
                    </div>
                  );
                }}
              />
            </div>
          </div>

          {selectedReferralType === "indirect" && (
            <div className="flex flex-row gap-3 lg:contents">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <p className="text-xs font-semibold text-base-content/50">{t("referral:myCommissionRate")}</p>
                <Select
                  className={cn("bg-base-300 rounded-field", (isLoadingVipConfig || vipConfigError) && "opacity-70 pointer-events-none")}
                  size="md"
                  dropdownClassName="bg-base-100"
                  loading={isLoadingVipConfig}
                  placeholder={vipSelectPlaceholder}
                  options={vipOptions}
                  value={selectedIndirectSelfVip}
                  onChange={(value) => setSelectedIndirectSelfVip(String(value))}
                  renderOption={(option) => {
                    const vipOption = option as VipSelectOption;
                    return (
                      <p className="text-xs sm:text-sm font-semibold flex items-center justify-between w-full">
                        <span>{vipOption.label}</span>
                        {vipOption.spare && (
                          <span className="text-xs sm:text-sm font-semibold">({new Decimal(vipOption.spare).mul(100).toFixed(1)}%)</span>
                        )}
                      </p>
                    );
                  }}
                  renderValue={(option) => {
                    const vipOption = option as VipSelectOption;
                    return (
                      <p className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                        {vipOption?.label}
                        {vipOption?.spare && (
                          <span className="text-xs sm:text-sm font-semibold">({new Decimal(vipOption.spare).mul(100).toFixed(1)}%)</span>
                        )}
                      </p>
                    );
                  }}
                />
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <p className="text-xs font-semibold text-base-content/50">{t("referral:highestLevelInChain")}</p>
                <Select
                  className={cn("bg-base-300 rounded-field", (isLoadingVipConfig || vipConfigError) && "opacity-70 pointer-events-none")}
                  size="md"
                  dropdownClassName="bg-base-100"
                  loading={isLoadingVipConfig}
                  placeholder={vipSelectPlaceholder}
                  options={vipOptions}
                  value={selectedIndirectHighestVip}
                  onChange={(value) => setSelectedIndirectHighestVip(String(value))}
                  renderOption={(option) => {
                    const vipOption = option as VipSelectOption;
                    return (
                      <p className="text-xs sm:text-sm font-semibold flex items-center justify-between w-full">
                        <span>{vipOption.label}</span>
                        {vipOption.spare && (
                          <span className="text-xs sm:text-sm font-semibold">({new Decimal(vipOption.spare).mul(100).toFixed(1)}%)</span>
                        )}
                      </p>
                    );
                  }}
                  renderValue={(option) => {
                    const vipOption = option as VipSelectOption;
                    return (
                      <p className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                        {vipOption?.label}
                        {vipOption?.spare && (
                          <span className="text-xs sm:text-sm font-semibold">({new Decimal(vipOption.spare).mul(100).toFixed(1)}%)</span>
                        )}
                      </p>
                    );
                  }}
                />
              </div>
            </div>
          )}

          {selectedReferralType === "indirect" && (
            <div className="text-xs sm:text-sm text-base-content/50 space-y-2">
              <p>{t("referral:yourIndirectCommissionIsBasedOnTwoKeyFactors")}</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>{t("referral:yourVIPLevelAndCommissionRate")}</li>
                <li>{t("referral:theLevelOfReferrersBetweenYouAndThePlayer")}</li>
              </ol>
            </div>
          )}

          {selectedReferralType === "direct" && (
            <div className="flex flex-col gap-1 min-w-[200px] lg:flex-1 lg:min-w-0">
              <p className="text-xs font-semibold text-base-content/50">
                {t("referral:wager")} <span className="text-primary">({user?.currency_fiat || selectedCurrency})</span>
              </p>
              <div className="flex items-center gap-2">
                <label className="input input-ghost bg-base-300 rounded-field input-md flex items-center gap-2 flex-1">
                  <span className="text-base-content/50 font-semibold text-xs">{currencySymbol}</span>
                  <input
                    type="text"
                    className="grow font-semibold bg-transparent border-none outline-none text-sm"
                    value={formatInputDisplay(selectedWager, 2)}
                    onChange={handleWagerChange}
                    placeholder="0.00"
                  />
                </label>
                <div className="h-10 bg-base-300 rounded-field text-xs text-base-content/50 font-semibold px-2 whitespace-nowrap flex items-center justify-center">
                  <p>x 1% x</p>
                </div>
              </div>
            </div>
          )}

          {selectedReferralType === "direct" && (
            <div className="flex flex-col gap-1 min-w-[200px] lg:flex-1 lg:min-w-0">
              <p className="text-xs font-semibold text-base-content/50">{t("referral:commissionRate")}</p>
              <Select
                className={cn("bg-base-300 rounded-field", (isLoadingVipConfig || vipConfigError) && "opacity-70 pointer-events-none")}
                size="md"
                dropdownClassName="bg-base-100"
                loading={isLoadingVipConfig}
                placeholder={vipSelectPlaceholder}
                options={vipOptions}
                value={selectedDirectVip}
                onChange={(value) => setSelectedDirectVip(String(value))}
                renderOption={(option) => {
                  const vipOption = option as VipSelectOption;
                  return (
                    <p className="text-xs sm:text-sm font-semibold flex items-center justify-between w-full">
                      <span>{vipOption.label}</span>
                      {vipOption.spare && (
                        <span className="text-xs sm:text-sm font-semibold">({new Decimal(vipOption.spare).mul(100).toFixed(1)}%)</span>
                      )}
                    </p>
                  );
                }}
                renderValue={(option) => {
                  const vipOption = option as VipSelectOption;
                  return (
                    <p className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                      {vipOption?.label}
                      {vipOption?.spare && (
                        <span className="text-xs sm:text-sm font-semibold">({new Decimal(vipOption.spare).mul(100).toFixed(1)}%)</span>
                      )}
                    </p>
                  );
                }}
              />
            </div>
          )}

          {selectedReferralType === "direct" && (
            <div className="flex flex-col gap-1 min-w-[180px] lg:w-[200px] lg:flex-none">
              <p className="text-xs font-semibold text-base-content/50">{t("referral:commission")}</p>
              <div className="badge badge-soft h-10 rounded-field w-full text-sm font-semibold flex items-center justify-center">
                {currencySymbol} {formattedCommissionValue}
              </div>
            </div>
          )}
        </div>

        {selectedReferralType === "indirect" && (
          <div className="flex flex-col lg:flex-row lg:flex-nowrap gap-3">
            <div className="flex flex-col gap-1 min-w-[200px] lg:flex-1 lg:min-w-0">
              <p className="text-xs font-semibold text-base-content/50">
                {t("referral:wager")} <span className="text-primary">({user?.currency_fiat || selectedCurrency})</span>
              </p>
              <div className="flex items-center gap-2">
                <label className="input input-ghost bg-base-300 rounded-field input-md flex items-center gap-2 flex-1">
                  <span className="text-base-content/50 font-semibold text-xs">{currencySymbol}</span>
                  <input
                    type="text"
                    className="grow font-semibold bg-transparent border-none outline-none text-sm"
                    value={formatInputDisplay(selectedWager, 2)}
                    onChange={handleWagerChange}
                    placeholder="0.00"
                  />
                </label>
                <div className="h-10 bg-base-300 rounded-field text-xs text-base-content/50 font-semibold px-2 whitespace-nowrap flex items-center justify-center">
                  <p>x 1% x</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 min-w-[200px] lg:flex-1 lg:min-w-0">
              <p className="text-xs font-semibold text-base-content/50">{t("referral:commissionRate")}</p>
              <div className="h-10 bg-base-300 rounded-field text-sm font-semibold flex items-center justify-center">
                {showIndirectBreakdown && (
                  <span>
                    {indirectSelfPercent}% − {indirectHighestPercent}% = {indirectDifferencePercent}%
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1 min-w-[180px] lg:w-[200px] lg:flex-none">
              <p className="text-xs font-semibold text-base-content/50">{t("referral:commission")}</p>
              <div className="badge badge-soft h-10 rounded-field w-full text-sm font-semibold flex items-center justify-center">
                {currencySymbol} {formattedCommissionValue}
              </div>
            </div>
          </div>
        )}

        {selectedReferralType === "indirect" && (
          <p className="text-xs sm:text-sm text-base-content/50 -mt-3">{t("referral:calculatorDescription")}</p>
        )}

        <p className="text-xl font-semibold mt-2">
          {t(`referral:${selectedReferralType === "indirect" ? "indirect" : "direct"}`)} {t("referral:referralCommissions")}
        </p>
        <div className="w-full">
          <div className="flex justify-center" data-infographic-container>
            {isInfographicReady ? (
              <AnimatePresence mode="wait" initial={false}>
                {isInfographicVisible && (
                  <m.img
                    key={selectedReferralType}
                    src={activeInfographicSrc}
                    loading="eager"
                    decoding="async"
                    className="max-w-full h-auto sm:w-[300px]"
                    alt={activeInfographicAlt}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}
              </AnimatePresence>
            ) : (
              isInfographicVisible && (
                <img src={activeInfographicSrc} loading="eager" decoding="async" className="max-w-full h-auto" alt={activeInfographicAlt} />
              )
            )}
          </div>
        </div>

        {selectedReferralType === "direct" && (
          <p className="text-sm text-base-content/50">
            {t(
              "referral:referralCommissionsDirectDescription",
              "To simplify the example, we'll assume the yellow-marked friends are actively wagering, and the green percentages along the dotted lines represent the commission you receive from each of them.",
            )}
          </p>
        )}

        {isInfographicVisible && selectedReferralType === "indirect" && (
          <p className="text-sm text-base-content/50">
            {t(
              "referral:referralCommissionsIndirectDescription",
              "On the right, we can see an example of a breakaway occurring in the referral chain.",
            )}
          </p>
        )}

        <div className="flex items-center justify-center gap-2">
          <button className="btn btn-ghost min-w-50 flex items-center justify-between" onClick={() => setHideInfographic((prev) => !prev)}>
            {hideInfographic ? t("referral:showInfographic", "Show Infographic") : t("referral:hideInfographic", "Hide Infographic")}
            <ChevronDown className={cn("transition-transform duration-200 w-5 h-5", hideInfographic ? "rotate-180" : "")} />
          </button>
        </div>
      </div>

      <ReferralRewardsSchedule />
    </div>
  );
};
