import { useDeferredPromptStore } from '@/store/deferredPrompt';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { IoSInstallBox } from './IosInstallBox';
import { isMac, isIOS } from '@/utils/browser';

export const PwaBox = () => {
  const { t } = useTranslation()
  const { deferredPrompt, setDeferredPrompt } = useDeferredPromptStore();
  const [open, setOpen] = useState(false);

  const handleInstallClick = () => {
      if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult: { outcome: string; }) => {
              if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the install prompt');
              } else {
                  console.log('User dismissed the install prompt');
              }
              setDeferredPrompt(null);
          });
      } else {
          setOpen(true);
      }
  };

  return (
      <>
          {
              (isMac() || isIOS()) && (
                  <div className="border border-[#ffffff] rounded-xl w-[170px] h-[59px] px-4 flex items-center gap-3" onClick={handleInstallClick}>
                      <svg width="32" height="35" viewBox="0 0 32 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M28.2444 12.4515C28.058 12.5943 24.7667 14.426 24.7667 18.4987C24.7667 23.2096 28.9547 24.8761 29.0801 24.9174C29.0608 25.019 28.4147 27.1998 26.872 29.4219C25.4963 31.3774 24.0596 33.3296 21.8741 33.3296C19.6885 33.3296 19.126 32.0757 16.6029 32.0757C14.1441 32.0757 13.2699 33.3709 11.2707 33.3709C9.27156 33.3709 7.87664 31.5615 6.2728 29.3394C4.41505 26.73 2.91406 22.6763 2.91406 18.8289C2.91406 12.6578 6.97669 9.38499 10.975 9.38499C13.0996 9.38499 14.8705 10.7627 16.2044 10.7627C17.4739 10.7627 19.4538 9.30245 21.8708 9.30245C22.7869 9.30245 26.0781 9.38499 28.2444 12.4515ZM20.7234 6.68991C21.723 5.51854 22.4301 3.89324 22.4301 2.26794C22.4301 2.04256 22.4108 1.814 22.369 1.62988C20.7427 1.6902 18.8078 2.69966 17.6411 4.03609C16.7251 5.0646 15.8701 6.68991 15.8701 8.33743C15.8701 8.58503 15.9119 8.83264 15.9312 8.912C16.034 8.93105 16.2012 8.95327 16.3683 8.95327C17.8275 8.95327 19.6627 7.98824 20.7234 6.68991Z" fill="white" />
                      </svg>
                      <div className="flex flex-col justify-center">
                          <div className="text-xs font-bold text-base text-white leading-3">{t('casino:availableOn')}</div>
                          <div className="text-xl font-bold text-base text-white leading-5">iPhone</div>
                      </div>
                  </div>
              )
          }
          {
              !(isMac() || isIOS()) && (
                  <div className="border border-[#ffffff] rounded-xl w-[170px] h-[59px] px-4 flex items-center gap-3" onClick={handleInstallClick}>
                      <svg width="32" height="35" viewBox="0 0 32 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M23.5432 22.8209C27.5604 20.5756 30.6325 18.8649 30.895 18.7313C31.7352 18.2769 32.6017 17.074 30.895 16.1385C30.3436 15.8445 27.3767 14.1872 23.5432 12.0488L18.2656 17.4482L23.5432 22.8209Z" fill="#FFDD33" />
                          <path d="M18.2708 17.4482L1.41406 34.7424C1.80791 34.7959 2.25427 34.689 2.7794 34.3949C3.88218 33.7801 15.5926 27.2581 23.5483 22.8209L18.2708 17.4482Z" fill="#FF6666" />
                          <path d="M18.2658 17.4484L23.5434 12.0489C23.5434 12.0489 3.95596 1.16992 2.77441 0.528409C2.32805 0.261111 1.82917 0.180922 1.38281 0.261111L18.2658 17.4484Z" fill="#7BFF7B" />
                          <path d="M18.2683 17.448L1.38531 0.260742C0.702644 0.421121 0.125 1.03591 0.125 2.29221C0.125 4.29694 0.125 31.0267 0.125 32.7107C0.125 33.8601 0.571362 34.6887 1.41157 34.7689L18.2683 17.448Z" fill="#6ED8FF" />
                      </svg>
                      <div className="flex flex-col justify-center">
                          <div className="text-xs font-bold text-base text-white leading-3">{t('casino:availableOn')}</div>
                          <div className="text-xl font-bold text-base text-white leading-5">Android</div>
                      </div>
                  </div>
              )
          }
          <IoSInstallBox open={open} onClose={() => setOpen(false)} />
      </>
  )
}

