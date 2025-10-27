import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useCurrentUser } from "@/hooks/api/useAuth.ts";
import { authService } from "@/services/authService.ts";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { Modal } from "@/components/ui/Modal.tsx";
import AvatarEditor from "react-avatar-editor";
import { Camera, Hand, Plus, Redo, Undo, ZoomIn, ZoomOut } from "lucide-react";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";

export function AvatarModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { t } = useTranslation();
  const [selectedAvatar, setSelectedAvatar] = useState<number>(0);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);

  const [scale, setScale] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);

  const { user } = useAuth();

  const { refetch } = useCurrentUser();

  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const scaleFun = (e: string) => {
    if (e === "+") {
      setScale(Math.min(2, scale + 0.2));
    } else if (e === "-") {
      setScale(Math.max(1, scale - 0.2));
    }
  };

  const rotateFun = (e: string) => {
    if (e === "+") {
      setRotate(rotate + 90);
    } else if (e === "-") {
      setRotate(rotate - 90);
    }
  };

  useEffect(() => {
    if (user) {
      setSelectedAvatar(-1);
      setCustomAvatarUrl(user.avatar);
    }
  }, [user]);

  useEffect(() => {
    setScale(1);
    setRotate(0);
  }, [customAvatarUrl, selectedAvatar]);

  const editorRef = useRef<AvatarEditor>(null);
  const [loading, setLoading] = useState(false);

  const saveAvatar = () => {
    const formData = new FormData();

    if (editorRef.current) {
      // Get the edited canvas
      const canvas = editorRef.current.getImageScaledToCanvas();

      // Convert canvas to blob directly instead of using toDataURL
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "avatar.png", { type: "image/png" });
          formData.append("file", file);

          setLoading(true);
          authService.uploadPublicImage(formData)
            .then((res) => {
              const data = res.data;

              if (data.code === 0) {
                // Handle successful upload
                authService.updateUser({
                  avatar: data.data.public_url
                })
                  .then((updateRes) => {
                    if (updateRes.code === 0) {
                      void refetch();
                      toast.success(t("toast:editSuccess"));
                    }
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }
            })
            .finally(() => {
              setLoading(false);
            });
        }
      }, "image/png");
    }
  };

  return (
    <Modal
      position={isMobile ? "modal-bottom" : "modal-middle"} isOpen={open} onClose={onClose}
      title={"Edit Avatar"} className="bg-base-400 md:w-[420px] hide-scrollbar">
      <div className="flex flex-col gap-4">
        <div className="relative mt-2">
          <AvatarEditor
            ref={editorRef}
            image={
              selectedAvatar === -1 && customAvatarUrl
                ? customAvatarUrl
                : `/icons/avatar/Avatar-${selectedAvatar}.png`
            }
            width={300}
            height={300}
            border={0}
            color={[0, 0, 0, 0.5]} // RGBA
            scale={scale}
            rotate={rotate}
            borderRadius={300}
            className="mx-auto"
          />

          <span className={"flex items-center gap-2 text-xs font-bold absolute -bottom-2 left-4"}><Hand
            className={"w-4 h-4"} />Zoom and Adjust</span>

          <div
            className="absolute flex cursor-pointer items-center justify-center w-full h-full top-0 left-0"
            onClick={() => document.getElementById("avatar-upload")?.click()}
          >
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Handle custom avatar upload
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (event.target?.result) {
                      // Set custom avatar
                      setSelectedAvatar(-1); // Use -1 to indicate custom avatar
                      setCustomAvatarUrl(event.target.result as string);
                      setIsDisabled(false);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <Camera />
          </div>
        </div>
        <div className="bg-base-300 flex h-20 w-full items-center justify-between p-4">
          <div className="bg-base-100 flex h-full w-full items-center justify-around rounded-lg">
            <ZoomOut className={"w-5 h-5"} onClick={() => scaleFun("-")} />
            <div className={"flex"}>
              <input
                type="range"
                min={1}
                max={2}
                step={0.01}
                value={scale}
                className={`range range-xs`}
                onChange={(e) => {
                  setScale(Number(e.target.value));
                }}
              />
            </div>
            <ZoomIn className={"w-5 h-5"} onClick={() => scaleFun("+")} />
            <Undo className={"w-5 h-5"} onClick={() => rotateFun("-")} />
            <Redo className={"w-5 h-5"} onClick={() => rotateFun("+")} />
          </div>
        </div>
        <div>
          <div className="mb-2 text-lg font-bold">{t("common.defaultAvatars")}</div>
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: 14 }, (_, i) => (
              <div
                key={i}
                onClick={() => {
                  setCustomAvatarUrl(null);
                  setSelectedAvatar(i);
                  setIsDisabled(false);
                }}
                className="h-14 w-14 rounded-full border-3 cursor-pointer"
                style={{
                  borderColor: selectedAvatar === i ? "color(display-p3 0.831 0.655 0.302)" : "transparent",
                  transition: "border-color 0.2s ease-in-out"
                }}
              >
                <img key={i} src={`/icons/avatar/default.png`} alt={`Avatar ${i}`} className="h-full w-full" />
              </div>
            ))}
            <div
              className="flex h-14 w-14 cursor-pointer items-center justify-center"
              onClick={() => document.getElementById("avatar-upload")?.click()}
            >
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Handle custom avatar upload
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        // Set custom avatar
                        setSelectedAvatar(-1); // Use -1 to indicate custom avatar
                        setCustomAvatarUrl(event.target.result as string);
                        setIsDisabled(false);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <Plus />
            </div>
          </div>
        </div>
        <div>
          <ConfirmBox disabled={loading || isDisabled} loading={loading} onClick={saveAvatar}>
            {t("common.save")}
          </ConfirmBox>
        </div>
      </div>
    </Modal>
  );
}
