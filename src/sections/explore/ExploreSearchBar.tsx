import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import SimpleBar from "simplebar-react";
import type SimpleBarCore from "simplebar";
import "simplebar-react/dist/simplebar.min.css";
import { useTranslation } from "react-i18next";
import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useSidebar } from "@/contexts/SidebarContext";
import { useGameProviders } from "@/hooks/api/usePublic";
import { cn } from "@/utils/themeMerger";
import { ExploreSearchDialog } from "./ExploreSearchDialog";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";

interface ExploreSearchBarProps {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  selectedProviders?: string[];
  setSelectedProviders?: (providers: string[] | ((prev: string[]) => string[])) => void;
  filterParams: Record<string, any>;
  providers?: string;
  gameType?: string;
  activeCategory?: string;
}

interface ProviderOption {
  label: string;
  value: string;
  logo: string;
  dayLogo?: string;
  dayMiniLogo: string;
  nightMiniLogo: string;
  id: string;
}

const normalizeProviderKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const PROVIDER_ALLOWLIST_BY_TYPE: Record<string, string[]> = {
  slots: [
    "jili",
    "pg",
    "pp",
    "evoplay",
    "betsoft",
    "rectangle",
    "spade",
    "bgaming",
    "advantplay",
    "smartsoft",
    "rubyplay",
    "turbo",
    "playson",
    "cq9",
    "hacksaw",
    "relax",
    "nolimitcity",
    "fachai",
    "rich88",
    "bigtimegaming",
    "netent",
    "redtiger",
    "jdb",
    "v8",
    "kmqm",
    "hoyou",
    "joker",
    "mg",
    "belatra",
    "habanero",
    "spinomenal",
    "endorphina",
  ],
  livecasino: [
    "pp",
    "evolution",
    "tvbet",
    "dg",
    "sexy",
    "live88",
    "mg",
    "sv388",
  ],
  fast: [
    "jili",
    "pp",
    "evoplay",
    "fachai",
    "cq9",
    "kmqm",
    "v8",
    "hacksaw",
    "turbo",
    "redtiger",
    "joker",
    "smartsoft",
    "rich88",
    "advantplay",
    "mg",
    "belatra",
    "bgaming",
    "betsoft",
    "relax",
    "jdb",
    "rectangle",
    "spribe",
    "bigtimegaming",
    "spade",
  ],
  fishing: [
    "jili",
    "evoplay",
    "cq9",
    "jdb",
    "joker",
    "spade",
    "v8",
    "fachai",
  ],
};

const getProviderAllowSet = (gameType?: string) => {
  if (!gameType) return null;
  const normalizedType = normalizeProviderKey(gameType);
  const allowList = PROVIDER_ALLOWLIST_BY_TYPE[normalizedType];
  if (!allowList) return null;
  return new Set(allowList.map(normalizeProviderKey));
};

const filterProvidersByType = (options: ProviderOption[], gameType?: string) => {
  const allowSet = getProviderAllowSet(gameType);
  if (!allowSet) return options;
  return options.filter((option) => allowSet.has(normalizeProviderKey(option.value)));
};

export function ExploreSearchBar({
  isSearchOpen,
  setIsSearchOpen,
  selectedProviders = [],
  setSelectedProviders = () => {},
  filterParams,
  providers = "",
  gameType = "",
  activeCategory = "",
}: ExploreSearchBarProps) {
  const { isMobile } = useSidebar();
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const { data: gameProvidersData } = useGameProviders();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const providerScrollRef = useRef<HTMLDivElement>(null);
  const simpleBarRef = useRef<SimpleBarCore | null>(null);
  const providerButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const providerFilterType = useMemo(() => {
    if (gameType === "casino") {
      return activeCategory;
    }
    return gameType;
  }, [activeCategory, gameType]);

  const resolveProviderLogo = useCallback(
    (provider: ProviderOption) => {
      const miniLogo = isDarkTheme ? provider.nightMiniLogo : provider.dayMiniLogo;
      if (miniLogo && miniLogo.trim() !== "") {
        return miniLogo;
      }
      return isDarkTheme ? provider.logo : provider.dayLogo || provider.logo;
    },
    [isDarkTheme]
  );

  const resolveQuickProviderLogo = useCallback(
    (provider: ProviderOption) => {
      // if (!isMobile) {
        if (provider.logo && provider.logo.trim() !== "") {
          return isDarkTheme ? provider.logo : provider.dayLogo || provider.logo;
        }
        return resolveProviderLogo(provider);
      // }
      // return resolveProviderLogo(provider);
    },
    [isDarkTheme, resolveProviderLogo]
  );

  const resolveModalProviderLogo = useCallback((provider: ProviderOption) => {
    if (provider.logo && provider.logo.trim() !== "") {
      return isDarkTheme ? provider.logo : provider.dayLogo || provider.logo;
    }
    return resolveProviderLogo(provider);
  }, [isDarkTheme, resolveProviderLogo]);

  const providerOptions: ProviderOption[] = useMemo(() => {
    const options = (gameProvidersData?.data || []).map((provider: any) => ({
      label: provider.name,
      value: provider.name_key,
      logo: provider.logo,
      dayLogo: provider.day_logo,
      dayMiniLogo: provider.day_mini_logo,
      nightMiniLogo: provider.night_mini_logo,
      id: provider.id,
    }));

    const filteredOptions = filterProvidersByType(options, providerFilterType);

    return filteredOptions;
  }, [gameProvidersData?.data, providerFilterType]);

  const providerAllowSet = useMemo(() => getProviderAllowSet(providerFilterType), [providerFilterType]);

  useEffect(() => {
    if (!providerAllowSet) return;
    const selected = selectedProviders[0];
    if (!selected) return;
    if (!providerAllowSet.has(normalizeProviderKey(selected))) {
      setSelectedProviders([]);
    }
  }, [providerAllowSet, selectedProviders, setSelectedProviders]);

  const selectProvider = useCallback((providerValue: string) => {
    // 单选模式：直接设置选中的provider
    setSelectedProviders([providerValue]);
    // 关闭Modal/Dropdown
    setIsProviderOpen(false);
  }, [setSelectedProviders]);

  const clearAllProviders = useCallback(() => {
    setSelectedProviders([]);
    setIsProviderOpen(false);
  }, [setSelectedProviders]);

  const handleQuickProviderClick = useCallback((providerValue: string) => {
    setSelectedProviders((prev) => (prev[0] === providerValue ? [] : [providerValue]));
  }, [setSelectedProviders]);

  useEffect(() => {
    const getIsDarkTheme = () => {
      const root = document.documentElement;
      return root.getAttribute("data-theme") === "dark" || root.classList.contains("dark");
    };

    setIsDarkTheme(getIsDarkTheme());
    const observer = new MutationObserver(() => {
      setIsDarkTheme(getIsDarkTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"]
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (providers) {
      if (providers.includes('all')) {
        setSelectedProviders([]);
        setIsProviderOpen(true);
        return;
      }

      // 单选模式：只取第一个provider
      const providerList = providers.split(',');
      setSelectedProviders(providerList.length > 0 ? [providerList[0]] : []);
      return;
    }

    setSelectedProviders([]);
  }, [providers, setSelectedProviders]);

  useEffect(() => {
    const selected = selectedProviders[0];
    if (!selected) return;
    const target = providerButtonRefs.current[selected];
    if (!target) return;

    const scrollContainer = isMobile
      ? providerScrollRef.current
      : simpleBarRef.current?.getScrollElement?.();

    if (!scrollContainer) return;
    const id = requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
    return () => cancelAnimationFrame(id);
  }, [isMobile, selectedProviders]);

  const handleOpenSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, [setIsSearchOpen]);

  return (
    <div className="flex items-center gap-1 relative h-[50px] w-full">
      <button className="btn btn-square btn-md md:btn-lg text-base-content" onClick={() => setIsProviderOpen(true)}>
        <FilterListIcon />
      </button>

      {isMobile ? (
        <div ref={providerScrollRef} className="flex-1 overflow-x-auto hide-scrollbar overflow-y-visible">
          <div className="flex items-center gap-1 min-w-max py-1">
            {providerOptions.map((option: ProviderOption) => {
              const isSelected = selectedProviders.includes(option.value);
              const logoUrl = resolveQuickProviderLogo(option);

              return (
                <button
                  key={option.value}
                  ref={(node) => {
                    providerButtonRefs.current[option.value] = node;
                  }}
                  type="button"
                  className={cn(
                    "w-26 h-10 md:w-30 md:h-12 px-1 rounded-field bg-base-200 flex items-center justify-center transition-all duration-200 ease-out hover:-translate-y-1",
                    isSelected ? "border border-primary" : "hover:bg-base-300"
                  )}
                  onClick={() => handleQuickProviderClick(option.value)}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt={option.label} className="w-auto h-8 md:w-30 md:h-9 object-contain" />
                  ) : (
                    <span className="text-xs font-semibold">{option.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <SimpleBar ref={simpleBarRef} className="flex-1 provider-simplebar overflow-y-visible" autoHide={true} forceVisible="x">
          <div className="flex items-center gap-1 min-w-max py-1">
            {providerOptions.map((option: ProviderOption) => {
              const isSelected = selectedProviders.includes(option.value);
              const logoUrl = resolveQuickProviderLogo(option);

              return (
                <button
                  key={option.value}
                  ref={(node) => {
                    providerButtonRefs.current[option.value] = node;
                  }}
                  type="button"
                  className={cn(
                    "w-26 h-10 md:w-30 md:h-12 md:px-2 rounded-field bg-base-200 flex items-center justify-center transition-all duration-200 ease-out hover:-translate-y-1",
                    isSelected ? "border border-primary" : "hover:bg-base-300"
                  )}
                  onClick={() => handleQuickProviderClick(option.value)}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt={option.label} className="w-auto h-8 md:w-30 md:h-9 object-contain" />
                  ) : (
                    <span className="text-xs font-semibold">{option.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </SimpleBar>
      )}

      <button className="btn btn-square btn-md md:btn-lg bg-base-200 text-primary" onClick={handleOpenSearch}>
        <Search size={18} />
      </button>

      <ExploreProviderModal
        isOpen={isProviderOpen}
        onClose={() => setIsProviderOpen(false)}
        providerOptions={providerOptions}
        selectedProviders={selectedProviders}
        selectProvider={selectProvider}
        clearAllProviders={clearAllProviders}
        resolveProviderLogo={resolveModalProviderLogo}
      />

      <ExploreSearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        baseFilters={filterParams}
      />
    </div>
  );
}

interface ExploreProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerOptions: ProviderOption[];
  selectedProviders: string[];
  selectProvider: (value: string) => void;
  clearAllProviders: () => void;
  resolveProviderLogo: (provider: ProviderOption) => string;
}

function ExploreProviderModal({
  isOpen,
  onClose,
  providerOptions,
  selectedProviders,
  selectProvider,
  clearAllProviders,
  resolveProviderLogo,
}: ExploreProviderModalProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={cn("bg-base-400 mx-auto overflow-hidden", isPWA ? "!max-h-[90vh]" : "!max-h-[80vh]")}
      position={isMobile ? 'modal-bottom' : 'modal-middle'}
      title={
        <div className="flex items-center gap-2">
          <Iconify icon="custom:game" width={16} height={16} className="text-primary" />
          <p className="text-base md:text-xl font-bold">{t("explore:providers")}</p>
        </div>
      }
    >
      <div className="flex flex-col overflow-hidden" style={{ maxHeight: isMobile ? (isPWA ? 'calc(90vh - 100px)' : 'calc(80vh - 120px)') : '60vh' }}>
        <div className="overflow-y-auto hide-scrollbar">
          <div className="bg-base-300 rounded-field p-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div
                className={cn(
                  "rounded-field p-3 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 border border-solid h-[62px]",
                  selectedProviders.length === 0 ? "border-primary bg-primary/10" : "border-transparent bg-base-200 hover:bg-base-300"
                )}
                onClick={() => clearAllProviders()}
              >
                <span className="text-xs font-semibold">{t("explore:all")}</span>
              </div>
              {providerOptions.map((option: ProviderOption) => {
                const isSelected = selectedProviders.includes(option.value);
                const logoUrl = resolveProviderLogo(option);

                return (
                  <div
                    key={option.value}
                    className={cn(
                      "rounded-field p-3 cursor-pointer transition-all flex flex-col items-center gap-2 border border-solid h-[62px]",
                      isSelected ? "border-primary bg-primary/10" : "border-transparent bg-base-200 hover:bg-base-300"
                    )}
                    onClick={() => selectProvider(option.value)}
                  >
                    {logoUrl ? (
                      <img src={logoUrl} alt={option.label} className="w-full h-10 object-contain" />
                    ) : (
                      <span className="text-xs font-semibold">{option.label}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function FilterListIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.625 6.75C2.625 6.12868 3.12868 5.625 3.75 5.625C4.37132 5.625 4.875 6.12868 4.875 6.75C4.875 7.37132 4.37132 7.875 3.75 7.875C3.12868 7.875 2.625 7.37132 2.625 6.75ZM7.5 6.75C7.5 6.33579 7.83579 6 8.25 6H20.25C20.6642 6 21 6.33579 21 6.75C21 7.16421 20.6642 7.5 20.25 7.5H8.25C7.83579 7.5 7.5 7.16421 7.5 6.75ZM2.625 12C2.625 11.3787 3.12868 10.875 3.75 10.875C4.37132 10.875 4.875 11.3787 4.875 12C4.875 12.6213 4.37132 13.125 3.75 13.125C3.12868 13.125 2.625 12.6213 2.625 12ZM7.5 12C7.5 11.5858 7.83579 11.25 8.25 11.25H20.25C20.6642 11.25 21 11.5858 21 12C21 12.4142 20.6642 12.75 20.25 12.75H8.25C7.83579 12.75 7.5 12.4142 7.5 12ZM2.625 17.25C2.625 16.6287 3.12868 16.125 3.75 16.125C4.37132 16.125 4.875 16.6287 4.875 17.25C4.875 17.8713 4.37132 18.375 3.75 18.375C3.12868 18.375 2.625 17.8713 2.625 17.25ZM7.5 17.25C7.5 16.8358 7.83579 16.5 8.25 16.5H20.25C20.6642 16.5 21 16.8358 21 17.25C21 17.6642 20.6642 18 20.25 18H8.25C7.83579 18 7.5 17.6642 7.5 17.25Z"
        fill="currentColor"
      />
    </svg>
  );
}
