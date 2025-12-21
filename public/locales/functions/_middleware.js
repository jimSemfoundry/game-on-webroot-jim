// functions/_middleware.js

export const onRequest = async (context) => {
  // 1. 在这里定义你允许的白名单域名
  const allowedOrigins = [
    "http://localhost",
    "https://ng.1stdev.online",
    "https://game-on-webroot.pages.dev"
  ];

  // 2. 获取当前请求的 Origin
  const request = context.request;
  const origin = request.headers.get("Origin");

  // 3. 继续执行请求，获取原始文件（比如你的 json 文件）
  const response = await context.next();

  // 4. 判断逻辑：如果请求的 Origin 在白名单里，就动态修改 Header
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    // 必须加上 Vary，告诉浏览器这个 Header 是会变化的
    response.headers.set("Vary", "Origin");
  }

  // 5. 返回修改后的响应
  return response;
};
