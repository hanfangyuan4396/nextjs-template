"use client";

// 角色限制已取消，直接渲染子节点
export function RequireRole(props: { children: React.ReactNode; required: unknown }) {
  return <>{props.children}</>;
}
