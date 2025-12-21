import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { MotionLazy } from "@/components/animate";
import { FreeSpinContainer } from "@/sections/free-spins";
import { cn } from "@/utils/themeMerger";
import Header from "../header/Header";
import { Sidebar } from "../sidebar/Sidebar";
import { ChatwootWrapper } from "../ui/ChatwootFloatingButton";
import { LimitedOffer } from "@/sections/limited-offer/LimitedOffer"; 
import { useTranslation } from "react-i18next";

interface GeneralErrorProps {
    error: Error;
    reset: () => void;
}

export function GeneralError({ error }: GeneralErrorProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const mainRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // Log the error to console for debugging purposes
        console.error("GeneralError caught:", error);
    }, [error]);

    const handleBack = () => {
        // Attempt to go back, fallback to home if no history or other issue
        if (window.history.length > 2) {
            router.history.back();
        } else {
            // Navigate to home with empty search params as required by the root route validator
            router.navigate({
                to: "/",
                search: {
                    openLogin: undefined,
                    redirect: undefined,
                    startapp: undefined,
                }
            });
        }
    };

    return (
        <MotionLazy>
            <div className="flex h-[100dvh] bg-base-300">
                <Sidebar />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main
                        ref={mainRef}
                        className={cn(
                            "flex-1 w-full overflow-y-auto hide-scrollbar flex flex-col items-center justify-center p-4 text-center"
                        )}
                    >
                        <img
                            src="/images/error-states/1.svg"
                            alt="Something went wrong"
                            className="w-full max-w-[280px] h-auto mb-8"
                        />

                        <h1 className="text-2xl font-bold mb-2 text-white">
                            {t("common:oops")}
                        </h1>
                        <h2 className="text-xl font-bold mb-4 text-white">
                            {t("common:somethingWentWrong")}
                        </h2>

                        <p className="text-base-content/70 max-w-xs mx-auto mb-8 leading-relaxed">
                            {t("common:tryRefresh")}
                        </p>

                        <button
                            onClick={handleBack}
                            className="btn btn-primary btn-soft font-bold hover:opacity-90 transition-opacity"
                        >
                            {t("common:common.back")}
                        </button>
                    </main>
                </div>
                <ChatwootWrapper />
                {/* Free Spin Global Container */}
                <FreeSpinContainer />
                <LimitedOffer /> 
            </div>
        </MotionLazy>
    );
}
