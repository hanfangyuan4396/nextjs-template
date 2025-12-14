"use client";

// 已移除登录/注册流程，认证检查不再需要，作为直通组件使用
export function RequireAuth(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}
