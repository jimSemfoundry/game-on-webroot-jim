import { RefreshCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

const safe = (fn: () => void) => {
  try {
    fn();
  } catch {
    // ignore
  }
};

// const safeAsync = async (fn: () => Promise<void>) => {
//   try {
//     await fn();
//   } catch {
//     // ignore
//   }
// };

export const ClearCache = () => {
  const { t } = useTranslation();

  const handleClear = async () => {
    safe(() => {
      window.location.reload();
    });
  };

  return (
    <button
      type="button"
      onClick={() => void handleClear()}
      className="flex items-center justify-between btn btn-md md:btn-lg w-full"
    >
      <div className="flex items-center gap-x-3">
        <RefreshCcw className="w-5 h-5 text-base-content/70" />
        <span className="text-sm">{t('common:clearCache')}</span>
      </div>
    </button>
  );
};