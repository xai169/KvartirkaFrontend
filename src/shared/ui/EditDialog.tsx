import { Drawer, Modal } from "@mantine/core";
import { useIsMutating, type QueryKey } from "@tanstack/react-query";
import type { ReactNode } from "react";

export function EditDialog({
    opened,
    title,
    mutationKey,
    drawer = false,
    onClose,
    children,
}: {
    opened: boolean;
    title: string;
    mutationKey: QueryKey;
    drawer?: boolean;
    onClose: () => void;
    children: ReactNode;
}) {
    const pending = useIsMutating({ mutationKey }) > 0;
    const shared = {
        opened,
        title,
        onClose: () => {
            if (!pending) onClose();
        },
        closeOnClickOutside: !pending,
        closeOnEscape: !pending,
        withCloseButton: !pending,
        onExitTransitionEnd: () => {
            if (document.activeElement === document.body) document.getElementById("main-content")?.focus();
        },
    };
    // Оболочка остаётся смонтированной: Mantine наблюдает opened и возвращает фокус.
    // Содержимое формы создаётся заново при открытии, чтобы сбросить поля и ошибки.
    return drawer ? (
        <Drawer
            {...shared}
            position="right"
            size="md"
        >
            {children}
        </Drawer>
    ) : (
        <Modal
            {...shared}
            centered
        >
            {children}
        </Modal>
    );
}
