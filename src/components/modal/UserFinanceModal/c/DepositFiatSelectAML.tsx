import { useBoundStore } from "@/store";
import { Trans, useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";

// TODO: 一些法币需要做一下前置的提示给用户
const fiatAMLSet = new Set(["THB", "thb"]);

export const DepositFiatSelectAML = () => {
  const { t } = useTranslation();

  // from data store, share common data
  const depositFiat = useBoundStore((state) => state.depositFiat);

  const fiat = depositFiat?.currency?.currency;

  return fiat && fiatAMLSet.has(fiat) && (<>
    <details
      open
      className="cursor-pointer group collapse text-[12px] bg-base-300 !rounded-lg p-2 text-warning outline-none">
      <summary className="list-none select-none">
        <h4 className={"font-bold flex items-center justify-between gap-4"}>
          ⚠️{' '}{t('finance:read_carefully')}
          <div className="btn btn-square btn-sm bg-base-200 text-base-content/50">
            <ChevronRight
              className="w-4 h-4 transition-transform duration-200 group-open:rotate-90"
            />
          </div>
        </h4>
      </summary>
      <div className={"font-semibold collapse-content p-0 mt-2 text-warning text-[11px] whitespace-pre-line leading-4"}>
        <Trans i18nKey="toast:depositNameEntered" components={[<b className={"text-base-content"} />]} />
      </div>
    </details>
  </>);
};
