import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isIOS, isMobile } from "@/utils/browser";
import { toast } from "sonner";
import { useReferralLink } from "@/hooks/useReferralLink";
import QRCode from "qrcode";
import { getImgCompressParams } from "@/utils/helper";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { Trans, useTranslation } from 'react-i18next';
import { useMqttTopicMessagesReadonly, useMqttService } from "@/contexts/mqtt";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { authService } from "@/services/authService";
import { isTelegramWebApp, openExternalUrl as openExternalUrlInTMA } from "@/utils/telegramWebApp";

const isStandalonePwa = () => {
  const isIosStandalone = typeof (navigator as any)?.standalone === 'boolean' && (navigator as any).standalone;
  const isDisplayModeStandalone = typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)')?.matches;
  return Boolean(isIosStandalone || isDisplayModeStandalone);
}

export const getExternalLinkTarget = () => {
  return isStandalonePwa() ? '_self' : '_blank';
}

const DEEP_LINK_FALLBACK_DELAY = 1200;

export const openDeepLinkWithFallback = (deepLink: string, fallbackUrl: string, fallbackTarget: '_self' | '_blank' = '_blank') => {
  if (!deepLink || !fallbackUrl) return;

  // TMA 环境下直接用外部浏览器打开 fallback URL，避免内部跳转导致无法返回
  if (isTelegramWebApp()) {
    openExternalUrlInTMA(fallbackUrl);
    return;
  }

  let shouldFallback = true;
  let fallbackTab: Window | null = null;
  const shouldPreOpenFallbackTab = fallbackTarget === '_blank' && !(isMobile() && isIOS());

  if (shouldPreOpenFallbackTab) {
    fallbackTab = window.open('', '_blank');
  }

  const markAsOpened = () => {
    if (document.hidden) {
      shouldFallback = false;
    }
  };

  const markPageHidden = () => {
    shouldFallback = false;
  };

  const markWindowBlur = () => {
    shouldFallback = false;
  };

  document.addEventListener('visibilitychange', markAsOpened, true);
  window.addEventListener('pagehide', markPageHidden, true);
  window.addEventListener('blur', markWindowBlur, true);

  window.location.assign(deepLink);

  window.setTimeout(() => {
    document.removeEventListener('visibilitychange', markAsOpened, true);
    window.removeEventListener('pagehide', markPageHidden, true);
    window.removeEventListener('blur', markWindowBlur, true);

    if (!shouldFallback) {
      fallbackTab?.close();
      return;
    }

    if (fallbackTarget === '_blank') {
      if (fallbackTab) {
        fallbackTab.location.assign(fallbackUrl);
      } else {
        const openedTab = window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
        if (!openedTab) {
          window.location.assign(fallbackUrl);
        }
      }
      return;
    }

    window.location.assign(fallbackUrl);
  }, DEEP_LINK_FALLBACK_DELAY);
}

export const openExternalUrl = (url: string) => {
  if (!url) return;
  if (getExternalLinkTarget() === '_self') {
    window.location.assign(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

const loadImage = (src: string, crossOrigin?: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const WIN_IMAGE_CONFIG: Record<string, { image: string; color: string }> = {
  bigwin: { image: '/images/referral/big-win.png', color: '#008E31' },
  mega: { image: '/images/referral/mega-win.png', color: '#E72B2B' },
  supermega: { image: '/images/referral/super-win.png', color: '#D102BD' },
};

const QR_LOGO = `/favicon/${import.meta.env.VITE_THEME || '1stgame'}/web-app-manifest-192x192.png`;
const WEBSITE_NICKNAME = import.meta.env.VITE_WEBSITE_NICKNAME || '1st.game';

const SCALE = 2;
const s = (v: number) => v * SCALE;

const CANVAS_SIZE = s(335);
const QR_SIZE = s(80);
const QR_MARGIN_RIGHT = s(35);
const QR_MARGIN_BOTTOM = s(29);
const QR_RADIUS = s(12);
const QR_PADDING = s(4);
const LOGO_SIZE = s(18);

const GAME_IMG_X = s(13);
const GAME_IMG_Y = s(89);
const GAME_IMG_W = s(87);
const GAME_IMG_H = s(117);
const GAME_IMG_RADIUS = s(12);

const LIGHTNING_IMAGE = '/images/referral/lightning.png';
const LIGHTNING_WIDTH = s(221);
const LIGHTNING_HEIGHT = s(125);
const LIGHTNING_MARGIN_RIGHT = s(12);
const LIGHTNING_Y = s(85);

const PERCENTAGE_FONT_SIZE = s(28);
const PRIZE_FONT_SIZE = s(24);
const TEXT_GAP = s(6);
const TEXT_SHADOW_OFFSET_PCT = s(2);
const TEXT_SHADOW_OFFSET_PRIZE = s(4);
const STROKE_WIDTH = s(4);

const SHARE_TEXT_BLOCK_WIDTH = s(180);
const SHARE_TEXT_GAP = s(8);
const LINE_HEIGHT = s(20);
const SHARE_TEXT_FONT_SIZE = s(16);

const DOWNLOAD_PLATFORMS = new Set(['youtube', 'instagram', 'download']);

const WIN_TYPE_IMAGE_TYPE_MAP: Record<string, string> = {
  bigwin: 'Big Win',
  mega: 'Mega Win',
  supermega: 'Super Mega Win',
};

const SOCIAL_ICONS = [
  { id: 'facebook', icon: 'facebook.svg' },
  { id: 'instagram', icon: 'instagram.svg' },
  { id: 'whatsapp', icon: 'whatsapp.svg' },
  { id: 'x', icon: 'twitter.svg' },
  { id: 'telegram', icon: 'telegram.svg' },
  { id: 'download', icon: 'download.svg' },
] as const;

const getPercentage = (multiplier: number) => `${multiplier} X`;

const drawGameImage = (ctx: CanvasRenderingContext2D, gameImg: HTMLImageElement) => {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(GAME_IMG_X, GAME_IMG_Y, GAME_IMG_W, GAME_IMG_H, GAME_IMG_RADIUS);
  ctx.clip();
  ctx.drawImage(gameImg, GAME_IMG_X, GAME_IMG_Y, GAME_IMG_W, GAME_IMG_H);
  ctx.restore();
};

const drawLightningWithText = (
  ctx: CanvasRenderingContext2D,
  lightningImg: HTMLImageElement,
  multiplier: number,
  winAmountUsdt: string,
  winColor: string,
  canvasWidth: number,
) => {
  const lightningX = canvasWidth - LIGHTNING_WIDTH - LIGHTNING_MARGIN_RIGHT;
  ctx.drawImage(lightningImg, lightningX, LIGHTNING_Y, LIGHTNING_WIDTH, LIGHTNING_HEIGHT);

  const textX = lightningX + LIGHTNING_WIDTH / 2;
  const lightningCenterY = LIGHTNING_Y + LIGHTNING_HEIGHT / 2;
  const combinedHeight = PERCENTAGE_FONT_SIZE + TEXT_GAP + PRIZE_FONT_SIZE;
  const startY = lightningCenterY - combinedHeight / 2;

  const percentageY = startY + PERCENTAGE_FONT_SIZE / 2;
  const percentageText = getPercentage(multiplier);

  ctx.font = `italic 900 ${PERCENTAGE_FONT_SIZE}px Montserrat, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#000000';
  ctx.fillText(percentageText, textX, percentageY + TEXT_SHADOW_OFFSET_PCT);

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = STROKE_WIDTH;
  ctx.strokeText(percentageText, textX, percentageY);

  ctx.fillStyle = winColor;
  ctx.fillText(percentageText, textX, percentageY);

  const prizeY = startY + PERCENTAGE_FONT_SIZE + TEXT_GAP + PRIZE_FONT_SIZE / 2;

  ctx.font = `italic 900 ${PRIZE_FONT_SIZE}px Montserrat, sans-serif`;

  ctx.fillStyle = '#000000';
  ctx.fillText(winAmountUsdt, textX, prizeY + TEXT_SHADOW_OFFSET_PRIZE);

  ctx.fillStyle = '#FFE500';
  ctx.fillText(winAmountUsdt, textX, prizeY);
};

const drawQrCode = async (
  ctx: CanvasRenderingContext2D,
  referralLink: string,
  logoImg: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
) => {
  const qrDataUrl = await QRCode.toDataURL(referralLink, {
    width: QR_SIZE,
    margin: 1,
    errorCorrectionLevel: 'H',
    color: { dark: '#000000', light: '#FFFFFF' },
  });

  const qrImg = await loadImage(qrDataUrl);
  const qrX = canvasWidth - QR_SIZE - QR_MARGIN_RIGHT;
  const qrY = canvasHeight - QR_SIZE - QR_MARGIN_BOTTOM;

  const bgX = qrX - QR_PADDING;
  const bgY = qrY - QR_PADDING;
  const bgSize = QR_SIZE + QR_PADDING * 2;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(bgX, bgY, bgSize, bgSize, QR_RADIUS);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.closePath();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(qrX, qrY, QR_SIZE, QR_SIZE, QR_RADIUS - 2);
  ctx.clip();
  ctx.drawImage(qrImg, qrX, qrY, QR_SIZE, QR_SIZE);
  ctx.restore();

  const logoX = qrX + (QR_SIZE - LOGO_SIZE) / 2;
  const logoY = qrY + (QR_SIZE - LOGO_SIZE) / 2;
  ctx.drawImage(logoImg, logoX, logoY, LOGO_SIZE, LOGO_SIZE);

  return { bgX, qrY };
};

const drawShareText = (ctx: CanvasRenderingContext2D, shareLang: string, bgX: number, qrY: number) => {
  const textColor = '#FFFFFF';
  const websiteColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();

  const shareLangWords = shareLang.split(' ').filter(Boolean).map(w => ({ text: w, color: textColor }));
  const nicknameWords = WEBSITE_NICKNAME
    ? WEBSITE_NICKNAME.split(' ').filter(Boolean).map((w: string) => ({ text: w, color: websiteColor }))
    : [];
  const allWords = [...shareLangWords, ...nicknameWords];

  ctx.font = `bold ${SHARE_TEXT_FONT_SIZE}px Montserrat, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const lines: { text: string; color: string }[][] = [];
  let currentLineWords: { text: string; color: string }[] = [];
  let currentLineWidth = 0;

  for (const word of allWords) {
    const wordWidth = ctx.measureText(word.text).width;
    const gapWidth = currentLineWords.length > 0 ? ctx.measureText(' ').width : 0;
    if (currentLineWidth + gapWidth + wordWidth > SHARE_TEXT_BLOCK_WIDTH && currentLineWords.length > 0) {
      lines.push(currentLineWords);
      currentLineWords = [word];
      currentLineWidth = wordWidth;
    } else {
      currentLineWords.push(word);
      currentLineWidth += gapWidth + wordWidth;
    }
  }
  if (currentLineWords.length > 0) lines.push(currentLineWords);

  const textX = bgX - SHARE_TEXT_GAP - SHARE_TEXT_BLOCK_WIDTH;
  const textCenterY = qrY + QR_SIZE / 2;
  const totalTextHeight = lines.length * LINE_HEIGHT;
  const textStartY = textCenterY - totalTextHeight / 2 + LINE_HEIGHT / 2;

  lines.forEach((lineWords, i) => {
    let x = textX;
    lineWords.forEach((word, j) => {
      ctx.fillStyle = word.color;
      ctx.fillText(word.text, x, textStartY + i * LINE_HEIGHT);
      x += ctx.measureText(word.text).width;
      if (j < lineWords.length - 1) {
        ctx.fillText(' ', x, textStartY + i * LINE_HEIGHT);
        x += ctx.measureText(' ').width;
      }
    });
  });
};

export const ReferralShareModalBigWin = ({ closeModal }: { closeModal: () => void }) => {
  const { t } = useTranslation(['referral', 'common']);
  const { referralLink } = useReferralLink();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uploadedShareUrl, setUploadedShareUrl] = useState<string | null>(null);
  const [winTypeLabel, setWinTypeLabel] = useState('Big Win');
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const { parsedMessages } = useMqttTopicMessagesReadonly<any>(
    user?.id ? `user/${user!.id}/big_win_share` : null,
  );
  const { clearMessages } = useMqttService();

  const latest = useMemo(() => {
    if (!parsedMessages?.length) return null;
    return parsedMessages.reduce((max: any, msg: any) => {
      if (!max) return msg.parsed;
      return (msg.parsed?.multiplier ?? 0) > (max.multiplier ?? 0) ? msg.parsed : max;
    }, null);
  }, [parsedMessages]);

  const shareLang = t('gameDetail:come_join_me_now_at');

  const lastProcessedRecordIdRef = useRef<string | null>(null);
  const currentWinTypeRef = useRef<string>('');
  const uploadAttemptedIdRef = useRef<string | null>(null);

  const processedImageUrl = useMemo(() => {
    if (!uploadedShareUrl) return '';
    setIsOpen(true);
    return getImgCompressParams(uploadedShareUrl, 335);
  }, [uploadedShareUrl]);

  const generateCompositeImage = useCallback(async (
    multiplier: number,
    winAmountUsdt: string,
    shareLang: string,
    referralLink: string,
    gameImageUrl: string,
    winImageUrl: string,
    winColor: string,
    winType: string,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) { console.error('[generateCompositeImage] canvas is null'); return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) { console.error('[generateCompositeImage] ctx is null'); return; }

    try {
      const [bigWinImg, logoImg, gameImg, lightningImg] = await Promise.all([
        loadImage(winImageUrl, 'anonymous'),
        loadImage(QR_LOGO, 'anonymous'),
        loadImage(gameImageUrl, 'anonymous'),
        loadImage(LIGHTNING_IMAGE, 'anonymous'),
      ]);

      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;

      ctx.drawImage(bigWinImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      drawGameImage(ctx, gameImg);
      drawLightningWithText(ctx, lightningImg, multiplier, winAmountUsdt, winColor, canvas.width);

      const { bgX, qrY } = await drawQrCode(ctx, referralLink, logoImg, canvas.width, canvas.height);
      drawShareText(ctx, shareLang, bgX, qrY);

      currentWinTypeRef.current = winType;
      setWinTypeLabel(WIN_TYPE_IMAGE_TYPE_MAP[winType] || 'Big Win');
      setUploadedShareUrl(null);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.6));
      if (blob && uploadAttemptedIdRef.current !== lastProcessedRecordIdRef.current) {
        uploadAttemptedIdRef.current = lastProcessedRecordIdRef.current;
        const file = new File([blob], 'big-win-share.webp', { type: 'image/webp' });
        try {
          const imageType = WIN_TYPE_IMAGE_TYPE_MAP[winType] || 'Big Win';
          const res = await authService.uploadShareImage(file, imageType);
          if (res.code === 0 && res.data?.image_url) {
            setUploadedShareUrl(res.data.image_url);
          }
        } catch (uploadErr) {
          console.error('Failed to upload share image:', uploadErr);
        }
      }
    } catch (error) {
      console.error('Failed to generate composite image:', error);
    }
  }, [t]);

  const processAndGenerateImage = useCallback((parsed: any) => {
    const winConfig = WIN_IMAGE_CONFIG[parsed?.win_type];
    if (!parsed?.image || !parsed?.multiplier || !parsed?.win_amount_usdt || !referralLink || !winConfig) {
      return false;
    }

    const gameImageUrl = parsed.image?.replace(
      'pub-6345c6c916b94c12be067bfdadc5e526.r2.dev',
      'cdn-a.imgix.net',
    );

    const MAX_RETRIES = 3;
    let retryCount = 0;

    const tryLoad = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const formattedPrize = '+' + formatWithConversion(parsed.win_amount_usdt, "USDT", {
          showCode: false,
          showSymbol: true
        }).formatted;

        generateCompositeImage(
          parsed.multiplier,
          formattedPrize,
          shareLang,
          referralLink,
          gameImageUrl,
          winConfig.image,
          winConfig.color,
          parsed.win_type,
        );
      };

      img.onerror = () => {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          console.warn(`[processAndGenerateImage] Retry ${retryCount}/${MAX_RETRIES} for ${gameImageUrl}`);
          tryLoad();
        } else {
          console.error(`[processAndGenerateImage] Failed after ${MAX_RETRIES} retries:`, gameImageUrl);
        }
      };

      img.src = gameImageUrl;
    };

    tryLoad();
    return true;
  }, [referralLink, shareLang, formatWithConversion, generateCompositeImage, t]);

  useEffect(() => {
    const newRecordId = latest?.id;
    if (newRecordId && newRecordId !== lastProcessedRecordIdRef.current) {
      lastProcessedRecordIdRef.current = newRecordId;
      processAndGenerateImage(latest);
    }
  }, [latest, processAndGenerateImage]);

  const downloadImage = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current!.toBlob(resolve, 'image/webp', 0.6),
      );

      if (!blob) throw new Error('Failed to create blob from canvas');

      if (isIOS() && navigator.share && navigator.canShare?.({ files: [new File([blob], 'big-win-share.webp', { type: 'image/webp' })] })) {
        const file = new File([blob], 'big-win-share.webp', { type: 'image/webp' });
        await navigator.share({ files: [file], text: t('gameDetail:share_text_1', { multiplier: latest?.multiplier }) });
      } else if (isIOS()) {
        const url = URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
        if (!newWindow) toast.error(t('gameDetail:download_failed'));
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (isTelegramWebApp()) {
        if (uploadedShareUrl) {
          openExternalUrlInTMA(uploadedShareUrl);
        }
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'big-win-share.webp';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      toast.error(t('gameDetail:download_failed'));
    }
  }, [t, latest?.multiplier, uploadedShareUrl]);

  const handleSocialShare = useCallback((platform: string, shareText: string, shareUrl: string) => {
    try {
      if (DOWNLOAD_PLATFORMS.has(platform)) {
        downloadImage();
        // toast.success(t('gameDetail:image_downloaded'));
        return;
      }

      const effectiveShareUrl = uploadedShareUrl || shareUrl;
      const effectiveShareText = shareText + ' ' + shareUrl;
      const effectiveShareBoth = uploadedShareUrl
        ? `${shareText} ${uploadedShareUrl}`
        : shareText;

      const encodedUrl = encodeURIComponent(effectiveShareUrl);
      const encodedText = encodeURIComponent(effectiveShareText);
      const encodedBoth = encodeURIComponent(effectiveShareBoth + ' ' + shareUrl);

      let url = '';
      switch (platform) {
        case 'facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
          break;
        case 'whatsapp':
          if (isMobile() && isIOS()) {
            const whatsappMobileLink = `whatsapp://send?text=${encodedBoth}`;
            const whatsappWebLink = `https://api.whatsapp.com/send?text=${encodedBoth}`;
            openDeepLinkWithFallback(whatsappMobileLink, whatsappWebLink, getExternalLinkTarget());
            return;
          } else {
            url = isMobile()
              ? `whatsapp://send?text=${encodedBoth}`
              : `https://web.whatsapp.com/send?text=${encodedBoth}`;
          }
          break;
        case 'telegram':
          url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
          break;
        case 'x':
          url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
          break;
      }

      if (url) openExternalUrl(url);
    } catch (error) {
      console.error("Share error:", error);
    }
  }, [downloadImage, t, uploadedShareUrl]);

  const onClose = useCallback(() => {
    setIsOpen(false);
    setUploadedShareUrl(null);
    clearMessages(user?.id ? `user/${user!.id}/big_win_share` : undefined);
    closeModal();
  }, [closeModal, clearMessages, user?.id]);

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeButtonClassName="hidden"
        hideTitle={true}
        className="bg-transparent max-w-[355px] w-full p-0 shadow-none"
        position="modal-middle">
        <div className="flex flex-col gap-4 justify-center items-center h-full hide-scrollbar">
          <div className="max-w-[335px] w-full h-[335px] overflow-hidden rounded-lg">
            {processedImageUrl && (
              <img
                src={processedImageUrl}
                alt={winTypeLabel}
                className="w-full h-full"
              />
            )}
          </div>

          <div className="bg-base-400 rounded-box relative w-full p-4">
            <div className="justify-end flex">
              <button onClick={onClose} className="btn btn-square btn-sm bg-base-300 hover:bg-base-200 border-0">
                <Iconify icon="mdi:close" className="w-5 h-5 text-base-content/50" />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-base-content text-xs text-center">{t('gameDetail:invite_friends_to_join_play')}</div>
              <div className="text-base-content text-xs text-center">
                <Trans
                  i18nKey={'gameDetail:earn_up_to_50_commission_bonus'}
                  components={[<span className="text-primary" />]}
                  values={{
                    bonus: formatWithConversion(1200, "USD", {
                      showCode: false,
                      showSymbol: true,
                    }).formatted,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {SOCIAL_ICONS.map((social) => (
                <button
                  key={social.id}
                  onClick={() => handleSocialShare(social.id, t('gameDetail:share_text_1', { multiplier: latest?.multiplier }), referralLink)}
                  className="flex items-center justify-center w-12 h-12 rounded-lg bg-base-200 hover:bg-base-300 transition-all hover:scale-110"
                  aria-label={`Share on ${social.id}`}
                >
                  {social.id === 'download' ? (
                    <Iconify icon="custom:down_load" width={30} height={30} className="text-neutral-content" />
                  ) : (
                    <img
                      src={`https://image.1st.game/public/social-logo/${social.icon}`}
                      alt={social.id}
                      className="w-7.5 h-7.5"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
