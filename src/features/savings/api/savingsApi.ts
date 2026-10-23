import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { ApiError } from "@/shared/api/apiError";
import type { SavingsEntry, SavingsEntryInput, SavingsGoal } from "../model/savings";

export const savingsKeys = {
    goal: ["savings", "goal"] as const,
    entries: ["savings", "entries"] as const,
    saveGoal: ["savings", "saveGoal"] as const,
    saveEntry: ["savings", "saveEntry"] as const,
};
export const savingsGoalOptions = queryOptions({
    queryKey: savingsKeys.goal,
    queryFn: async ({ signal }) => {
        try {
            return await apiClient<SavingsGoal>("/savings/goal", { signal });
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) return null;
            throw error;
        }
    },
});
export const savingsEntriesOptions = queryOptions({
    queryKey: savingsKeys.entries,
    queryFn: async ({ signal }) => (await apiClient<{ items: SavingsEntry[] }>("/savings/entries", { signal })).items,
});
export const saveGoal = (body: SavingsGoal) => apiClient<SavingsGoal>("/savings/goal", { method: "PUT", body });
export const createEntry = (body: SavingsEntryInput) =>
    apiClient<SavingsEntry>("/savings/entries", { method: "POST", body });
export const updateEntry = ({ id, ...body }: SavingsEntryInput & { id: string }) =>
    apiClient<SavingsEntry>(`/savings/entries/${id}`, { method: "PATCH", body });
export const deleteEntry = (id: string) => apiClient<void>(`/savings/entries/${id}`, { method: "DELETE" });
