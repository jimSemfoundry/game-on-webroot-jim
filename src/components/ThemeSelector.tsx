import { useTheme } from "../contexts/ThemeContext";

export default function ThemeSelector() {
  const { state, getAvailableThemes, switchTheme } = useTheme();

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost">
        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9M21 9H9M21 13H9M21 17H9"
          />
        </svg>
        Theme
      </div>
      <ul tabIndex={0} className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-64 max-h-96 overflow-y-auto">
        <li className="menu-title">
          <span>Current: {state.currentTheme}</span>
        </li>

        <div className="divider my-1"></div>

        <li className="menu-title">
          <span>Available Themes</span>
        </li>
        {getAvailableThemes().map((themeName) => {
          const theme = state.availableThemes[themeName];
          return (
            <li key={themeName} onClick={() => switchTheme(themeName)}>
              <div className={`flex items-center gap-2 p-2 ${state.currentTheme === themeName ? "bg-primary/20 rounded" : ""}`}>
                <div
                  className="w-4 h-4 rounded-full border border-base-content/20"
                  style={{
                    background: `linear-gradient(45deg, ${theme.colors.primary} 25%, ${theme.colors.secondary} 75%)`,
                  }}
                />
                <span className="capitalize flex-1">{themeName}</span>
                {state.currentTheme === themeName && <span className="text-primary text-xs">✓ Active</span>}
              </div>
            </li>
          );
        })}

        <div className="divider my-1"></div>

        {state.runtimeConfig && (
          <li>
            <div className="text-xs opacity-60 p-2 bg-base-200 rounded">
              <div>Brand: {state.runtimeConfig.brandConfig?.brandName || "Default"}</div>
              <div>
                Updated:{" "}
                {state.runtimeConfig.brandConfig?.lastUpdated
                  ? new Date(state.runtimeConfig.brandConfig.lastUpdated).toLocaleString()
                  : "N/A"}
              </div>
              {state.runtimeConfig.customOverrides && Object.keys(state.runtimeConfig.customOverrides).length > 0 && (
                <div className="text-accent">Custom overrides applied</div>
              )}
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}
