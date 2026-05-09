// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockedIsTMA = vi.fn();
const mockedOpenLink = vi.fn();
const mockedOpenTelegramLink = vi.fn();

vi.mock("@tma.js/sdk-react", () => ({
  closingBehavior: { mount: vi.fn() },
  init: vi.fn(),
  isTMA: mockedIsTMA,
  miniApp: { mount: vi.fn() },
  off: vi.fn(),
  on: vi.fn(),
  openLink: mockedOpenLink,
  openTelegramLink: mockedOpenTelegramLink,
  retrieveLaunchParams: vi.fn(),
  retrieveRawInitData: vi.fn(),
  swipeBehavior: { mount: vi.fn() },
  themeParams: { mount: vi.fn() },
  viewport: {
    mount: vi.fn(),
    bindCssVars: vi.fn(),
    height: vi.fn(),
    stableHeight: vi.fn(),
    isFullscreen: vi.fn(),
    safeAreaInsets: vi.fn(),
    contentSafeAreaInsets: vi.fn(),
  },
}));

describe("openExternalUrl", () => {
  beforeEach(() => {
    mockedIsTMA.mockReturnValue(false);
    mockedOpenLink.mockReset();
    mockedOpenTelegramLink.mockReset();
    window.open = vi.fn();
  });

  it("uses Telegram in-app links for t.me share URLs inside Mini Apps", async () => {
    mockedIsTMA.mockReturnValue(true);

    const { openExternalUrl } = await import("./telegramWebApp");

    const result = openExternalUrl(
      "https://t.me/share/url?url=https%3A%2F%2Fbrand.example%2Finvite"
    );

    expect(result).toBe(true);
    expect(mockedOpenTelegramLink).toHaveBeenCalledWith(
      "https://t.me/share/url?url=https%3A%2F%2Fbrand.example%2Finvite"
    );
    expect(mockedOpenLink).not.toHaveBeenCalled();
  });
});

describe("preOpenNewTabPopup", () => {
  beforeEach(() => {
    mockedIsTMA.mockReturnValue(false);
  });

  it("opens about:blank in a new tab in regular browsers", async () => {
    const fakePopup = { opener: {} } as unknown as Window;
    window.open = vi.fn(() => fakePopup);

    const { preOpenNewTabPopup } = await import("./telegramWebApp");
    const result = preOpenNewTabPopup();

    expect(result).toBe(fakePopup);
    // 不能带 noopener / noreferrer,否则 window.open 返回 null 导致后续无法 close
    expect(window.open).toHaveBeenCalledWith("about:blank", "_blank");
    expect(fakePopup.opener).toBeNull();
  });

  it("returns null inside Telegram WebApp without opening anything", async () => {
    mockedIsTMA.mockReturnValue(true);
    window.open = vi.fn();

    const { preOpenNewTabPopup } = await import("./telegramWebApp");
    const result = preOpenNewTabPopup();

    expect(result).toBeNull();
    expect(window.open).not.toHaveBeenCalled();
  });
});

describe("navigateNewTabPopup", () => {
  const PAYMENT_URL = "https://cashier.example.com/order/abc123";

  beforeEach(() => {
    mockedIsTMA.mockReturnValue(false);
    mockedOpenLink.mockReset();
    mockedOpenTelegramLink.mockReset();
  });

  it("uses Telegram SDK openLink inside Mini Apps and ignores popup", async () => {
    mockedIsTMA.mockReturnValue(true);
    const popupHrefSetter = vi.fn();
    const fakePopup = {
      location: {
        set href(v: string) { popupHrefSetter(v); },
        get href() { return ""; },
      },
    } as unknown as Window;

    const { navigateNewTabPopup } = await import("./telegramWebApp");
    const result = navigateNewTabPopup(fakePopup, PAYMENT_URL);

    expect(result).toBe(true);
    expect(mockedOpenLink).toHaveBeenCalledWith(PAYMENT_URL);
    expect(popupHrefSetter).not.toHaveBeenCalled();
  });

  it("uses openTelegramLink for t.me URLs inside Mini Apps", async () => {
    mockedIsTMA.mockReturnValue(true);

    const { navigateNewTabPopup } = await import("./telegramWebApp");
    const result = navigateNewTabPopup(
      null,
      "https://t.me/share/url?url=https%3A%2F%2Fbrand.example%2Finvite"
    );

    expect(result).toBe(true);
    expect(mockedOpenTelegramLink).toHaveBeenCalled();
    expect(mockedOpenLink).not.toHaveBeenCalled();
  });

  it("navigates the pre-opened popup to the target URL in regular browsers", async () => {
    const popupHrefSetter = vi.fn();
    const fakePopup = {
      location: {
        set href(v: string) { popupHrefSetter(v); },
        get href() { return ""; },
      },
    } as unknown as Window;

    const { navigateNewTabPopup } = await import("./telegramWebApp");
    const result = navigateNewTabPopup(fakePopup, PAYMENT_URL);

    expect(result).toBe(true);
    expect(popupHrefSetter).toHaveBeenCalledWith(PAYMENT_URL);
  });

  it("returns false when popup is null and not in Telegram", async () => {
    const { navigateNewTabPopup } = await import("./telegramWebApp");
    const result = navigateNewTabPopup(null, PAYMENT_URL);

    expect(result).toBe(false);
  });
});
