import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useSidebar } from "@/contexts/SidebarContext";
import { useGameProviders } from "@/hooks/api/usePublic";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/utils/themeMerger";
import { ChevronDown, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ExploreSearchDialog } from "./ExploreSearchDialog";
import { useRef } from "react";

interface ExploreSearchBarProps {
  sortValue: string;
  setSortValue: (value: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  selectedProviders?: string[];
  setSelectedProviders?: (providers: string[] | ((prev: string[]) => string[])) => void;
  filterParams: Record<string, any>;
  providers?: string;
}

interface ProviderOption {
  label: string;
  value: string;
  logo: string;
  id: string;
}

export function ExploreSearchBar({
  sortValue,
  setSortValue,
  isSearchOpen,
  setIsSearchOpen,
  selectedProviders = [],
  setSelectedProviders = () => {},
  filterParams,
  providers = "",
}: ExploreSearchBarProps) {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: "toggle" | "remove"; value: string } | null>(null);

  const debouncedAction = useDebounce(pendingAction, 200);
  const { data: gameProvidersData } = useGameProviders();
  const providerDropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = useMemo(
    () => [
      { label: t("explore:popular"), value: "popular" },
      { label: "A - Z", value: "az" },
      { label: "Z - A", value: "za" },
      { label: t("explore:newest"), value: "newest" },
    ],
    []
  );

  const providerOptions: ProviderOption[] = useMemo(
    () =>
      (gameProvidersData?.data || []).map((provider: any) => ({
        label: provider.name,
        value: provider.name_key,
        logo: provider.logo,
        id: provider.id,
      })),
    [gameProvidersData?.data]
  );

  const toggleProvider = useCallback((providerValue: string) => {
    setPendingAction({ type: "toggle", value: providerValue });
  }, []);

  const removeProvider = useCallback((providerValue: string) => {
    setPendingAction({ type: "remove", value: providerValue });
  }, []);

  const clearAllProviders = useCallback(() => {
    setSelectedProviders([]);
  }, [setSelectedProviders]);

  const getButtonLabel = useCallback(() => {
    if (selectedProviders.length === 0) return `${t("casino:provider")}: ${t("explore:all")}`;
    if (selectedProviders.length === 1) {
      const provider = providerOptions.find((opt) => opt.value === selectedProviders[0]);
      return provider?.label || selectedProviders[0];
    }
    return `${selectedProviders.length} ${t("explore:selected")}`;
  }, [selectedProviders, providerOptions, t]);

  useEffect(() => {
    if (!debouncedAction) return;

    setPendingAction(null);

    if (debouncedAction.type === "toggle") {
      setSelectedProviders((prev: string[]) => {
        const isSelected = prev.includes(debouncedAction.value);
        return isSelected ? prev.filter((p) => p !== debouncedAction.value) : [...prev, debouncedAction.value];
      });
    } else if (debouncedAction.type === "remove") {
      setSelectedProviders((prev: string[]) => prev.filter((p) => p !== debouncedAction.value));
    }
  }, [debouncedAction, setSelectedProviders]);

  const openDropdown = () => {
    if (providerDropdownRef.current) {
      providerDropdownRef.current.classList.add('dropdown-open');
      providerDropdownRef.current.focus();
      providerDropdownRef.current.click();
    }
  };

  const closeDropdown = () => {
    if (providerDropdownRef.current) {
      providerDropdownRef.current.classList.remove('dropdown-open');
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  useEffect(() => {
    if (providers) {
      setSelectedProviders(providers.split(','));
      if (providers.includes('all')) {
        setIsProviderOpen(true);
        openDropdown();
        setSelectedProviders([]);
      }
    } else {
      setSelectedProviders([]);
    }
  }, [providers]);

  const handleOpenSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, [setIsSearchOpen]);

  return (
    <div className="flex items-center gap-2 relative h-10 md:min-w-[320px] md:justify-end">
      <div className="flex items-center gap-2 flex-1 md:flex-initial h-full">
        <Select
          className="flex-1/2 md:w-auto"
          optionClassName="font-semibold text-xs"
          size="md"
          variant="primary"
          options={sortOptions}
          value={sortValue}
          renderValue={(option) => <p className="text-xs sm:text-sm">{`${t("explore:sort")}: ${option.label}`}</p>}
          onChange={(value) => setSortValue(value as string)}
        />

        {isMobile ? (
          <>
            <button className="flex-1/2 md:w-auto btn btn-md justify-between" onClick={() => setIsProviderOpen(true)}>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold truncate">{getButtonLabel()}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>

            <ExploreProviderModal
              isOpen={isProviderOpen}
              onClose={() => setIsProviderOpen(false)}
              providerOptions={providerOptions}
              selectedProviders={selectedProviders}
              toggleProvider={toggleProvider}
              removeProvider={removeProvider}
              clearAllProviders={clearAllProviders}
            />
          </>
        ) : (
          <div ref={providerDropdownRef} className="dropdown dropdown-end cursor-pointer z-10 w-1/2 md:w-auto">
            <div tabIndex={0} role="button" className="btn btn-md justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold truncate">{getButtonLabel()}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div tabIndex={0} className="dropdown-content card bg-base-300 card-xs md:card-sm z-1 w-[375px] h-[742px] shadow-sm">
              <div className="card-body h-full flex flex-col">
                <div className="flex items-center gap-2 shrink-0">
                  <Iconify icon="custom:game" width={16} height={16} className="text-primary" />
                  <p className="text-base md:text-xl font-bold">{t("explore:providers")}</p>
                  <button className="btn btn-sm btn-square ms-auto" onClick={closeDropdown}>
                    <X className="w-4 h-4 text-base-content/50" />
                  </button>
                </div>

                {selectedProviders.length > 0 && (
                  <div className="mb-2 pb-2 border-b border-base-content/10 shrink-0">
                    <div className="flex flex-wrap gap-1 items-center">
                      {selectedProviders.map((provider) => {
                        const option = providerOptions.find((opt) => opt.value === provider);
                        return option ? (
                          <div key={provider} className="badge badge-xl gap-1">
                            <span className="text-xs font-semibold">{option.label}</span>
                            <button
                              onMouseDown={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                                removeProvider(provider);
                              }}
                              className="hover:bg-primary-content/20 rounded-full p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : null;
                      })}
                      <button
                        onMouseDown={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                          clearAllProviders();
                        }}
                        className="btn bg-base-100 btn-square btn-sm flex items-center justify-center"
                        title={t("common:common.clear")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto min-h-0">
                  {providerOptions.map((option: ProviderOption) => {
                    const isSelected = selectedProviders.includes(option.value);

                    return (
                      <div
                        key={option.value}
                        className={cn(
                          "rounded-field p-3 cursor-pointer transition-all flex flex-col items-center gap-2 border border-solid h-[62px]",
                          isSelected ? "border-primary bg-primary/10" : "border-transparent bg-base-200 hover:bg-base-300",
                          pendingAction?.value === option.value && "pointer-events-none opacity-75",
                        )}
                        onClick={() => toggleProvider(option.value)}
                      >
                        {option.logo ? <img src={option.logo} alt={option.label} className="w-full h-10 object-contain" /> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button className="btn btn-square btn-md btn-primary" onClick={handleOpenSearch}>
        <Search size={18} />
      </button>

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
  toggleProvider: (value: string) => void;
  removeProvider: (value: string) => void;
  clearAllProviders: () => void;
}

function ExploreProviderModal({
  isOpen,
  onClose,
  providerOptions,
  selectedProviders,
  toggleProvider,
  removeProvider,
  clearAllProviders,
}: ExploreProviderModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="bg-base-400 md:w-[375px] max-w-sm mx-auto overflow-hidden"
      position="modal-bottom"
      title={
        <div className="flex items-center gap-2">
          <Iconify icon="custom:game" width={16} height={16} className="text-primary" />
          <p className="text-base md:text-xl font-bold">{t("explore:providers")}</p>
        </div>
      }
    >
      <div className="flex flex-col max-h-[75vh] overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto">
          {selectedProviders.length > 0 && (
            <div className="sticky top-0 z-10 bg-base-400 pt-1 pb-4">
              <div className="flex flex-wrap gap-1 items-center">
                {selectedProviders.map((provider) => {
                  const option = providerOptions.find((opt) => opt.value === provider);
                  return option ? (
                    <div key={provider} className="badge badge-xl gap-1">
                      <span className="text-xs font-semibold">{t(option.label)}</span>
                      <button
                        onMouseDown={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                          removeProvider(provider);
                        }}
                        className="hover:bg-primary-content/20 rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : null;
                })}
                <button
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    clearAllProviders();
                  }}
                  className="btn bg-base-100 btn-square btn-sm flex items-center justify-center"
                  title={t("common:common.clear")}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="bg-base-300 rounded-field p-2">
            <div className="grid grid-cols-2 gap-2">
              {providerOptions.map((option: ProviderOption) => {
                const isSelected = selectedProviders.includes(option.value);

                return (
                  <div
                    key={option.value}
                    className={cn(
                      "rounded-field p-3 cursor-pointer transition-all flex flex-col items-center gap-2 border border-solid h-[62px]",
                      isSelected ? "border-primary bg-primary/10" : "border-transparent bg-base-200 hover:bg-base-300",
                    )}
                    onClick={() => toggleProvider(option.value)}
                  >
                    {option.logo ? <img src={option.logo} alt={option.label} className="w-full h-10 object-contain" /> : null}
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
