import { createFileRoute } from "@tanstack/react-router";
import { PurchasesPage } from "@/pages/PurchasesPage";
import { normalizePurchaseFilters } from "@/features/purchases/model/purchases";
export const Route = createFileRoute("/_authenticated/purchases")({
    validateSearch: normalizePurchaseFilters,
    component: PurchasesPage,
});
