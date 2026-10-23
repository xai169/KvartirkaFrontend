export const roomLabels = {
    kitchen: "Кухня",
    bedroom: "Спальня",
    "living-room": "Гостиная",
    bathroom: "Ванная",
    hallway: "Прихожая",
    common: "Общие",
};
export const categoryLabels = {
    furniture: "Мебель",
    appliances: "Техника",
    lighting: "Освещение",
    plumbing: "Сантехника",
    textile: "Текстиль",
    tableware: "Посуда",
    decor: "Декор",
    tools: "Инструменты",
    other: "Другое",
};
export const statusLabels = { planned: "Запланировано", ordered: "Заказано", purchased: "Куплено" };
export type PurchaseRoom = keyof typeof roomLabels;
export type PurchaseCategory = keyof typeof categoryLabels;
export type PurchaseStatus = keyof typeof statusLabels;
export interface PurchaseInput {
    name: string;
    priceMinor: number;
    room: PurchaseRoom;
    category: PurchaseCategory;
    status: PurchaseStatus;
    store: string | null;
    url: string | null;
    comment: string | null;
}
export interface Purchase extends PurchaseInput {
    id: string;
    createdByUserId: string;
    createdAt: string;
    updatedAt: string;
}
export interface PurchaseFilters {
    room?: PurchaseRoom;
    category?: PurchaseCategory;
    status?: PurchaseStatus;
}
export const optionsFromLabels = (labels: Record<string, string>) =>
    Object.entries(labels).map(([value, label]) => ({ value, label }));
export function isRoom(value: unknown): value is PurchaseRoom {
    return typeof value === "string" && Object.hasOwn(roomLabels, value);
}
export function isCategory(value: unknown): value is PurchaseCategory {
    return typeof value === "string" && Object.hasOwn(categoryLabels, value);
}
export function isStatus(value: unknown): value is PurchaseStatus {
    return typeof value === "string" && Object.hasOwn(statusLabels, value);
}

export function normalizePurchaseFilters(search: Record<string, unknown>): PurchaseFilters {
    return {
        room: isRoom(search.room) ? search.room : undefined,
        category: isCategory(search.category) ? search.category : undefined,
        status: isStatus(search.status) ? search.status : undefined,
    };
}
export function selectPurchases(items: Purchase[], filters: PurchaseFilters): Purchase[] {
    const order = { planned: 0, ordered: 1, purchased: 2 };
    return items
        .filter(
            (item) =>
                (!filters.room || item.room === filters.room) &&
                (!filters.status || item.status === filters.status) &&
                (!filters.category || item.category === filters.category),
        )
        .sort((a, b) => order[a.status] - order[b.status] || b.updatedAt.localeCompare(a.updatedAt));
}
export function calculatePurchasesSummary(items: Purchase[]) {
    const summary = { total: 0n, planned: 0n, ordered: 0n, purchased: 0n, active: 0n, unknownPriceCount: 0 };
    for (const item of items) {
        summary.total += BigInt(item.priceMinor);
        summary[item.status] += BigInt(item.priceMinor);
        if (item.priceMinor === 0) summary.unknownPriceCount++;
    }
    summary.active = summary.planned + summary.ordered;
    return summary;
}
export function safeProductUrl(value: string): string | null {
    try {
        const url = new URL(value);
        return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password
            ? url.href
            : null;
    } catch {
        return null;
    }
}
