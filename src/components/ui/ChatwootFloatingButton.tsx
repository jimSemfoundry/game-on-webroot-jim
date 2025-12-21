import { useChatwootContext } from "@/contexts/ChatwootContext";
import Iconify from "../iconify";
import { useLocation } from "@tanstack/react-router";
import { createPortal } from "react-dom";
import { PointerEvent, useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext.tsx";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const ChatFloatingButton = () => {
  const { toggleWidget, visible } = useChatwootContext();
  const location = useLocation();

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const boundsRef = useRef({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
  const hasInitRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

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

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    isDraggingRef.current = false;

    pointerIdRef.current = event.pointerId;
    btnRef.current?.setPointerCapture(event.pointerId);
    offsetRef.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    isDraggingRef.current = true;

    if (pointerIdRef.current === null) return;
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
    btnRef.current?.releasePointerCapture(pointerIdRef.current);
    pointerIdRef.current = null;
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
      className="fixed cursor-grab active:cursor-grabbing btn btn-primary btn-md sm:btn-md btn-square z-10000"
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
      onPointerLeave={handlePointerUp}
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


