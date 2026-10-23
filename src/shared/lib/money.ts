const rublesFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

export function formatMoney(value: number | bigint): string {
    const minor = BigInt(value);
    const whole = minor / 100n;
    const fraction = minor % 100n;
    return `${rublesFormatter.format(whole)}${fraction === 0n ? "" : `,${fraction.toString().padStart(2, "0")}`} ₽`;
}

export function moneyInputValue(value: number): string {
    const minor = BigInt(value);
    return `${minor / 100n}${minor % 100n ? `,${(minor % 100n).toString().padStart(2, "0")}` : ""}`;
}

export function parseMoney(value: string, allowZero = false): number | null {
    const normalized = value.trim().replace(/[\s\u00a0\u202f]/g, "");
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(normalized)) return null;
    const [whole, fraction = ""] = normalized.replace(",", ".").split(".");
    const amount = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
    if (amount > BigInt(Number.MAX_SAFE_INTEGER) || (!allowZero && amount === 0n)) return null;
    return Number(amount);
}
