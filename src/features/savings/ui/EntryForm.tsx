import { Button, Group, Stack, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createEntry, savingsKeys, updateEntry } from "../api/savingsApi";
import type { SavingsEntry, SavingsEntryInput } from "../model/savings";
import { moneyInputValue, parseMoney } from "@/shared/lib/money";
import { isValidDate, todayDate } from "@/shared/lib/dates";
import { fieldError } from "@/shared/api/apiError";
import { FormError } from "@/shared/ui/ResourceState";

export function EntryForm({ entry, onClose }: { entry: SavingsEntry | null; onClose: () => void }) {
    const [amount, setAmount] = useState(entry ? moneyInputValue(entry.amountMinor) : "");
    const [date, setDate] = useState(entry?.date ?? todayDate());
    const [comment, setComment] = useState(entry?.comment ?? "");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: savingsKeys.saveEntry,
        mutationFn: (input: SavingsEntryInput) =>
            entry ? updateEntry({ id: entry.id, ...input }) : createEntry(input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: savingsKeys.entries });
            notifications.show({ message: entry ? "Пополнение изменено" : "Пополнение добавлено", color: "teal" });
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
                if (!isValidDate(date) || date > todayDate()) next.date = "Дата не может быть позже сегодняшней";
                setErrors(next);
                if (Object.keys(next).length === 0 && minor !== null)
                    mutation.mutate({ amountMinor: minor, date, comment: comment.trim() || null });
            }}
        >
            <Stack>
                <TextInput
                    data-autofocus
                    label="Сумма, ₽"
                    placeholder="25 000"
                    inputMode="decimal"
                    required
                    value={amount}
                    onChange={(event) => setAmount(event.currentTarget.value)}
                    disabled={mutation.isPending}
                    error={errors.amount || fieldError(mutation.error, "amountMinor")}
                />
                <TextInput
                    label="Дата пополнения"
                    type="date"
                    min="0001-01-01"
                    max={todayDate()}
                    required
                    value={date}
                    onChange={(event) => setDate(event.currentTarget.value)}
                    disabled={mutation.isPending}
                    error={errors.date || fieldError(mutation.error, "date")}
                />
                <Textarea
                    label="Комментарий"
                    placeholder="Например, отложили с зарплаты"
                    maxLength={2000}
                    autosize
                    minRows={2}
                    maxRows={6}
                    value={comment}
                    onChange={(event) => setComment(event.currentTarget.value)}
                    disabled={mutation.isPending}
                    error={fieldError(mutation.error, "comment")}
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
                        Сохранить пополнение
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
