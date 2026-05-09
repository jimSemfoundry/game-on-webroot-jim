import { Eye } from "lucide-react";
import { Trans } from "react-i18next";
import clsx from "clsx";
import { ChangeEvent, useState } from "react";
import { authService } from "@/services/authService.ts";
import { useCurrentUser } from "@/hooks/api/useAuth.ts";
import { sleep } from "@/components/socialLogin/helper.ts";

export const HideGames = ({ onClose }:{ onClose: () => void }) => {
  const { data, refetch } = useCurrentUser();

  const [checked, setCheckbox] = useState(() => {
    const id = data?.user?.id;
    if (!id) return false;

    const value = sessionStorage.getItem(`hide_games_${id}`);
    if (value !== null) return value === "true";

    return data?.user?.is_show_blocked_games === 1;
  });

  const handle = async (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();

    setCheckbox(e.target.checked);

    // 乐观更新
    sessionStorage.setItem(`hide_games_${data?.user?.id}`, String(e.target.checked));

    await sleep(200)

    onClose()

    await authService.updateUser({ is_show_blocked_games: e.target.checked });
    await refetch();
  };

  return (
    data?.user && <button className="justify-between btn btn-md md:btn-lg w-full">
      <div className="flex items-center gap-x-3 overflow-hidden">
        <Eye className="w-5 h-5 text-base-content/70" />
        <div className="text-sm text-left leading-4 whitespace-pre-line">
          <Trans
            i18nKey="menu:hideBlockedGames"
            components={[<span className="text-xs text-base-content/50" />]}
          />
        </div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={handle}
        className={clsx("toggle toggle-xs", checked ? "toggle-primary" : "")}
      />
    </button>
  );
};