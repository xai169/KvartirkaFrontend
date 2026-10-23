export interface SavingsGoal {
    targetAmountMinor: number;
    targetDate: string;
}
export interface SavingsEntry {
    id: string;
    amountMinor: number;
    date: string;
    comment: string | null;
    createdByUserId: string;
    createdAt: string;
    updatedAt: string;
}
export type SavingsEntryInput = Pick<SavingsEntry, "amountMinor" | "date" | "comment">;

export function calculateSavingsOverview(goal: SavingsGoal, entries: SavingsEntry[], today: string) {
    const month = today.slice(0, 7);
    const target = BigInt(goal.targetAmountMinor);
    const saved = entries.reduce((total, entry) => total + BigInt(entry.amountMinor), 0n);
    const before = entries
        .filter((entry) => entry.date.slice(0, 7) < month)
        .reduce((total, entry) => total + BigInt(entry.amountMinor), 0n);
    const current = entries
        .filter((entry) => entry.date.startsWith(month))
        .reduce((total, entry) => total + BigInt(entry.amountMinor), 0n);
    const nonNegative = (value: bigint) => (value < 0n ? 0n : value);
    const remainingAtStart = nonNegative(target - before);
    const [targetYear, targetMonth] = goal.targetDate.split("-").map(Number);
    const [year, monthNumber] = today.split("-").map(Number);
    const months = Math.max(1, (targetYear - year) * 12 + targetMonth - monthNumber + 1);
    const required = (remainingAtStart + BigInt(months) - 1n) / BigInt(months);
    return {
        saved,
        remaining: nonNegative(target - saved),
        overTarget: nonNegative(saved - target),
        percent: Math.min(100, (Number(saved) / Number(target)) * 100),
        status: saved >= target ? "completed" : goal.targetDate < today ? "overdue" : "active",
        current,
        required,
        monthRemaining: nonNegative(required - current),
        monthAhead: nonNegative(current - required),
    };
}
