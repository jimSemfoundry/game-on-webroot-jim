import { cn } from "@/utils/themeMerger";
import { X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return { isOpen, openModal, closeModal };
};

type ModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  hideTitle?: boolean;
  className?: string;
  closeButtonClassName?: string;
  id?: string;
  position?: "modal-bottom" | "modal-middle" | "";
  style?: React.CSSProperties;
  zIndex?: number;
  outsideClose?: boolean;
};

export function Modal({
  isOpen,
  onClose,
  title = "Modal",
  hideTitle = false,
  children,
  className,
  closeButtonClassName,
  id = "modal",
  position = "",
  zIndex = 70,
  style,
  outsideClose = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const modalId = `${id}_${Math.random().toString(36).substring(2, 11)}`;

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    if (isOpen) {
      modal.show();
    } else {
      modal.close();
    }
  }, [isOpen]);

  // 处理 ESC 键和背景点击关闭
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const handleClose = () => {
      onClose();
    };

    modal.addEventListener("close", handleClose);
    return () => modal.removeEventListener("close", handleClose);
  }, [onClose]);

  // 只在客户端渲染时使用portal
  if (typeof document === 'undefined') {
    return null;
  }

  const modalContent = (
    <dialog ref={modalRef} id={modalId} className={cn(`modal z-[${zIndex}]`, position || "modal-bottom sm:modal-middle")} onClose={onClose}>
      <div className={cn("modal-box px-5 py-4", className)} style={style}>
        {/* 关闭按钮 */}
        <form method="dialog">
          <button
            type="button"
            className={cn("btn btn-sm btn-square absolute top-4 right-5 rtl:left-4 rtl:right-auto", closeButtonClassName)}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </form>

        {/* 标题 */}
        {!hideTitle && (
          <div className="mb-2 pr-8 rtl:pl-8 rtl:pr-0 h-8">
            {typeof title === "string" ? <h3 className="font-bold text-base">{title}</h3> : title}
          </div>
        )}

        {/* 内容 */}
        <div>{children}</div>
      </div>

      {/* 背景遮罩 - 点击关闭 */}
      {outsideClose && (
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={onClose} />
        </form>
      )}
    </dialog>
  );

  // 使用createPortal将modal渲染到body
  return createPortal(modalContent, document.body);
}
