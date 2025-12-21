
import fs from 'fs';
import path from 'path';

type Version = {
    version: number | string;
    facebookPixelId: string;
    nameBlock: string;
    websiteUrl: string;
    nickname: string;
    theme: string;
};
interface Config {
    publicDir: string;
}

export default ({ version, facebookPixelId, nameBlock, nickname, websiteUrl, theme }: Version) => {
    let config: Config = { publicDir: '' };

    return {
        name: 'version-plugin', // 必须的，将会在 warning 和 error 中显示
        configResolved(resolvedConfig: Config) {
            // 存储最终解析的配置
            config = resolvedConfig;
        },
        transformIndexHtml(html: string, ctx?: { path?: string; filename?: string }) {
            // 处理环境变量的默认值
            let processedHtml = html
                .replace(/%_WEBSITE_NAME_BLOCK_%/g, nameBlock ) 
                .replace(/%_WEBSITE_NICKNAME_%/g, nickname)
                .replace(/%_WEBSITE_URL_%/g, websiteUrl)
                .replace(/%_THEME_%/g, theme)
                .replace(/%_VERSION_%/g, version.toString());

            const manifestTag = '<link rel="manifest" href="/manifest.webmanifest" />';
            const swRegisterScript = `  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
      });
    }
  </script>`;

            const hasManifest = /<link\s+[^>]*rel=["']manifest["'][^>]*>/i.test(processedHtml);
            const hasSWRegister = /navigator\.serviceWorker\.register\(\s*["']\/sw\.js["']\s*\)/i.test(processedHtml);

            const isLandingPageHtml =
                (ctx?.path && ctx.path.includes('landingPage')) ||
                (ctx?.filename && ctx.filename.includes(`${path.sep}landingPage${path.sep}`));

            if (isLandingPageHtml && (!hasManifest || !hasSWRegister)) {
                const headInjection =
                    `${!hasManifest ? `\n  ${manifestTag}` : ''}` +
                    `${!hasSWRegister ? `\n${swRegisterScript}` : ''}`;

                processedHtml = processedHtml.replace('</head>', `${headInjection}\n</head>`);
            }
            
            return processedHtml.replace(
                '</body>',

                `<script>var version = ${version};</script>` +

                `   
                <script>
    !(function(c,b,d,a){c[a]||(c[a]={});c[a]=
    {
        pid: '1i6y71lx74v@06e3adcf022df54',
        endpoint: 'https://1i6y71lx74v-default-us.rum.aliyuncs.com',
        // Set environment information, reference values: 'prod' | 'gray' | 'pre' | 'daily' | 'local'
        env: "${version}" + '-' + window.location.hostname, 
        // Set spa mode, reference values: 'history' | 'hash'
        spaMode: 'history',
        collectors: {
        // Page performance metrics monitoring switch - Default enabled
        perf: true,
        // webVitals metrics monitoring switch - Default enabled
        webVitals: true,
        // AJAX monitoring switch - Default enabled
        api: true,
        // Static resource switch - Default enabled
        staticResource: true,
        // JavaScript error monitoring switch - Default enabled
        jsError: true,
        // Console error monitoring switch - Default enabled
        consoleError: true,
        // User behavior monitoring switch - Default enabled
        action: true,
        },
        // Link tracing configuration switch - Default disabled
        tracing: false,
    };
    var s=b.createElement("script");s.crossOrigin="";s.src=d;s.defer=true;b.body.appendChild(s)
})(window, document, "https://sdk.rum.aliyuncs.com/v2/browser-sdk.js", "__rum");
</script>

<!-- Facebook Pixel Code -->
${facebookPixelId ? `
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${facebookPixelId}');
  fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none" 
       src="https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1"/>
</noscript>
` : ''}
<!-- End Facebook Pixel Code -->
  </body>`
            );
        },
        buildStart() {
            // 生成版本信息文件路径
            const file = config.publicDir + path.sep + 'version.json';

            // 编译时间作为版本信息
            const content = JSON.stringify({ version });
            writeVersion(file, content);
        }
    };
};

/**
 * 写入文件
 * @param fileName
 * @param version
 */
function writeVersion(fileName: string, version: string | NodeJS.ArrayBufferView) {
    fs.writeFile(fileName, version, (err) => {
        if (err) throw err;
    });
}
