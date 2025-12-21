export const WebEnvLabel = () => {
  return import.meta.env.VITE_WEB_ENV === "UAT" &&
    <div className={"text-[10px] absolute -bottom-4 left-[50%] -translate-x-1/2 px-1 rounded-sm bg-info font-bold"}>
      UAT
    </div>;
};