import { ActionIcon, Button, Group, NativeSelect, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useState } from "react";
import { deletePurchase, purchasesKey, purchasesOptions, savePurchaseKey } from "@/features/purchases/api/purchasesApi";
import {
    calculatePurchasesSummary,
    categoryLabels,
    normalizePurchaseFilters,
    optionsFromLabels,
    roomLabels,
    selectPurchases,
    statusLabels,
    type Purchase,
    type PurchaseFilters,
} from "@/features/purchases/model/purchases";
import { PurchaseForm } from "@/features/purchases/ui/PurchaseForm";
import { PurchaseCard } from "@/features/purchases/ui/PurchaseCard";
import { PageHeader } from "@/shared/ui/PageHeader";
import { ConfirmDelete } from "@/shared/ui/ConfirmDelete";
import { EditDialog } from "@/shared/ui/EditDialog";
import { ErrorState, LoadingState } from "@/shared/ui/ResourceState";
import { formatMoney } from "@/shared/lib/money";

const routeApi = getRouteApi("/_authenticated/purchases");
export function PurchasesPage() {
    const query = useQuery(purchasesOptions);
    const queryClient = useQueryClient();
    const filters = routeApi.useSearch();
    const navigate = routeApi.useNavigate();
    const [editor, setEditor] = useState<{ purchase: Purchase | null } | null>(null);
    const [deleting, setDeleting] = useState<Purchase | null>(null);
    const deletion = useMutation({
        mutationFn: deletePurchase,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: purchasesKey });
            setDeleting(null);
            notifications.show({ message: "Покупка удалена", color: "teal" });
        },
    });
    const changeFilter = (key: keyof PurchaseFilters, value: string) => {
        void navigate({ search: normalizePurchaseFilters({ ...filters, [key]: value }) });
    };
    const resetFilters = () => {
        void navigate({ search: {} });
    };
    const items = query.data ?? [];
    const visible = selectPurchases(items, filters);
    const summary = calculatePurchasesSummary(items);
    const hasFilters = !!(filters.room || filters.category || filters.status);
    return (
        <>
            <PageHeader
                title="Покупки"
                description="Всё, что сделает дом вашим"
                action={
                    <Group gap="xs">
                        <ActionIcon
                            size="lg"
                            variant="default"
                            aria-label="Обновить покупки"
                            loading={query.isFetching}
                            onClick={() => void query.refetch()}
                        >
                            <IconRefresh size={18} />
                        </ActionIcon>
                        <Button
                            leftSection={<IconPlus size={18} />}
                            onClick={() => setEditor({ purchase: null })}
                            disabled={query.isPending || !!query.error}
                        >
                            Добавить покупку
                        </Button>
                    </Group>
                }
            />
            {query.isPending ? (
                <LoadingState />
            ) : query.error ? (
                <ErrorState
                    error={query.error}
                    onRetry={() => void query.refetch()}
                />
            ) : (
                <Stack gap="xl">
                    <section>
                        <Text
                            size="sm"
                            c="dimmed"
                            mb="sm"
                        >
                            Сводка по всем покупкам
                        </Text>
                        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
                            {[
                                { label: "Общая сумма", amount: summary.total },
                                { label: "Запланировано", amount: summary.planned },
                                { label: "Заказано", amount: summary.ordered },
                                { label: "Куплено", amount: summary.purchased },
                            ].map(({ label, amount }) => (
                                <Paper
                                    key={label}
                                    withBorder
                                    p="lg"
                                    radius="lg"
                                >
                                    <Text
                                        size="sm"
                                        c="dimmed"
                                    >
                                        {label}
                                    </Text>
                                    <Text
                                        size="xl"
                                        fw={700}
                                        mt={8}
                                        style={{ overflowWrap: "anywhere" }}
                                    >
                                        {formatMoney(amount)}
                                    </Text>
                                </Paper>
                            ))}
                        </SimpleGrid>
                        <Group
                            justify="space-between"
                            mt="sm"
                        >
                            <Text
                                size="sm"
                                c="dimmed"
                            >
                                Незавершённые покупки: {formatMoney(summary.active)}
                            </Text>
                            {summary.unknownPriceCount > 0 && (
                                <Text
                                    size="sm"
                                    c="dimmed"
                                >
                                    Без указанной цены: {summary.unknownPriceCount}
                                </Text>
                            )}
                        </Group>
                    </section>
                    <Paper
                        withBorder
                        p="lg"
                        radius="lg"
                    >
                        <SimpleGrid cols={{ base: 1, sm: 3 }}>
                            <NativeSelect
                                label="Комната"
                                data={[{ value: "", label: "Все комнаты" }, ...optionsFromLabels(roomLabels)]}
                                value={filters.room ?? ""}
                                onChange={(event) => changeFilter("room", event.currentTarget.value)}
                            />
                            <NativeSelect
                                label="Категория"
                                data={[{ value: "", label: "Все категории" }, ...optionsFromLabels(categoryLabels)]}
                                value={filters.category ?? ""}
                                onChange={(event) => changeFilter("category", event.currentTarget.value)}
                            />
                            <NativeSelect
                                label="Статус"
                                data={[{ value: "", label: "Все статусы" }, ...optionsFromLabels(statusLabels)]}
                                value={filters.status ?? ""}
                                onChange={(event) => changeFilter("status", event.currentTarget.value)}
                            />
                        </SimpleGrid>
                        {hasFilters && (
                            <Button
                                variant="subtle"
                                size="xs"
                                mt="sm"
                                onClick={resetFilters}
                            >
                                Сбросить фильтры
                            </Button>
                        )}
                    </Paper>
                    <section>
                        <Group
                            justify="space-between"
                            mb="md"
                        >
                            <Title
                                order={2}
                                size="h3"
                            >
                                Список покупок
                            </Title>
                            <Text
                                size="sm"
                                c="dimmed"
                            >
                                Показано {visible.length} из {items.length}
                            </Text>
                        </Group>
                        {visible.length ? (
                            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                                {visible.map((purchase) => (
                                    <PurchaseCard
                                        key={purchase.id}
                                        purchase={purchase}
                                        onEdit={() => setEditor({ purchase })}
                                        onDelete={() => {
                                            deletion.reset();
                                            setDeleting(purchase);
                                        }}
                                    />
                                ))}
                            </SimpleGrid>
                        ) : (
                            <Paper
                                withBorder
                                p="xl"
                                radius="lg"
                            >
                                <Stack align="center">
                                    <Text fw={600}>
                                        {items.length
                                            ? "По этим фильтрам ничего не найдено"
                                            : "Список покупок пока пуст"}
                                    </Text>
                                    <Text
                                        c="dimmed"
                                        size="sm"
                                        ta="center"
                                    >
                                        {items.length
                                            ? "Попробуйте выбрать другую комнату, категорию или статус."
                                            : "Сохраните первую идею для вашего дома — цену можно добавить позже."}
                                    </Text>
                                    <Button
                                        variant="light"
                                        onClick={items.length ? resetFilters : () => setEditor({ purchase: null })}
                                    >
                                        {items.length ? "Сбросить фильтры" : "Добавить первую покупку"}
                                    </Button>
                                </Stack>
                            </Paper>
                        )}
                    </section>
                </Stack>
            )}
            <EditDialog
                opened={!!editor}
                title={editor?.purchase ? "Изменить покупку" : "Добавить покупку"}
                mutationKey={savePurchaseKey}
                drawer
                onClose={() => setEditor(null)}
            >
                {editor && (
                    <PurchaseForm
                        purchase={editor.purchase}
                        defaultRoom={filters.room}
                        onClose={() => setEditor(null)}
                    />
                )}
            </EditDialog>
            <ConfirmDelete
                opened={!!deleting}
                title="Удалить покупку?"
                description={deleting ? `«${deleting.name}» будет удалена из общего списка.` : ""}
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
