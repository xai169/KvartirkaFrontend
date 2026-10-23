import { ActionIcon, Anchor, Badge, Group, Menu, NativeSelect, Paper, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDots, IconExternalLink, IconPencil, IconTrash } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchasesKey, updatePurchase } from "../api/purchasesApi";
import {
    categoryLabels,
    isStatus,
    optionsFromLabels,
    roomLabels,
    safeProductUrl,
    statusLabels,
    type Purchase,
} from "../model/purchases";
import { formatMoney } from "@/shared/lib/money";
import { FormError } from "@/shared/ui/ResourceState";
import classes from "./PurchaseCard.module.css";

export function PurchaseCard({
    purchase,
    onEdit,
    onDelete,
}: {
    purchase: Purchase;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: updatePurchase,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: purchasesKey });
            notifications.show({ message: "Статус обновлён", color: "teal" });
        },
    });
    const url = purchase.url ? safeProductUrl(purchase.url) : null;
    return (
        <Paper
            component="article"
            withBorder
            radius="lg"
            p="lg"
            className={classes.card}
            aria-label={purchase.name}
        >
            <Stack
                gap="md"
                h="100%"
            >
                <Group
                    justify="space-between"
                    align="flex-start"
                    wrap="nowrap"
                >
                    <Badge
                        color="gray"
                        variant="light"
                    >
                        {roomLabels[purchase.room]}
                    </Badge>
                    <Menu
                        withinPortal
                        position="bottom-end"
                    >
                        <Menu.Target>
                            <ActionIcon
                                size="lg"
                                variant="subtle"
                                color="gray"
                                disabled={mutation.isPending}
                                aria-label={`Действия с покупкой ${purchase.name}`}
                            >
                                <IconDots size={20} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconPencil size={16} />}
                                onClick={onEdit}
                            >
                                Изменить
                            </Menu.Item>
                            <Menu.Item
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                onClick={onDelete}
                            >
                                Удалить
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
                <div>
                    <Text
                        component="h3"
                        fw={650}
                        size="lg"
                        className={classes.name}
                    >
                        {purchase.name}
                    </Text>
                    <Text
                        size="xs"
                        c="dimmed"
                        mt={4}
                    >
                        {categoryLabels[purchase.category]}
                    </Text>
                </div>
                <Text
                    fw={700}
                    size={purchase.priceMinor ? "xl" : "sm"}
                    c={purchase.priceMinor ? undefined : "dimmed"}
                    className={classes.amount}
                >
                    {purchase.priceMinor ? formatMoney(purchase.priceMinor) : "Цена не указана"}
                </Text>
                {(purchase.store || url) && (
                    <Group gap="xs">
                        <Text
                            size="sm"
                            c="dimmed"
                            className={classes.name}
                        >
                            {purchase.store}
                        </Text>
                        {url && (
                            <Anchor
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="sm"
                            >
                                На сайт магазина{" "}
                                <IconExternalLink
                                    size={14}
                                    aria-hidden
                                    style={{ verticalAlign: "middle" }}
                                />
                            </Anchor>
                        )}
                    </Group>
                )}
                <div className={classes.status}>
                    <NativeSelect
                        aria-label={`Статус покупки ${purchase.name}`}
                        data={optionsFromLabels(statusLabels)}
                        value={purchase.status}
                        disabled={mutation.isPending}
                        onChange={(event) => {
                            const status = event.currentTarget.value;
                            if (isStatus(status) && status !== purchase.status && !mutation.isPending)
                                mutation.mutate({ id: purchase.id, status });
                        }}
                    />
                </div>
                <FormError error={mutation.error} />
            </Stack>
        </Paper>
    );
}
