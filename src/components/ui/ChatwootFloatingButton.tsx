import { useChatwootContext } from "@/contexts/ChatwootContext";
import Iconify from "../iconify";
import { useLocation } from "@tanstack/react-router";
import { createPortal } from "react-dom";
import { PointerEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext.tsx";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const ChatFloatingButton = () => {
  const { toggleWidget, visible } = useChatwootContext();
  const location = useLocation();

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const startPointRef = useRef({ x: 0, y: 0 });
  const boundsRef = useRef({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
  const hasInitRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const cleanupGlobalListenersRef = useRef<null | (() => void)>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef(position);
  positionRef.current = position;

  // 计算并应用未读气泡位置（仅未读预览态生效）
  const applyBubblePosition = useCallback(() => {
    const holder = document.getElementById("cw-widget-holder");
    if (!holder) return;

    const isUnread =
      holder.classList.contains("has-unread-view") &&
      !holder.classList.contains("woot-widget--expanded");

    // 非未读预览态：清理 inline 定位，让 CSS/SDK 接管
    if (!isUnread) {
      for (const p of ["top", "bottom", "left", "right", "transform", "max-width", "width", "height", "position", "z-index"]) {
        holder.style.removeProperty(p);
      }
      return;
    }

    const pos = positionRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const btnSize = 40;
    const gap = 8;
    const edge = 4;
    const bw = Math.min(320, vw - edge * 2);
    const bh = holder.offsetHeight || 280;

    // X 轴：始终在按钮左侧，clamp 保证不超出视口
    const left = clamp(pos.x - gap - bw, edge, Math.max(edge, vw - bw - edge));

    // Y 轴：PC 底部对齐，移动端垂直居中对齐按钮
    const isMobile = vw <= 768;
    const rawTop = isMobile
      ? pos.y + btnSize / 2 - bh / 2
      : pos.y + btnSize - bh;
    const top = clamp(rawTop, edge, Math.max(edge, vh - bh - edge));

    holder.style.setProperty("position", "fixed", "important");
    holder.style.setProperty("z-index", "1000", "important");
    holder.style.setProperty("top", `${top}px`, "important");
    holder.style.setProperty("left", `${left}px`, "important");
    holder.style.setProperty("bottom", "auto", "important");
    holder.style.setProperty("right", "auto", "important");
    holder.style.setProperty("transform", "none", "important");
    holder.style.setProperty("max-width", `${bw}px`, "important");
    holder.style.setProperty("width", "auto", "important");
    holder.style.setProperty("height", "auto", "important");
  }, []);

  // position 变化时同步 CSS 变量和气泡位置
  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--chatwoot-btn-x", `${position.x}px`);
    document.documentElement.style.setProperty("--chatwoot-btn-y", `${position.y}px`);
    applyBubblePosition();
  }, [position, applyBubblePosition]);

  // 监听 widget holder class 变化，状态切换时及时清理/重算
  useEffect(() => {
    let observer: MutationObserver | null = null;
    let timer: ReturnType<typeof setTimeout>;
    const setup = () => {
      const holder = document.getElementById("cw-widget-holder");
      if (!holder) {
        timer = setTimeout(setup, 1000);
        return;
      }
      observer = new MutationObserver(() => {
        applyBubblePosition();
        requestAnimationFrame(applyBubblePosition);
      });
      observer.observe(holder, { attributes: true, attributeFilter: ["class"] });
    };
    setup();
    return () => {
      observer?.disconnect();
      clearTimeout(timer);
    };
  }, [applyBubblePosition]);

  useLayoutEffect(() => {
    const button = btnRef.current;
    if (!button) return;

    const updateBounds = () => {
      const { clientWidth: cw, clientHeight: ch } = document.documentElement;
      const { width: bw, height: bh } = button.getBoundingClientRect();
      boundsRef.current = {
        minX: 0,
        minY: 0,
        maxX: cw - bw,
        maxY: ch - bh
      };
      setPosition((prev) => ({
        x: clamp(prev.x, boundsRef.current.minX, boundsRef.current.maxX),
        y: clamp(prev.y, boundsRef.current.minY, boundsRef.current.maxY)
      }));

      if (!hasInitRef.current) {
        hasInitRef.current = true;
        setPosition({
          x: boundsRef.current.maxX - 40,
          y: boundsRef.current.maxY - 60
        });
      }
    };

    updateBounds();
    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(document.documentElement);
    return () => resizeObserver.disconnect();
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    isDraggingRef.current = false;

    pointerIdRef.current = event.pointerId;

    try {
      btnRef.current?.setPointerCapture(event.pointerId);
    } catch {
      // no-op
    }

    startPointRef.current = { x: event.clientX, y: event.clientY };
    offsetRef.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y
    };

    cleanupGlobalListenersRef.current?.();

    const onWindowPointerMove = (e: globalThis.PointerEvent) => {
      if (pointerIdRef.current === null) return;
      if (e.pointerId !== pointerIdRef.current) return;

      const dx = e.clientX - startPointRef.current.x;
      const dy = e.clientY - startPointRef.current.y;
      const DRAG_THRESHOLD_PX = 4;
      if (!isDraggingRef.current && dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
        return;
      }

      isDraggingRef.current = true;
      const rawX = e.clientX - offsetRef.current.x;
      const rawY = e.clientY - offsetRef.current.y;
      const { minX, maxX, minY, maxY } = boundsRef.current;

      setPosition({
        x: clamp(rawX, minX, maxX),
        y: clamp(rawY, minY, maxY)
      });
    };

    const onWindowPointerUp = (e: globalThis.PointerEvent) => {
      if (pointerIdRef.current === null) return;
      if (e.pointerId !== pointerIdRef.current) return;

      try {
        btnRef.current?.releasePointerCapture(pointerIdRef.current);
      } catch {
        // no-op
      }

      pointerIdRef.current = null;
      cleanupGlobalListenersRef.current?.();
      cleanupGlobalListenersRef.current = null;
    };

    window.addEventListener("pointermove", onWindowPointerMove, { passive: true });
    window.addEventListener("pointerup", onWindowPointerUp, { passive: true });
    window.addEventListener("pointercancel", onWindowPointerUp, { passive: true });

    cleanupGlobalListenersRef.current = () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
      window.removeEventListener("pointercancel", onWindowPointerUp);
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current === null) return;

    const dx = event.clientX - startPointRef.current.x;
    const dy = event.clientY - startPointRef.current.y;
    const DRAG_THRESHOLD_PX = 4;
    if (!isDraggingRef.current && dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
      return;
    }

    isDraggingRef.current = true;
    const rawX = event.clientX - offsetRef.current.x;
    const rawY = event.clientY - offsetRef.current.y;
    const { minX, maxX, minY, maxY } = boundsRef.current;

    setPosition({
      x: clamp(rawX, minX, maxX),
      y: clamp(rawY, minY, maxY)
    });
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (isDraggingRef.current) {
      event.preventDefault();
    }

    if (pointerIdRef.current === null) return;
    try {
      btnRef.current?.releasePointerCapture(pointerIdRef.current);
    } catch {
      // no-op
    }
    pointerIdRef.current = null;
    cleanupGlobalListenersRef.current?.();
    cleanupGlobalListenersRef.current = null;
  };

  // 检查是否在游戏详情页面或 Sports 页面，如果是则隐藏客服按钮
  const isGamePage = location.pathname.startsWith("/games/");
  const isSportsPage = location.pathname.startsWith("/sports");

  // 如果在游戏页面、Sports 页面或 chatwoot 不可见，则不渲染按钮
  if (isGamePage || isSportsPage || !visible) {
    return null;
  }

  return createPortal(
    <button
      ref={btnRef}
      onClick={() => {
        if (isDraggingRef.current) return;
        // 点击前清理 inline 定位，防止残留影响对话框
        const h = document.getElementById("cw-widget-holder");
        if (h) for (const p of ["top","bottom","left","right","transform","max-width","width","height","position","z-index"]) h.style.removeProperty(p);
        toggleWidget();
      }}
      className="fixed cursor-grab active:cursor-grabbing btn btn-primary btn-sm btn-square z-1001 border-3 border-secondary"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        touchAction: "none",
        boxShadow:
          "-12px 0px 32px color(display - p3 0.000 0.000 0.000 / 0.04), -8px 0px 16px color(display - p3 0.000 0.000 0.000 / 0.08), -4px 0px 8px color(display - p3 0.000 0.000 0.000 / 0.12)"
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <Iconify icon="custom:headphone-2" className="w-5 h-5" />
    </button>,
    document.body
  );
};

export const ChatwootWrapper = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  return ["/casino", user ? "/profile" : ""].includes(pathname) && <ChatFloatingButton />;
};


