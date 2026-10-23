import { useEffect, useState } from "react";
import { todayDate } from "./dates";

export function useCurrentDate(): string {
    const [today, setToday] = useState(todayDate);
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const update = () => {
            setToday(todayDate());
            clearTimeout(timer);
            const now = new Date();
            const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            timer = setTimeout(update, midnight.getTime() - now.getTime() + 100);
        };
        update();
        window.addEventListener("focus", update);
        document.addEventListener("visibilitychange", update);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("focus", update);
            document.removeEventListener("visibilitychange", update);
        };
    }, []);
    return today;
}
