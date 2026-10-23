import { Button, Group, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { saveGoal, savingsKeys } from "../api/savingsApi";
import type { SavingsGoal } from "../model/savings";
import { moneyInputValue, parseMoney } from "@/shared/lib/money";
import { isValidDate } from "@/shared/lib/dates";
import { fieldError } from "@/shared/api/apiError";
import { FormError } from "@/shared/ui/ResourceState";

export function GoalForm({ goal, onClose }: { goal: SavingsGoal | null; onClose: () => void }) {
    const [amount, setAmount] = useState(goal ? moneyInputValue(goal.targetAmountMinor) : "");
    const [date, setDate] = useState(goal?.targetDate ?? "");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: savingsKeys.saveGoal,
        mutationFn: saveGoal,
        onSuccess: async (saved) => {
            queryClient.setQueryData(savingsKeys.goal, saved);
            await queryClient.invalidateQueries({ queryKey: savingsKeys.goal });
            notifications.show({ message: "Цель сохранена", color: "teal" });
            onClose();
        },
    });
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                if (mutation.isPending) return;
                const minor = parseMoney(amount);
                const next: Record<string, string> = {};
                if (minor === null) next.amount = "Введите сумму больше нуля, не более двух знаков после запятой";
                if (!isValidDate(date)) next.date = "Укажите корректную дату";
                setErrors(next);
                if (Object.keys(next).length === 0 && minor !== null)
                    mutation.mutate({ targetAmountMinor: minor, targetDate: date });
            }}
        >
            <Stack>
                <TextInput
                    data-autofocus
                    label="Целевая сумма, ₽"
                    placeholder="1 500 000"
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) => setAmount(event.currentTarget.value)}
                    required
                    disabled={mutation.isPending}
                    error={errors.amount || fieldError(mutation.error, "targetAmountMinor")}
                />
                <TextInput
                    label="Дата достижения цели"
                    type="date"
                    min="0001-01-01"
                    max="9999-12-31"
                    value={date}
                    onChange={(event) => setDate(event.currentTarget.value)}
                    required
                    disabled={mutation.isPending}
                    error={errors.date || fieldError(mutation.error, "targetDate")}
                />
                <FormError error={mutation.error} />
                <Group justify="flex-end">
                    <Button
                        variant="default"
                        onClick={onClose}
                        disabled={mutation.isPending}
                    >
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                        loading={mutation.isPending}
                    >
                        Сохранить цель
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
