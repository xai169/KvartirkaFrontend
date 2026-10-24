// Обновление одной вкладки не должно перезагружать формы в остальных.
self.addEventListener("message", (event) => {
    if (event.data?.type !== "ACTIVATE_IF_SINGLE_CLIENT") return;
    event.waitUntil(
        (async () => {
            const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
            const allowed = windows.length === 1 && windows[0].id === event.source?.id;
            if (allowed) await self.skipWaiting();
            event.ports[0]?.postMessage({ allowed });
        })(),
    );
});
