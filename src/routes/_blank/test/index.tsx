// import * as Sentry from "@sentry/react";
import { createFileRoute } from "@tanstack/react-router";
import { useBoundStore } from "@/store";

// Sentry.init({
//   dsn: "https://5495c84f1ca24c89a9525152504510e9@o1159482.ingest.us.sentry.io/4504797463117824",
//   integrations: [
//     Sentry.feedbackIntegration({
//       // Additional SDK configuration goes in here, for example:
//       colorScheme: "system"
//     })
//   ]

// });

export const Route = createFileRoute("/_blank/test/")({
  component: RouteComponent
});

export function RouteComponent() {
  const { openModal } = useBoundStore();
  // created_at
  return <section className="text-sm font-bold m-5">
    <div className="bg-base-100 p-5 rounded-lg mt-5">
      <div className="space-x-2 mb-4">
        <button onClick={() => openModal("OPEN_FREE_PLAY_BONUS_MODAL", { code: 50006 })}
                className="px-4 py-2 bg-secondary text-secondary-content rounded-lg">
          OPEN_FREE_PLAY_BONUS_MODAL
        </button>
        <button onClick={() => openModal("OPEN_MINI_SLOT_BONUS_MODAL")}
                className="px-4 py-2 bg-secondary text-secondary-content rounded-lg">
          OPEN_MINI_SLOT_BONUS_MODAL
        </button>
        <button onClick={() => openModal("OPEN_MEGA_SLOT_BONUS_MODAL")}
                className="px-4 py-2 bg-secondary text-secondary-content rounded-lg">
          OPEN_MEGA_SLOT_BONUS_MODAL
        </button>
        <button onClick={() => openModal("OPEN_OPTIONAL_BONUS_MODAL")}
                className="px-4 py-2 bg-secondary text-secondary-content rounded-lg">
          OPEN_OPTIONAL_BONUS_MODAL
        </button>
      </div>
    </div>
  </section>;
}