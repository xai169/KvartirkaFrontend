import { Alert, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useIsMutating } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { registerSW } from "virtual:pwa-register";
import { queryClient } from "./queryClient";

export function PwaUpdates() {
    const [available, setAvailable] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState("");
    const pending = useIsMutating() > 0;
    const registration = useRef<ServiceWorkerRegistration | undefined>(undefined);
    const accepted = useRef(false);
    const reloadReady = useRef(false);
    const channel = useRef<MessageChannel | null>(null);
    const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
        let disposed = false;
        let previousController = navigator.serviceWorker.controller;
        const onControllerChange = () => {
            const isUpdate = previousController !== null || accepted.current;
            previousController = navigator.serviceWorker.controller;
            if (disposed || !isUpdate) return;
            reloadReady.current = true;
            clearTimeout(timeout.current);
            if (accepted.current && queryClient.isMutating() === 0) window.location.reload();
            else {
                accepted.current = false;
                setAvailable(true);
                setApplying(false);
            }
        };
        navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
        registerSW({
            immediate: true,
            onRegisteredSW: (_url, value) => {
                registration.current = value;
            },
            onNeedRefresh: () => {
                if (!disposed) setAvailable(true);
            },
            onNeedReload: () => {
                // controllerchange учитывает и документ, открытый до первой установки SW.
            },
            onRegisterError: () => {
                if (!disposed)
                    setError("Не удалось подготовить работу без сети. Перезапустите приложение при наличии связи.");
            },
        });
        const check = () => {
            if (document.visibilityState !== "visible") return;
            if (registration.current?.waiting) setAvailable(true);
            void registration.current?.update().catch(() => {
                // Ошибка проверки обновления не мешает работе текущей версии.
            });
        };
        const interval = setInterval(check, 60 * 60 * 1000);
        document.addEventListener("visibilitychange", check);
        window.addEventListener("online", check);
        return () => {
            disposed = true;
            clearInterval(interval);
            clearTimeout(timeout.current);
            channel.current?.port1.close();
            navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
            document.removeEventListener("visibilitychange", check);
            window.removeEventListener("online", check);
        };
    }, []);

    const apply = () => {
        if (queryClient.isMutating() > 0 || accepted.current) return;
        if (reloadReady.current) {
            window.location.reload();
            return;
        }
        const worker = registration.current?.waiting;
        if (!worker) {
            setError("Обновление пока не готово. Повторите попытку после восстановления связи.");
            return;
        }
        setError("");
        setApplying(true);
        accepted.current = true;
        channel.current?.port1.close();
        const connection = new MessageChannel();
        channel.current = connection;
        const fail = (message: string) => {
            clearTimeout(timeout.current);
            connection.port1.close();
            accepted.current = false;
            setApplying(false);
            setError(message);
        };
        connection.port1.onmessage = (event: MessageEvent<{ allowed: boolean }>) => {
            if (!event.data.allowed) fail("Закройте другие вкладки и окна Квартирки, затем повторите обновление.");
        };
        timeout.current = setTimeout(() => fail("Обновление не ответило. Попробуйте ещё раз."), 10_000);
        try {
            worker.postMessage({ type: "ACTIVATE_IF_SINGLE_CLIENT" }, [connection.port2]);
        } catch {
            fail("Не удалось применить обновление. Попробуйте ещё раз.");
        }
    };

    return (
        <>
            {(available || error) && (
                <Alert
                    color={error ? "orange" : "teal"}
                    radius={0}
                    role="status"
                >
                    <Group justify="space-between">
                        <Text size="sm">{error || "Доступна новая версия Квартирки."}</Text>
                        <Group gap="xs">
                            {available && (
                                <Button
                                    size="xs"
                                    disabled={pending}
                                    onClick={() => setConfirm(true)}
                                >
                                    Обновить
                                </Button>
                            )}
                            <Button
                                size="xs"
                                variant="subtle"
                                onClick={() => {
                                    setAvailable(false);
                                    setError("");
                                }}
                            >
                                Позже
                            </Button>
                        </Group>
                    </Group>
                </Alert>
            )}
            <Modal
                opened={confirm}
                onClose={() => {
                    if (!applying) setConfirm(false);
                }}
                title="Обновить приложение?"
                centered
                closeOnEscape={!applying}
                closeOnClickOutside={!applying}
                withCloseButton={!applying}
            >
                <Stack>
                    <Text size="sm">
                        Приложение перезагрузится. Несохранённые поля будут потеряны. Сначала сохраните изменения или
                        отмените обновление.
                    </Text>
                    {error && <Alert color="orange">{error}</Alert>}
                    {pending && <Text size="sm">Дождитесь завершения текущей операции.</Text>}
                    <Group justify="flex-end">
                        <Button
                            variant="default"
                            disabled={applying}
                            onClick={() => setConfirm(false)}
                            data-autofocus
                        >
                            Отмена
                        </Button>
                        <Button
                            loading={applying}
                            disabled={pending}
                            onClick={apply}
                        >
                            Перезагрузить и обновить
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
