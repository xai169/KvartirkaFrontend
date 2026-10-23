import { ActionIcon, Button, Group, Menu, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDots, IconPencil, IconPigMoney, IconPlus, IconRefresh, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { deleteEntry, savingsEntriesOptions, savingsGoalOptions, savingsKeys } from "@/features/savings/api/savingsApi";
import type { SavingsEntry } from "@/features/savings/model/savings";
import { GoalForm } from "@/features/savings/ui/GoalForm";
import { EntryForm } from "@/features/savings/ui/EntryForm";
import { SavingsOverview } from "@/features/savings/ui/SavingsOverview";
import { PageHeader } from "@/shared/ui/PageHeader";
import { ErrorState, LoadingState } from "@/shared/ui/ResourceState";
import { ConfirmDelete } from "@/shared/ui/ConfirmDelete";
import { EditDialog } from "@/shared/ui/EditDialog";
import { formatMoney } from "@/shared/lib/money";
import { formatDate } from "@/shared/lib/dates";
import classes from "./SavingsPage.module.css";

export function SavingsPage() {
    const goal = useQuery(savingsGoalOptions);
    const entries = useQuery(savingsEntriesOptions);
    const queryClient = useQueryClient();
    const [goalOpen, setGoalOpen] = useState(false);
    const [entryEditor, setEntryEditor] = useState<{ entry: SavingsEntry | null } | null>(null);
    const [deleting, setDeleting] = useState<SavingsEntry | null>(null);
    const deletion = useMutation({
        mutationFn: deleteEntry,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: savingsKeys.entries });
            setDeleting(null);
            notifications.show({ message: "Пополнение удалено", color: "teal" });
        },
    });
    const refresh = () => {
        void goal.refetch();
        void entries.refetch();
    };
    const error = goal.error || entries.error;
    return (
        <>
            <PageHeader
                title="Накопления"
                description="Шаг за шагом — к вашему дому"
                action={
                    <Group gap="xs">
                        <ActionIcon
                            size="lg"
                            variant="default"
                            aria-label="Обновить накопления"
                            onClick={refresh}
                            loading={goal.isFetching || entries.isFetching}
                        >
                            <IconRefresh size={18} />
                        </ActionIcon>
                        <Button
                            leftSection={<IconPlus size={18} />}
                            onClick={() => setEntryEditor({ entry: null })}
                            disabled={goal.isPending || entries.isPending || !!error}
                        >
                            Добавить пополнение
                        </Button>
                    </Group>
                }
            />
            {goal.isPending || entries.isPending ? (
                <LoadingState />
            ) : error ? (
                <ErrorState
                    error={error}
                    onRetry={refresh}
                />
            ) : (
                <Stack gap="xl">
                    {goal.data ? (
                        <SavingsOverview
                            goal={goal.data}
                            entries={entries.data ?? []}
                            onEdit={() => setGoalOpen(true)}
                        />
                    ) : (
                        <Paper
                            withBorder
                            p="xl"
                            radius="lg"
                        >
                            <Stack align="flex-start">
                                <ThemeIcon
                                    size={48}
                                    variant="light"
                                    radius="xl"
                                >
                                    <IconPigMoney size={28} />
                                </ThemeIcon>
                                <Title
                                    order={2}
                                    size="h3"
                                >
                                    С чего начинается ваш дом?
                                </Title>
                                <Text c="dimmed">
                                    Задайте сумму и срок — мы покажем прогресс и план накоплений на месяц.
                                </Text>
                                <Button onClick={() => setGoalOpen(true)}>Создать цель</Button>
                            </Stack>
                        </Paper>
                    )}
                    <section>
                        <Group
                            justify="space-between"
                            mb="md"
                        >
                            <Title
                                order={2}
                                size="h3"
                            >
                                История пополнений
                            </Title>
                            <Text
                                size="sm"
                                c="dimmed"
                            >
                                Всего записей: {entries.data?.length ?? 0}
                            </Text>
                        </Group>
                        {entries.data?.length ? (
                            <Paper
                                withBorder
                                radius="lg"
                                className={classes.history}
                            >
                                {[...entries.data]
                                    .sort(
                                        (a, b) =>
                                            b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
                                    )
                                    .map((entry) => (
                                        <div
                                            className={classes.entry}
                                            key={entry.id}
                                        >
                                            <div className={classes.entryInfo}>
                                                <Text fw={650}>{formatMoney(entry.amountMinor)}</Text>
                                                <Text
                                                    c="dimmed"
                                                    size="xs"
                                                    mt={4}
                                                >
                                                    {formatDate(entry.date)}
                                                </Text>
                                                {entry.comment && (
                                                    <Text
                                                        className={classes.comment}
                                                        size="sm"
                                                        mt={6}
                                                    >
                                                        {entry.comment}
                                                    </Text>
                                                )}
                                            </div>
                                            <Menu
                                                withinPortal
                                                position="bottom-end"
                                            >
                                                <Menu.Target>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="gray"
                                                        size="lg"
                                                        aria-label={`Действия с пополнением ${formatMoney(entry.amountMinor)}`}
                                                    >
                                                        <IconDots size={20} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item
                                                        leftSection={<IconPencil size={16} />}
                                                        onClick={() => setEntryEditor({ entry })}
                                                    >
                                                        Изменить
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        color="red"
                                                        leftSection={<IconTrash size={16} />}
                                                        onClick={() => {
                                                            deletion.reset();
                                                            setDeleting(entry);
                                                        }}
                                                    >
                                                        Удалить
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </div>
                                    ))}
                            </Paper>
                        ) : (
                            <Paper
                                withBorder
                                p="xl"
                                radius="lg"
                            >
                                <Stack align="center">
                                    <Text fw={600}>Пополнений пока нет</Text>
                                    <Text
                                        size="sm"
                                        c="dimmed"
                                        ta="center"
                                    >
                                        Добавьте первую сумму, которую вы отложили для дома.
                                    </Text>
                                    <Button
                                        variant="light"
                                        onClick={() => setEntryEditor({ entry: null })}
                                    >
                                        Добавить первое пополнение
                                    </Button>
                                </Stack>
                            </Paper>
                        )}
                    </section>
                </Stack>
            )}
            <EditDialog
                opened={goalOpen}
                title={goal.data ? "Изменить цель" : "Ваша первая цель"}
                mutationKey={savingsKeys.saveGoal}
                onClose={() => setGoalOpen(false)}
            >
                {goalOpen && (
                    <GoalForm
                        goal={goal.data ?? null}
                        onClose={() => setGoalOpen(false)}
                    />
                )}
            </EditDialog>
            <EditDialog
                opened={!!entryEditor}
                title={entryEditor?.entry ? "Изменить пополнение" : "Добавить пополнение"}
                mutationKey={savingsKeys.saveEntry}
                onClose={() => setEntryEditor(null)}
            >
                {entryEditor && (
                    <EntryForm
                        entry={entryEditor.entry}
                        onClose={() => setEntryEditor(null)}
                    />
                )}
            </EditDialog>
            <ConfirmDelete
                opened={!!deleting}
                title="Удалить пополнение?"
                description={
                    deleting ? `Пополнение на ${formatMoney(deleting.amountMinor)} будет удалено из общей истории.` : ""
                }
                pending={deletion.isPending}
                error={deletion.error}
                onClose={() => setDeleting(null)}
                onConfirm={() => {
                    if (deleting && !deletion.isPending) deletion.mutate(deleting.id);
                }}
            />
        </>
    );
}
