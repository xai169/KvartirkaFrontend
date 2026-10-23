import { createFileRoute } from "@tanstack/react-router";
import { SavingsPage } from "@/pages/SavingsPage";
export const Route = createFileRoute("/_authenticated/")({ component: SavingsPage });
