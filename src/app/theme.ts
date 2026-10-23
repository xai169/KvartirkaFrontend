import { createTheme, Drawer, Modal, Notification, PasswordInput } from "@mantine/core";

export const theme = createTheme({
    primaryColor: "teal",
    defaultRadius: "10px",
    components: {
        Modal: Modal.extend({ defaultProps: { closeButtonProps: { "aria-label": "Закрыть окно" } } }),
        Drawer: Drawer.extend({ defaultProps: { closeButtonProps: { "aria-label": "Закрыть форму" } } }),
        Notification: Notification.extend({
            defaultProps: { closeButtonProps: { "aria-label": "Закрыть уведомление" } },
        }),
        PasswordInput: PasswordInput.extend({
            defaultProps: { visibilityToggleButtonProps: { "aria-label": "Показать или скрыть пароль" } },
        }),
    },
});
