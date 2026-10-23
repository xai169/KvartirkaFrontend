import { Button, Group, NativeSelect, SimpleGrid, Stack, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createPurchase, purchasesKey, savePurchaseKey, updatePurchase } from "../api/purchasesApi";
import {
    categoryLabels,
    isCategory,
    isRoom,
    isStatus,
    optionsFromLabels,
    roomLabels,
    safeProductUrl,
    statusLabels,
    type Purchase,
    type PurchaseCategory,
    type PurchaseInput,
    type PurchaseRoom,
    type PurchaseStatus,
} from "../model/purchases";
import { moneyInputValue, parseMoney } from "@/shared/lib/money";
import { fieldError } from "@/shared/api/apiError";
import { FormError } from "@/shared/ui/ResourceState";

export function PurchaseForm({
    purchase,
    defaultRoom,
    onClose,
}: {
    purchase: Purchase | null;
    defaultRoom?: PurchaseRoom;
    onClose: () => void;
}) {
    const [name, setName] = useState(purchase?.name ?? "");
    const [price, setPrice] = useState(purchase ? moneyInputValue(purchase.priceMinor) : "");
    const [room, setRoom] = useState<PurchaseRoom>(purchase?.room ?? defaultRoom ?? "common");
    const [category, setCategory] = useState<PurchaseCategory>(purchase?.category ?? "other");
    const [status, setStatus] = useState<PurchaseStatus>(purchase?.status ?? "planned");
    const [store, setStore] = useState(purchase?.store ?? "");
    const [url, setUrl] = useState(purchase?.url ?? "");
    const [comment, setComment] = useState(purchase?.comment ?? "");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: savePurchaseKey,
        mutationFn: (input: PurchaseInput) =>
            purchase ? updatePurchase({ id: purchase.id, ...input }) : createPurchase(input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: purchasesKey });
            notifications.show({ message: purchase ? "Покупка изменена" : "Покупка добавлена", color: "teal" });
            onClose();
        },
    });
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                if (mutation.isPending) return;
                const priceMinor = parseMoney(price.trim() || "0", true);
                const next: Record<string, string> = {};
                if (!name.trim()) next.name = "Введите название покупки";
                if (priceMinor === null) next.price = "Введите неотрицательную сумму с точностью до копеек";
                if (url.trim() && !safeProductUrl(url.trim()))
                    next.url = "Укажите ссылку, начинающуюся с http:// или https://";
                setErrors(next);
                if (Object.keys(next).length === 0 && priceMinor !== null)
                    mutation.mutate({
                        name: name.trim(),
                        priceMinor,
                        room,
                        category,
                        status,
                        store: store.trim() || null,
                        url: url.trim() || null,
                        comment: comment.trim() || null,
                    });
            }}
        >
            <Stack gap="md">
                <TextInput
                    data-autofocus
                    label="Название"
                    placeholder="Например, диван в гостиную"
                    required
                    maxLength={200}
                    value={name}
                    onChange={(event) => setName(event.currentTarget.value)}
                    disabled={mutation.isPending}
                    error={errors.name || fieldError(mutation.error, "name")}
                />
                <TextInput
                    label="Цена, ₽"
                    description="Если цена пока неизвестна, оставьте поле пустым или укажите 0"
                    inputMode="decimal"
                    placeholder="0"
                    value={price}
                    onChange={(event) => setPrice(event.currentTarget.value)}
                    disabled={mutation.isPending}
                    error={errors.price || fieldError(mutation.error, "priceMinor")}
                />
                <SimpleGrid cols={{ base: 1, xs: 2 }}>
                    <NativeSelect
                        label="Комната"
                        required
                        data={optionsFromLabels(roomLabels)}
                        value={room}
                        onChange={(event) => {
                            if (isRoom(event.currentTarget.value)) setRoom(event.currentTarget.value);
                        }}
                        disabled={mutation.isPending}
                        error={fieldError(mutation.error, "room")}
                    />
                    <NativeSelect
                        label="Категория"
                        required
                        data={optionsFromLabels(categoryLabels)}
                        value={category}
                        onChange={(event) => {
                            if (isCategory(event.currentTarget.value)) setCategory(event.currentTarget.value);
                        }}
                        disabled={mutation.isPending}
                        error={fieldError(mutation.error, "category")}
                    />
                </SimpleGrid>
                <NativeSelect
                    label="Статус"
                    required
                    data={optionsFromLabels(statusLabels)}
                    value={status}
                    onChange={(event) => {
                        if (isStatus(event.currentTarget.value)) setStatus(event.currentTarget.value);
                    }}
                    disabled={mutation.isPending}
                    error={fieldError(mutation.error, "status")}
                />
                <TextInput
                    label="Магазин"
                    maxLength={200}
                    value={store}
                    onChange={(event) => setStore(event.currentTarget.value)}
                    disabled={mutation.isPending}
                    error={fieldError(mutation.error, "store")}
                />
                <TextInput
                    label="Ссылка на товар"
                    placeholder="https://"
                    inputMode="url"
                    value={url}
                    onChange={(event) => setUrl(event.currentTarget.value)}
                    disabled={mutation.isPending}
                    error={errors.url || fieldError(mutation.error, "url")}
                />
                <Textarea
                    label="Комментарий"
                    maxLength={5000}
                    autosize
                    minRows={3}
                    maxRows={7}
                    value={comment}
                    onChange={(event) => setComment(event.currentTarget.value)}
                    disabled={mutation.isPending}
                    error={fieldError(mutation.error, "comment")}
                />
                <FormError error={mutation.error} />
                <Group
                    justify="flex-end"
                    mt="sm"
                    pb="lg"
                >
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
                        Сохранить покупку
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
