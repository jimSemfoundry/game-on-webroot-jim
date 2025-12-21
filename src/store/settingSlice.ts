import { StateCreator } from "zustand";
import { ISettingSlice, Store } from "./type";

export const createSettingSlice: StateCreator<Store, [], [], ISettingSlice> = (set) => ({
    gameIsFullScreen: localStorage.getItem("gameIsFullScreen") === "true",
    setGameIsFullScreen: (isFullScreen: boolean) => {
        localStorage.setItem("gameIsFullScreen", String(isFullScreen));
        set({ gameIsFullScreen: isFullScreen });
    },
});
