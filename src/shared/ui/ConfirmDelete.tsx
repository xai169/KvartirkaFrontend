import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { FormError } from "./ResourceState";

export function ConfirmDelete({
    opened,
    title,
    description,
    pending,
    error,
    onClose,
    onConfirm,
}: {
    opened: boolean;
    title: string;
    description: string;
    pending: boolean;
    error: unknown;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <Modal
            opened={opened}
            onExitTransitionEnd={() => {
                if (document.activeElement === document.body) document.getElementById("main-content")?.focus();
            }}
            onClose={onClose}
            title={title}
            centered
            closeOnClickOutside={!pending}
            closeOnEscape={!pending}
            withCloseButton={!pending}
        >
            <Stack>
                <Text size="sm">{description} Это действие нельзя отменить.</Text>
                <FormError error={error} />
                <Group justify="flex-end">
                    <Button
                        variant="default"
                        disabled={pending}
                        onClick={onClose}
                        data-autofocus
                    >
                        Отмена
                    </Button>
                    <Button
                        color="red"
                        loading={pending}
                        onClick={onConfirm}
                    >
                        Удалить
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
