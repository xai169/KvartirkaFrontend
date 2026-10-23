import { Alert } from "@mantine/core";
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);
    return () => {
        window.removeEventListener("online", callback);
        window.removeEventListener("offline", callback);
    };
}
export function NetworkStatus() {
    const online = useSyncExternalStore(subscribe, () => navigator.onLine);
    return online ? null : (
        <Alert
            color="orange"
            radius={0}
            role="status"
        >
            Нет подключения к сети. Изменения не сохраняются автоматически — повторите действие после восстановления
            связи.
        </Alert>
    );
}
