export class ApiError extends Error {
    readonly status: number | null;
    readonly code: string;
    readonly fields: Record<string, string>;

    constructor(status: number | null, code: string, fields: Record<string, string> = {}) {
        super(code);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.fields = fields;
    }
}

export function errorMessage(error: unknown): string {
    if (!(error instanceof ApiError)) return "Что-то пошло не так. Попробуйте ещё раз.";
    if (error.status === null) return "Не удалось связаться с сервером. Проверьте подключение и повторите попытку.";
    if (error.status === 401) return "Сессия завершена. Войдите снова.";
    if (error.status === 400) return "Проверьте заполнение полей формы.";
    if (error.status === 404) return "Запись больше не существует. Обновите страницу.";
    if (error.status === 409) return "Данные изменились. Обновите страницу и повторите действие.";
    if (error.status === 429) return "Слишком много запросов. Подождите немного и попробуйте снова.";
    return "Сервер временно недоступен. Попробуйте ещё раз чуть позже.";
}

export function fieldError(error: unknown, field: string): string | undefined {
    return error instanceof ApiError && field in error.fields ? "Проверьте значение поля" : undefined;
}
