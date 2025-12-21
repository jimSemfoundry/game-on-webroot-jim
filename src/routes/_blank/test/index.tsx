// import * as Sentry from "@sentry/react";
import { createFileRoute } from "@tanstack/react-router";

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
  return <section className="text-sm font-bold m-5">
    <h1 className="text-center">Do Some Test In This Page</h1>
    <div className="bg-base-100 p-5 rounded-lg mt-5">
    </div>
  </section>;
}