import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 特殊处理 API 路由，直接通过，不经过 i18n
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 其他请求执行国际化中间件
  return intlMiddleware(req);
}

export const config = {
  // 匹配所有路径，排除 _next 和 静态文件
  matcher: ["/((?!_next|.*\\..*).*)"],
};
