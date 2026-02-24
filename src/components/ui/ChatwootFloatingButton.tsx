import { useChatwootContext } from "@/contexts/ChatwootContext";
import Iconify from "../iconify";
import { useLocation } from "@tanstack/react-router";
import { createPortal } from "react-dom";
import { PointerEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { emitter } from "@/store/emitter.ts";

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
          x: boundsRef.current.maxX - 20,
          y: boundsRef.current.maxY - 100
        });
      }
    };

    updateBounds();
    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(document.documentElement);
    return () => resizeObserver.disconnect();
  }, []);

  // 收到外部通知激活chat
  useEffect(() => {
    const em =  emitter.addListener("OPEN_CHAT", () => {
      toggleWidget();
    });

    return () => em?.remove();
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
        toggleWidget();
      }}
      className="fixed cursor-grab active:cursor-grabbing btn btn-primary btn-sm btn-square z-10000 border-3 border-secondary"
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


