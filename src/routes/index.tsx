import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: () => {
    throw redirect({ to: "/$citySlug", params: { citySlug: "los-angeles" } });
  },
  component: () => null,
});
