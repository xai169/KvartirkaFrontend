import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import type { Purchase, PurchaseInput } from "../model/purchases";

export const purchasesKey = ["purchases", "list"] as const;
export const savePurchaseKey = ["purchases", "save"] as const;
export const purchasesOptions = queryOptions({
    queryKey: purchasesKey,
    queryFn: async ({ signal }) => (await apiClient<{ items: Purchase[] }>("/purchases", { signal })).items,
});
export const createPurchase = (body: PurchaseInput) => apiClient<Purchase>("/purchases", { method: "POST", body });
export const updatePurchase = ({ id, ...body }: Partial<PurchaseInput> & { id: string }) =>
    apiClient<Purchase>(`/purchases/${id}`, { method: "PATCH", body });
export const deletePurchase = (id: string) => apiClient<void>(`/purchases/${id}`, { method: "DELETE" });
