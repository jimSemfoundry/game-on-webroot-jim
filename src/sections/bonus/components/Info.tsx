import { Alert } from "@/components/icons/Alert.tsx";
import { ComponentProps } from "react";
import clsx from "clsx";

export const Info = (props: ComponentProps<"button">) => {
  return <button {...props} className={clsx("btn btn-square btn-xs bg-base-200", props.className)}>
    <Alert className="text-base-content w-3.5 h-3.5" />
  </button>;
};