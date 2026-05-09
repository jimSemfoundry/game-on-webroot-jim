# Big Win 图片分享方案文档

将动态生成的 Big Win 弹窗图片分享到 6 个社交平台。

---

## 核心挑战

Big Win 弹窗是**动态内容**（游戏名、倍率、金额、QR 码每次不同），不是静态 URL。
Web 端社交分享有两种模式，图片分享和 URL 分享的能力完全不同：

| 分享模式 | 说明 |
|---------|------|
| **URL 分享** | 只能发链接，平台爬取目标页 OG 标签生成卡片预览 |
| **图片分享** | 直接发送图片文件到对方聊天/帖子 |

---

## 分享方案总览

| 平台 | 移动端（Web Share API） | 桌面端 | 备注 |
|------|----------------------|--------|------|
| **Facebook** | ✅ 原生分享带图片 | 🔗 URL 分享（需后端 OG 页面） | sharer.php 不支持直接传图 |
| **WhatsApp** | ✅ 原生分享带图片 | 🔗 文本+链接 | Web Share API 支持文件 |
| **Telegram** | ✅ 原生分享带图片 | 🔗 URL+文本 | t.me/share 不支持传图 |
| **X (Twitter)** | ✅ 原生分享带图片 | 🔗 URL+文本 | intent/tweet 不支持传图 |
| **YouTube** | ⬇️ 下载图片 | ⬇️ 下载图片 | 无任何 Web 分享入口 |
| **Instagram** | ✅ 原生分享带图片 | ⬇️ 下载 + 提示手动分享 | 无 Web 分享 URL |

---

## 实现步骤

### Step 1：截图 — 将弹窗 DOM 转为图片

需要安装截图库（项目目前未安装）：

```bash
pnpm add html2canvas
```

```typescript
import html2canvas from 'html2canvas';

/**
 * 将 DOM 元素截图为 Blob
 */
const captureElementAsBlob = async (element: HTMLElement): Promise<Blob> => {
  const canvas = await html2canvas(element, {
    useCORS: true,          // 允许跨域图片（游戏缩略图等）
    backgroundColor: null,  // 透明背景
    scale: 2,               // 2x 分辨率，保证清晰度
  });
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/png'
    );
  });
};
```

### Step 2：移动端 — Web Share API（带图片文件）

`navigator.share()` 支持 `files` 参数，可直接将图片发送到任何已安装的 App。
**这是移动端最佳方案**，用户可以在系统分享面板中自行选择 Facebook/WhatsApp/Telegram/X/Instagram 等。

```typescript
import { isMobile } from '@/utils/browser';

/**
 * 使用 Web Share API 分享图片（仅移动端）
 * 支持：iOS Safari 15+, Android Chrome 76+
 */
const shareImageViaNativeShare = async (blob: Blob, text: string): Promise<boolean> => {
  const file = new File([blob], 'big-win.png', { type: 'image/png' });

  if (!navigator.canShare?.({ files: [file] })) {
    return false; // 浏览器不支持文件分享
  }

  try {
    await navigator.share({
      text,
      files: [file],
    });
    return true;
  } catch (err: any) {
    if (err.name === 'AbortError') return true; // 用户取消，不算失败
    console.error('Web Share API error:', err);
    return false;
  }
};
```

> **注意：** Web Share API 打开的是**系统级分享面板**，用户自行选择目标 App。
> 无法直接指定"分享到 Facebook"或"分享到 WhatsApp"，所有 App 统一展示。

### Step 3：桌面端 — URL 分享（需后端支持）+ 下载兜底

桌面端无法通过 Web 直接发送图片文件给社交平台。有两种方案：

#### 方案 A：后端生成分享页面（推荐，体验最好）

**流程：**
1. 前端截图 → 上传图片到 CDN/OSS
2. 后端生成一个带 OG 标签的分享页面，如 `https://1st.game/share/big-win/{id}`
3. 分享该 URL 到各平台，平台爬取 OG 标签展示图片预览

**后端分享页面需要的 OG 标签：**

```html
<meta property="og:title" content="BIG WIN 100x on Gates of Olympus!" />
<meta property="og:description" content="I just won ₱10,175,175,175! Come join me at 1ST.GAME" />
<meta property="og:image" content="https://cdn.1st.game/share/big-win-xxx.png" />
<meta property="og:image:width" content="600" />
<meta property="og:image:height" content="800" />
<meta property="og:url" content="https://1st.game/share/big-win/xxx" />
<meta property="og:type" content="website" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://cdn.1st.game/share/big-win-xxx.png" />
```

**前端分享代码（复用项目已有的分享逻辑）：**

```typescript
const shareUrl = `https://1st.game/share/big-win/${shareId}`;
const shareText = '🎰 BIG WIN 100x! Come join me at 1ST.GAME!';

switch (platform) {
  case 'facebook':
    // Facebook 只读 OG 标签，传 URL 即可
    url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    break;
  case 'whatsapp':
    // WhatsApp：文本 + URL，预览卡片来自 OG 标签
    url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    break;
  case 'telegram':
    url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    break;
  case 'x':
    url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    break;
  case 'youtube':
    // YouTube 无分享入口，下载图片
    downloadImage(blob, 'big-win.png');
    break;
  case 'instagram':
    // Instagram 无 Web 分享，下载图片 + 提示
    downloadImage(blob, 'big-win.png');
    toast.success('Image saved! Open Instagram to share.');
    break;
}
```

#### 方案 B：纯前端，下载图片 + 链接分享（无需后端）

不上传图片，桌面端只分享文本链接（无图片预览），同时提供下载按钮让用户手动贴图。

```typescript
/**
 * 下载图片到本地
 */
const downloadImage = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
```

---

## Step 4：完整分享流程（整合移动端 + 桌面端）

```typescript
const handleShare = async (
  platform: string,
  popupElement: HTMLElement,
  shareUrl: string,        // 后端生成的分享页 URL（方案 A）或 referralLink（方案 B）
  shareText: string,
) => {
  // 1. 截图
  const blob = await captureElementAsBlob(popupElement);

  // 2. 移动端：优先使用 Web Share API（带图片）
  if (isMobile()) {
    const shared = await shareImageViaNativeShare(blob, shareText);
    if (shared) return;
    // Web Share API 不支持时，走下面的 URL 分享兜底
  }

  // 3. 桌面端 / Web Share API 不可用时：URL 分享
  let url = '';
  switch (platform) {
    case 'facebook':
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      break;
    case 'whatsapp':
      url = isMobile()
        ? `whatsapp://send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        : `https://web.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
      break;
    case 'telegram':
      url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
      break;
    case 'x':
      url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
      break;
    case 'youtube':
      downloadImage(blob, 'big-win.png');
      toast.success('Image downloaded!');
      return;
    case 'instagram':
      downloadImage(blob, 'big-win.png');
      toast.success('Image saved! Open Instagram to share.');
      return;
  }

  if (url) {
    openExternalUrl(url); // 复用项目已有的 openExternalUrl
  }
};
```

---

## 各平台 URL 分享参考（桌面端兜底）

| 平台 | 分享 URL 格式 | 自定义文本 | 图片来源 |
|------|-------------|-----------|---------|
| **Facebook** | `https://www.facebook.com/sharer/sharer.php?u={URL}` | ❌ | OG 标签 |
| **WhatsApp** | `https://api.whatsapp.com/send?text={TEXT}` | ✅ | OG 标签 |
| **Telegram** | `https://t.me/share/url?url={URL}&text={TEXT}` | ✅ | OG 标签 |
| **X** | `https://twitter.com/intent/tweet?url={URL}&text={TEXT}` | ✅ | Twitter Card |
| **YouTube** | ❌ 不支持 | — | — |
| **Instagram** | ❌ 不支持 | — | — |

---

## 推荐实现优先级

1. **html2canvas 截图** — 所有方案的基础
2. **下载按钮（⬇️）** — 最简单，覆盖所有平台，用户手动分享
3. **移动端 Web Share API** — 一个按钮覆盖所有平台，带图片
4. **桌面端 URL 分享** — Facebook / WhatsApp / Telegram / X（不带图，仅链接卡片）
5. **后端 OG 分享页** — 桌面端 URL 分享时也能展示图片预览卡片（需后端配合）

---

## 备注

- **html2canvas 限制：** 跨域图片需服务器配置 CORS，否则截图中该图片会空白
- **Web Share API 兼容性：** iOS Safari 15+, Android Chrome 76+, 桌面端仅部分 Chromium 浏览器支持
- **Facebook OG 缓存：** Facebook 会缓存 OG 标签，更新后需通过 [Sharing Debugger](https://developers.facebook.com/tools/debug/) 清除缓存
- **X Card 缓存：** 同理，可通过 [Card Validator](https://cards-dev.twitter.com/validator) 刷新
