import { useTranslation } from "react-i18next";

import { Modal } from '@/components/ui/Modal';
import { getFaviconAppleUrl } from '@/utils/assetPaths';

export const IoSInstallBox = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={open} onClose={onClose} position="modal-bottom" className=" p-0 bg-base-400" hideTitle>
      <div className="flex flex-col gap-8 items-center justify-center py-4">
        <div className="max-w-[294px] w-[78.4%] relative ">
          <img src="/images/pwa/iosBoxImg.png" alt="" />
          <div className="absolute top-[137.2px] left-[50%] w-[120px] h-[120px] translate-x-[-50%] rounded-2xl overflow-hidden">
            <img src={getFaviconAppleUrl(import.meta.env.VITE_THEME ?? "1stgame")} alt="" className="w-full h-full object-contain" />
          </div>
        </div>

        <div>
          <div
            className="text-lg font-bold text-base-content/50"
            dangerouslySetInnerHTML={{
              __html: t("casino:addTo", {
                appName: `<span class="text-primary"> ${import.meta.env.VITE_WEBSITE_NICKNAME_LEFT || "1ST."}</span><span class="text-base-content">${import.meta.env.VITE_WEBSITE_NICKNAME_RIGHT || "GAME"} </span>`
              })
            }}
          />
          <div className="text-lg font-bold text-base-content/50 text-center">{t("casino:yourHomeScreen")}</div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-base text-base-content/50 leading-4.5 flex items-center">
            <span className="w-4 text-center">1.</span>
            <span>{t("casino:tap")}</span>
            <span className="px-2">
              <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.10225 1.28975C9.32192 1.07008 9.67808 1.07008 9.89775 1.28975L12.1477 3.53975C12.3674 3.75942 12.3674 4.11558 12.1477 4.33525C11.9281 4.55492 11.5719 4.55492 11.3523 4.33525L10.0625 3.0455L10.0625 11.25C10.0625 11.5607 9.81066 11.8125 9.5 11.8125C9.18934 11.8125 8.9375 11.5607 8.9375 11.25L8.9375 3.0455L7.64775 4.33525C7.42808 4.55492 7.07192 4.55492 6.85225 4.33525C6.63258 4.11558 6.63258 3.75942 6.85225 3.53975L9.10225 1.28975ZM6.125 6.75C5.50368 6.75 5 7.25368 5 7.875V14.625C5 15.2463 5.50368 15.75 6.125 15.75H12.875C13.4963 15.75 14 15.2463 14 14.625V7.875C14 7.25368 13.4963 6.75 12.875 6.75H11.75C11.4393 6.75 11.1875 6.49816 11.1875 6.1875C11.1875 5.87684 11.4393 5.625 11.75 5.625H12.875C14.1176 5.625 15.125 6.63236 15.125 7.875V14.625C15.125 15.8676 14.1176 16.875 12.875 16.875H6.125C4.88236 16.875 3.875 15.8676 3.875 14.625V7.875C3.875 6.63236 4.88236 5.625 6.125 5.625H7.25C7.56066 5.625 7.8125 5.87684 7.8125 6.1875C7.8125 6.49816 7.56066 6.75 7.25 6.75H6.125Z"
                  fill="var(--color-base-content)"
                />
              </svg>
            </span>
            <span>{t("casino:inTheBottomBar")}</span>
          </p>
          <p className="text-base text-base-content/50 leading-4.5 flex items-center">
            <span className="w-4 text-center">2.</span>
            <span>{t("casino:select")}</span>
            <span className="px-2">
              <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 2.625C14.364 2.625 15.875 4.13604 15.875 6V12C15.875 13.864 14.364 15.375 12.5 15.375H6.5C4.63604 15.375 3.125 13.864 3.125 12V6C3.125 4.13604 4.63604 2.625 6.5 2.625H12.5Z" stroke="var(--color-base-content)" strokeWidth="0.75" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.5 5.625C9.70711 5.625 9.875 5.79289 9.875 6V8.625L12.5 8.625C12.7071 8.625 12.875 8.79289 12.875 9C12.875 9.20711 12.7071 9.375 12.5 9.375L9.875 9.375V12C9.875 12.2071 9.70711 12.375 9.5 12.375C9.29289 12.375 9.125 12.2071 9.125 12V9.375L6.5 9.375C6.29289 9.375 6.125 9.20711 6.125 9C6.125 8.79289 6.29289 8.625 6.5 8.625L9.125 8.625V6C9.125 5.79289 9.29289 5.625 9.5 5.625Z"
                  fill="var(--color-base-content)"
                />
              </svg>
            </span>
            <span className="text-base-content">{t("casino:addHomeScreen")}</span>
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center w-18 h-[30px] rounded-lg rounded-xl justify-center" style={{ background: "color(display-p3 0.000 0.478 1.000)" }}>
            <span className="text-base-content pr-1">{t("casino:tap")}</span>
            <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.10225 1.28975C9.32192 1.07008 9.67808 1.07008 9.89775 1.28975L12.1477 3.53975C12.3674 3.75942 12.3674 4.11558 12.1477 4.33525C11.9281 4.55492 11.5719 4.55492 11.3523 4.33525L10.0625 3.0455L10.0625 11.25C10.0625 11.5607 9.81066 11.8125 9.5 11.8125C9.18934 11.8125 8.9375 11.5607 8.9375 11.25L8.9375 3.0455L7.64775 4.33525C7.42808 4.55492 7.07192 4.55492 6.85225 4.33525C6.63258 4.11558 6.63258 3.75942 6.85225 3.53975L9.10225 1.28975ZM6.125 6.75C5.50368 6.75 5 7.25368 5 7.875V14.625C5 15.2463 5.50368 15.75 6.125 15.75H12.875C13.4963 15.75 14 15.2463 14 14.625V7.875C14 7.25368 13.4963 6.75 12.875 6.75H11.75C11.4393 6.75 11.1875 6.49816 11.1875 6.1875C11.1875 5.87684 11.4393 5.625 11.75 5.625H12.875C14.1176 5.625 15.125 6.63236 15.125 7.875V14.625C15.125 15.8676 14.1176 16.875 12.875 16.875H6.125C4.88236 16.875 3.875 15.8676 3.875 14.625V7.875C3.875 6.63236 4.88236 5.625 6.125 5.625H7.25C7.56066 5.625 7.8125 5.87684 7.8125 6.1875C7.8125 6.49816 7.56066 6.75 7.25 6.75H6.125Z"
                fill="var(--color-base-content)"
              />
            </svg>
          </div>
          <svg width="7" height="4" viewBox="0 0 7 4" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.69434 1.5L3.5 1.72168L3.30566 1.5H3.69434Z" stroke="#007AFF" style={{ stroke: "#007AFF", strokeWidth: "3" }} />
          </svg>
        </div>
      </div>
    </Modal>
  );
};
