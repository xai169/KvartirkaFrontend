import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { App } from "app/App";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./shared/styles/globals.css";

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <App />
    </StrictMode>,
);
