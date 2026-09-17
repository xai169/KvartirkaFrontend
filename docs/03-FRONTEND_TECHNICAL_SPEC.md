# Технические требования к frontend приложения «Квартирка»

## 1. Назначение документа

Документ фиксирует технологический стек, интеграционный контракт, UI-требования, правила кодирования и критерии технической готовности frontend.

Источники требований:

1. `BACKEND_SPEC.md` — HTTP API, DTO, авторизация и ограничения backend;
2. `01-FRONTEND_BUSINESS_SPEC.md` — пользовательское поведение и расчёты;
3. `02-FRONTEND_ARCHITECTURE.md` — структура и зависимости;
4. этот документ — техническая реализация;
5. `04-FRONTEND_IMPLEMENTATION_PLAN.md` — порядок работ, но не новый источник поведения;
6. `05-FRONTEND_EXECUTION_CHECKLIST.md` — рабочая последовательность действий, но не новый источник требований.

---

# 2. Технологический стек

## 2.1. Обязательный runtime stack

Использовать:

- React;
- TypeScript;
- Vite;
- pnpm;
- Mantine;
- CSS Modules;
- PostCSS с `postcss-preset-mantine` и `postcss-simple-vars`;
- TanStack Router;
- TanStack Query;
- Fetch API через собственный небольшой client;
- Motion для React;
- `@tabler/icons-react`;
- dayjs;
- Mantine Notifications;
- Mantine Dates;
- `vite-plugin-pwa`.

CSS Modules используют встроенную поддержку Vite и не требуют отдельной runtime-библиотеки.

Все устанавливаемые версии должны быть взаимно совместимы и зафиксированы `pnpm-lock.yaml`.

## 2.2. Инструменты разработки

Использовать:

- Node.js 24 LTS, чтобы frontend и backend использовали одну базовую Node-версию;
- strict TypeScript;
- ESLint;
- Prettier;
- Vite development server;
- TanStack Router Vite plugin/code generation;
- TanStack Query Devtools только в development при необходимости;
- TanStack Router Devtools только в development при необходимости.

## 2.3. Не устанавливать на старте

Не добавлять без отдельной необходимости:

- Redux Toolkit;
- Zustand;
- MobX;
- Axios;
- React Hook Form;
- TanStack Form;
- TanStack Table;
- `@mantine/charts`;
- Storybook;
- Sentry;
- i18n-библиотеку;
- отдельную offline database;
- service worker framework помимо используемого PWA plugin/Workbox integration.

## 2.4. Условия подключения отложенных библиотек

### TanStack Form

Подключается, когда формы получают сложный lifecycle, зависимые поля, массивы, nested values или значительный повторяемый field UI.

### TanStack Table

Подключается, когда возникает настоящая таблица с column sorting, selection, pagination, resizing или управлением колонками.

### Zustand

Подключается только при появлении глобального client-only state, который не принадлежит Router, Query, Mantine theme или локальному компоненту.

### Mantine Charts

Подключается при утверждении конкретных графиков аналитики.

### Zod

Подключается, если client validation становится разветвлённой, повторяется между формами или возникает подтверждённая необходимость runtime-валидации внешних данных. Для API-запросов и небольших форм MVP Zod не обязателен.

---

# 3. Инициализация проекта

## 3.1. Package manager

Использовать только pnpm.

Не коммитить lockfiles других package managers.

## 3.2. Основные scripts

Минимально предусмотреть:

```text
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm typecheck
pnpm format
pnpm format:check
```

Автоматические тесты в первой версии не входят в scope, поэтому test runner и test scripts не обязательны.

## 3.3. TypeScript

Требования:

- `strict: true`;
- не использовать `any`;
- не отключать отдельные strict-проверки без зафиксированной причины;
- не применять type assertions для маскировки некорректной модели;
- поддерживать разделение DOM и Node/Vite типов;
- настроить alias `@/*` на `src/*`, если он не конфликтует с Router tooling.

## 3.4. Vite

Vite должен:

- запускать React-приложение в development;
- поддерживать TanStack Router generation;
- обрабатывать colocated CSS Modules;
- применять утверждённую PostCSS-конфигурацию к CSS;
- собирать production static assets;
- генерировать PWA manifest/service worker;
- не содержать секретов в client environment.

## 3.5. PostCSS

Использовать:

- `postcss-preset-mantine` для Mantine-совместимых CSS-возможностей;
- `postcss-simple-vars` для согласованных compile-time variables, необходимых CSS Modules;
- один явный `postcss.config.*`, а не разрозненную обработку CSS по features.

Значения breakpoints в PostCSS variables должны совпадать с breakpoints Mantine theme. PostCSS configuration не становится второй независимой дизайн-системой.

---

# 4. Переменные окружения

## 4.1. API base path

Frontend использует фиксированный относительный base path:

```text
/api/v1
```

Отдельная переменная `VITE_API_BASE_URL` в MVP не требуется. В development запросы `/api` проксируются Vite на локальный backend, а в production тот же путь проксируется Nginx.

`.env.example` создаётся только при появлении реальных публичных frontend-настроек. Допускается добавить `VITE_APP_NAME`, если название действительно конфигурируется, но захардкоженное название приложения само по себе не требует env.

## 4.2. Чтение environment

Если frontend environment variables появятся, они читаются централизованно через `shared/config/env.ts`. Простых явных проверок достаточно; Zod для environment не устанавливается без реальной необходимости.

Нельзя разбрасывать обращения к `import.meta.env` по features.

## 4.3. Секреты

Любая переменная `VITE_*` попадает в client bundle и считается публичной.

Нельзя хранить в frontend env:

- passwords;
- session tokens;
- private API keys;
- database credentials;
- production secrets.

---

# 5. Интеграция с backend

## 5.1. Base path

Frontend работает с REST API:

```text
/api/v1
```

## 5.2. Development

Предполагаемый локальный сценарий:

```text
frontend: http://localhost:5173
backend:  http://localhost:3000
```

Vite development server проксирует `/api` на локальный backend. Browser обращается к относительному `/api/v1`, поэтому feature-код одинаков в development и production. Backend по-прежнему должен корректно устанавливать session cookie для development-конфигурации.

## 5.3. Production

Целевой вариант после завершения разработки:

```text
https://<domain>/           → frontend static files
https://<domain>/api/v1/*   → reverse proxy to NestJS
```

Frontend должен поддерживать относительный API base URL и не зависеть от отдельного backend domain.

## 5.4. Cookies

Каждый API-запрос выполняется с:

```ts
credentials: "include"
```

Frontend:

- не читает `flat_session`;
- не сохраняет session token;
- не использует JWT;
- не реализует refresh token flow;
- не добавляет Authorization header.

---

# 6. API client

## 6.1. Расположение

```text
src/shared/api/apiClient.ts
src/shared/api/apiError.ts
src/shared/api/api.types.ts
```

## 6.2. Возможности

Client должен поддерживать:

- `GET`;
- `POST`;
- `PUT`;
- `PATCH`;
- `DELETE`;
- JSON request/response;
- `204 No Content`;
- `credentials: include`;
- фиксированный base path `/api/v1`;
- нормализованную ошибку;
- необязательный `AbortSignal`;
- query parameters.

Возможный интерфейс:

```ts
apiClient.get<TResponse>(path, options)
apiClient.post<TResponse, TBody>(path, body, options)
apiClient.put<TResponse, TBody>(path, body, options)
apiClient.patch<TResponse, TBody>(path, body, options)
apiClient.delete(path, options)
```

Конкретная форма не обязательна, если сохраняются ответственность и типобезопасность.

## 6.3. Response parsing

Правила:

- `204` возвращает `undefined` без попытки parse JSON;
- JSON parse выполняется только при наличии body;
- неожиданный не-JSON error response всё равно преобразуется в безопасный `ApiError`;
- успешный response не должен автоматически показывать notification.

## 6.4. Backend error contract

Frontend ожидает:

```ts
interface ApiErrorPayload {
    error: {
        code: string;
        message: string;
        fields?: Record<string, string>;
        requestId?: string;
    };
}
```

Внутренняя ошибка должна содержать как минимум:

```ts
interface ApiError {
    status: number | null;
    code: string;
    message: string;
    fields?: Record<string, string>;
    requestId?: string;
    cause?: unknown;
}
```

Не использовать `instanceof` на plain object без контролируемого класса/type guard.

## 6.5. Retry

- Query GET-запросы могут повторяться ограниченное количество раз при network/5xx errors.
- `401`, `400`, `404`, `409` не должны бессмысленно retry.
- Mutations не retry автоматически, чтобы не создать дубликаты.

---

# 7. Используемые endpoints

Frontend должен интегрироваться только с endpoints, существующими в backend-ТЗ.

## 7.1. Auth

```text
POST /auth/login
POST /auth/logout
GET  /me
```

## 7.2. Savings

```text
GET    /savings/goal
PUT    /savings/goal
GET    /savings/entries
POST   /savings/entries
PATCH  /savings/entries/:id
DELETE /savings/entries/:id
```

## 7.3. Purchases

```text
GET    /purchases
GET    /purchases/:id
POST   /purchases
PATCH  /purchases/:id
DELETE /purchases/:id
```

## 7.4. Не обращаться к отсутствующим endpoints

Не создавать frontend calls для:

```text
/auth/refresh
/savings/summary
/purchases/summary
/rooms
/purchase-categories
/analytics
```

---

# 8. API-типы

## 8.1. User

```ts
interface User {
    id: string;
    login: string;
    username: string;
}
```

## 8.2. Login

```ts
interface LoginRequest {
    login: string;
    password: string;
}

interface LoginResponse {
    user: User;
}
```

## 8.3. Savings goal

```ts
interface SavingsGoal {
    targetAmountMinor: number;
    targetDate: string;
}
```

## 8.4. Savings entry

```ts
interface SavingsEntry {
    id: string;
    amountMinor: number;
    date: string;
    comment: string | null;
    createdByUserId: string;
    createdAt: string;
    updatedAt: string;
}

interface SavingsEntriesResponse {
    items: SavingsEntry[];
}
```

Create/update input types должны соответствовать разрешённым backend fields и не содержать `createdByUserId`.

## 8.5. Purchase

```ts
type PurchaseStatus = "planned" | "ordered" | "purchased";

type PurchaseRoom =
    | "kitchen"
    | "bedroom"
    | "living-room"
    | "bathroom"
    | "hallway"
    | "common";

type PurchaseCategory =
    | "furniture"
    | "appliances"
    | "lighting"
    | "plumbing"
    | "textile"
    | "tableware"
    | "decor"
    | "tools"
    | "other";

interface Purchase {
    id: string;
    name: string;
    priceMinor: number;
    room: PurchaseRoom;
    category: PurchaseCategory;
    status: PurchaseStatus;
    store: string | null;
    url: string | null;
    comment: string | null;
    createdByUserId: string;
    createdAt: string;
    updatedAt: string;
}

interface PurchasesResponse {
    items: Purchase[];
}
```

## 8.6. Runtime response validation

Полная Zod-валидация каждого backend response в MVP не обязательна.

Она может быть добавлена на API boundary, если контракт нестабилен или ошибки backend-формы начинают приводить к runtime failures.

Нельзя создавать ложное ощущение гарантии, используя TypeScript generic без понимания, что JSON runtime не проверяется автоматически.

---

# 9. TanStack Query

## 9.1. Query ownership

Query options и mutation options располагаются рядом с feature API.

## 9.2. Query keys

Использовать стабильные keys:

```ts
const authQueryKeys = {
    me: ["auth", "me"] as const,
};

const savingsQueryKeys = {
    goal: ["savings", "goal"] as const,
    entries: ["savings", "entries"] as const,
};

const purchasesQueryKeys = {
    list: ["purchases", "list"] as const,
    detail: (id: string) => ["purchases", "detail", id] as const,
};
```

Имена могут отличаться, но семантика должна быть стабильной.

## 9.3. Refetch behavior

Для shared-данных двух пользователей:

- `refetchOnWindowFocus` включён;
- `refetchOnReconnect` включён;
- после mutation выполняется invalidate/refetch;
- background polling в MVP не обязателен;
- real-time синхронизация не гарантируется.

При необходимости интерфейс может предоставить ручное обновление.

## 9.4. Cache after logout

После logout нужно очистить пользовательские queries, чтобы следующий пользователь не увидел предыдущие данные из кеша.

## 9.5. Optimistic updates

Optimistic updates в MVP не обязательны.

Предпочтительный простой flow:

```text
submit mutation
→ получить success
→ invalidate query
→ получить актуальные данные
→ закрыть форму/показать notification
```

Если позже optimistic update добавляется, должен существовать rollback при ошибке.

## 9.6. Cancellation

Query function должен принимать и передавать `AbortSignal`, если используемый helper поддерживает отмену.

---

# 10. TanStack Router

## 10.1. Маршруты

```text
/login
/
/purchases
/profile
```

## 10.2. File-based routing

Использовать file-based routing TanStack Router.

Generated route tree не редактировать вручную.

## 10.3. Protected layout

`/`, `/purchases` и `/profile` находятся под authenticated layout.

Если `GET /me` возвращает `401`, выполняется redirect на `/login`.

## 10.4. Login redirect

При переходе на protected route без сессии допускается сохранять целевой URL в search-параметре:

```text
/login?redirect=/purchases
```

Redirect должен принимать только внутренний безопасный path, чтобы не создать open redirect.

## 10.5. Not found

Неизвестный frontend route показывает понятный 404 screen с действием перехода на главную.

## 10.6. Production fallback

Nginx/production server должен отдавать `index.html` для неизвестных frontend paths, исключая:

- `/api/*`;
- реальные static assets;
- health/backend routes.

Без SPA fallback прямое открытие `/purchases` или refresh страницы будет возвращать server 404.

---

# 11. Авторизация

## 11.1. Login form

Поля:

```text
login: 1–100 символов
password: обязательное непустое значение
```

Password не логируется и не сохраняется после submit.

## 11.2. Pending state

Во время login:

- submit button disabled;
- повторный submit не отправляется;
- показывается loader;
- inputs могут оставаться доступными или блокироваться единообразно.

## 11.3. Success

После login:

- записать `response.user` в cache либо invalidation/refetch `/me`;
- очистить password state;
- перейти на целевой route.

## 11.4. Invalid credentials

При `INVALID_CREDENTIALS`/401 на login показать:

> Неверный логин или пароль

## 11.5. Session expiration

Один централизованный механизм должен:

- распознать unauthenticated response;
- очистить private cache;
- перенаправить на login;
- не создавать notification storm.

## 11.6. Logout

При logout:

1. отправить `POST /auth/logout`;
2. даже если server session уже истекла, привести client к logged-out state;
3. очистить query cache;
4. перейти на `/login`.

---

# 12. Денежные значения

## 12.1. Внутренняя единица

Все денежные значения в:

- API types;
- query cache;
- calculations;
- form submit payloads

представляются integer minor units.

## 12.2. Naming

Использовать suffix `Minor`:

```text
targetAmountMinor
amountMinor
priceMinor
savedAmountMinor
remainingAmountMinor
```

Не использовать неоднозначные `amount`/`price` для значения в копейках.

## 12.3. Display

Форматирование выполняется через `Intl.NumberFormat` с locale `ru-RU` и currency `RUB` либо эквивалентный единый helper.

Примеры:

```text
12000000 → 120 000 ₽
50000 → 500 ₽
12345 → 123,45 ₽
```

## 12.4. Input

Пользователь вводит сумму в рублях.

Parser должен:

- принимать пробелы в разрядах;
- принимать запятую или точку как separator;
- допускать не более двух знаков после separator;
- превращать строку в integer minor units;
- не опираться на хранение floating point как source of truth.

## 12.5. Safe integer

Перед отправкой сумма должна удовлетворять:

```text
Number.isSafeInteger(valueMinor)
```

## 12.6. Calculation

Суммирование выполняется только над integers.

Процент может быть floating point, но денежный результат — integer.

---

# 13. Даты

## 13.1. API date

Поля:

```text
targetDate
date
```

используют `YYYY-MM-DD` без timezone.

## 13.2. UI date

В интерфейсе дата показывается на русском, например:

```text
30 июня 2027
27 августа
```

## 13.3. Calendar calculations

Месячный план использует локальный календарный месяц пользователя.

Календарная дата должна парситься явно без случайного UTC shift.

## 13.4. Entry date validation

В обычном UI:

- дата обязательна;
- дата должна соответствовать `YYYY-MM-DD` после преобразования;
- будущая дата блокируется;
- минимальная дата специально не ограничивается на MVP.

Backend остаётся окончательным валидатором API-formats.

## 13.5. Timestamps

`createdAt`/`updatedAt` используются для сортировки и при необходимости показываются в local timezone.

---

# 14. Клиентские бизнес-расчёты

## 14.1. Общие правила

- расчёты являются чистыми функциями;
- входные массивы не мутируются;
- результат детерминирован относительно переданного `currentDate`;
- `currentDate` передаётся параметром, а не читается в каждой вспомогательной функции;
- денежные результаты — integer minor units;
- функции не зависят от React.

## 14.2. Savings overview

Создать функцию уровня:

```ts
calculateSavingsOverview(
    goal: SavingsGoal,
    entries: SavingsEntry[],
    currentDate: CalendarDate,
): SavingsOverview
```

Она реализует формулы `01-FRONTEND_BUSINESS_SPEC.md`.

Обязательные edge cases:

- нет entries;
- цель достигнута точно;
- цель превышена;
- deadline сегодня;
- deadline в текущем месяце;
- deadline прошёл;
- target month в следующем году;
- historical entry отредактирована;
- деление суммы между месяцами с остатком в копейках.

## 14.3. Purchase summary

Создать:

```ts
calculatePurchasesSummary(purchases: Purchase[]): PurchasesSummary
```

Результат содержит:

```text
totalAmountMinor
plannedAmountMinor
orderedAmountMinor
purchasedAmountMinor
activeAmountMinor
unknownPriceCount
totalCount
countsByStatus
```

## 14.4. Filter/sort/group

Функции должны быть независимы:

```text
filterPurchases
sortPurchases
groupPurchasesByRoom
groupPurchasesByCategory
```

Не объединять всё в один трудно проверяемый hook.

---

# 15. Формы и validation

## 15.1. Подход MVP

Использовать:

- controlled/local React state;
- одну feature-level функцию validation;
- field errors;
- один submit handler;
- reset при успешном закрытии/создании;
- сохранение values при server error.

Zod не является обязательной зависимостью. Он подключается, если правила validation становятся сложными, повторяются между формами или требуют схемной композиции.

## 15.2. Login schema

```text
login: string, trim, 1–100
password: non-empty string
```

## 15.3. Savings goal schema

```text
targetAmountMinor: safe integer > 0
targetDate: valid YYYY-MM-DD
```

Frontend дополнительно предупреждает, если target date уже прошла, но может разрешить сохранение только после явного решения продукта. Для MVP предпочтительно не разрешать новую дату в прошлом.

## 15.4. Savings entry schema

```text
amountMinor: safe integer > 0
date: valid YYYY-MM-DD and not future
comment: null or string <= 2000
```

Пустой комментарий перед отправкой преобразуется в `null`.

## 15.5. Purchase schema

```text
name: trim, 1–200
priceMinor: safe integer >= 0
room: PurchaseRoom
category: PurchaseCategory
status: PurchaseStatus
store: null or trim <= 200
url: null or valid http/https URL
comment: null or string <= 5000
```

Пустые optional strings преобразуются в `null`.

## 15.6. URL

Разрешать только `http:` и `https:`.

Открытие ссылки:

```text
target=_blank
rel=noopener noreferrer
```

## 15.7. Backend field errors

Если backend возвращает `fields`, frontend сопоставляет API field с UI field.

Если сопоставление невозможно, показывается общий form error.

---

# 16. UI library и styling

## 16.1. Mantine-компоненты

Использовать Mantine для готовых интерактивных компонентов и accessibility behavior.

Минимально ожидаются:

- `AppShell`;
- `Button`/`ActionIcon`;
- `TextInput`/`PasswordInput`;
- `NumberInput` либо контролируемый money input;
- `Select`;
- `Textarea`;
- date input/picker;
- `Drawer`/`Modal`;
- `Menu`;
- `Tabs`/`SegmentedControl`;
- `Badge`;
- `Progress`;
- `Skeleton`;
- `Notification`;
- `Alert`.

## 16.2. Mantine theme

Mantine theme определяет глобальную дизайн-систему:

- основную палитру;
- light/dark color scheme;
- typography;
- radius и shadows;
- breakpoints;
- semantic colors и CSS variables;
- общие defaults Mantine-компонентов.

Повторяющиеся значения не должны независимо определяться в JSX и CSS Modules, если они являются design tokens.

## 16.3. Mantine layout и style props

Для простого layout и композиции использовать:

- `Stack`;
- `Group`;
- `Flex`;
- `Grid`;
- spacing и размеры;
- alignment;
- простые responsive props.

Не создавать CSS-класс только ради элементарного layout, который ясно читается через Mantine API.

## 16.4. CSS Modules

CSS Modules использовать для собственного визуального оформления компонента:

- сложных фонов и градиентов;
- нестандартной сетки;
- декоративных элементов;
- сложного позиционирования;
- component-level responsive rules;
- hover, active, focus и других состояний;
- внутренних частей Mantine-компонентов через `classNames` и Styles API;
- отдельных light/dark правил.

Файл располагается рядом с компонентом:

```text
savingsSummary/
├── SavingsSummary.tsx
└── SavingsSummary.module.css
```

Имя CSS Module повторяет `PascalCase`-имя компонента; class names внутри module должны оставаться локальными и осмысленными.

## 16.5. Глобальные стили и import order

Глобальный CSS ограничивается правилами для:

- `html`;
- `body`;
- `#root`;
- базового фона и минимальной высоты приложения;
- глобального сглаживания шрифтов;
- редких общих reset-правил.

Компонентные стили не переносятся в global stylesheet. Обязательные Mantine styles, package styles и глобальный stylesheet подключаются в одном документированном порядке.

## 16.6. Design tokens и hardcoded values

В feature JSX не следует массово использовать конкретные hex values.

Цвета, повторяющиеся spacing, radius и другие общие значения должны идти через:

- Mantine palette/theme;
- semantic CSS variables;
- ограниченные feature status mappings.

CSS Modules не должны содержать хаотично продублированные light/dark цвета. Обе схемы опираются на Mantine theme и связанные CSS variables.

## 16.7. PostCSS

CSS Modules обрабатываются общей PostCSS-конфигурацией с `postcss-preset-mantine` и `postcss-simple-vars`.

PostCSS variables используются как технический мост для CSS, а не как независимый источник product tokens. Breakpoints и повторяющиеся значения синхронизируются с Mantine theme.

## 16.8. Icons

Использовать `@tabler/icons-react`.

Иконка не заменяет label там, где действие может быть неоднозначно.

Tailwind CSS не входит в целевой frontend-стек и не используется как источник layout, component styles или responsive rules.

---

# 17. Темы

## 17.1. Поддерживаемые темы

Только:

```text
light
dark
```

Пользовательский вариант `system` в UI не требуется.

## 17.2. Initial theme

При первом запуске без сохранённого выбора допускается определить начальную схему из системной настройки, но сохранить и отображать нужно один из двух resolved values: `light` или `dark`.

## 17.3. Persistence

Выбор хранится в localStorage через Mantine color scheme manager.

Рекомендуемый key:

```text
kvartirka-color-scheme
```

## 17.4. Flash prevention

Использовать Mantine `ColorSchemeScript` или эквивалентный механизм до React render, чтобы минимизировать flash неправильной темы.

## 17.5. Theme coverage

Обе темы строятся через Mantine theme и CSS variables. CSS Modules могут задавать theme-specific правила, но не должны создавать отдельную палитру для каждого компонента.

Проверить в обеих темах:

- login;
- navigation;
- main savings card;
- progress;
- purchases cards;
- badges;
- forms;
- modals/drawers;
- notifications;
- empty/error/loading states;
- focus/disabled states.

---

# 18. Responsive UI

## 18.1. Breakpoint strategy

Mantine theme является источником согласованных mobile-first breakpoints.

Простые responsive-настройки выражаются Mantine props. Сложные component-level правила размещаются в CSS Module и используют согласованные PostCSS variables. Не создавать независимую breakpoint-систему с несовпадающими значениями.

## 18.2. Mobile

Требования:

- fixed bottom navigation;
- учёт `env(safe-area-inset-bottom)`;
- content bottom padding не позволяет навигации перекрыть карточки;
- drawers удобны для экранной клавиатуры;
- основной action доступен одной рукой;
- минимум горизонтального scroll;
- room tabs могут скроллиться горизонтально внутри контейнера.

## 18.3. Desktop

На широком экране:

- контент получает max-width;
- summary cards могут образовать grid;
- navigation переносится в header;
- формы не растягиваются на всю ширину;
- список покупок может иметь 2–3 колонки при достаточной ширине.

## 18.4. Touch targets

Интерактивные кнопки и иконки должны иметь комфортную touch area, ориентир — около 44×44 CSS pixels для основных действий.

---

# 19. Компонентные состояния

Каждый API-блок должен поддерживать:

## 19.1. Loading

- skeleton вместо прыгающей пустой страницы;
- disabled submit при mutation;
- page loader только когда нельзя показать полезную cached content.

## 19.2. Empty

- отдельное содержательное сообщение;
- рекомендуемое следующее действие.

## 19.3. Error

- понятный текст;
- retry action;
- отсутствие raw stack trace;
- requestId в технических деталях при необходимости.

## 19.4. Success

- актуальные данные;
- notification после мутации;
- focus возвращается в логичное место после закрытия modal/drawer.

## 19.5. Stale cached content

При background refetch допустимо продолжать показывать старые данные с ненавязчивым loading indicator вместо полного skeleton reset.

---

# 20. Notifications и dialogs

## 20.1. Notifications

Notifications используются для кратких результатов mutation, но не заменяют inline validation.

Не показывать notification на каждый успешный GET.

## 20.2. Confirmation

Удаление требует confirmation dialog с названием удаляемого объекта.

Кнопка destructive action визуально отличается и не является default focused action без необходимости.

## 20.3. Duplicate operations

Пока delete/update pending:

- повторное действие блокируется;
- dialog не должен отправлять второй request.

---

# 21. Анимации

## 21.1. Инструмент

Использовать `motion/react`.

## 21.2. Допустимые сценарии

- плавное изменение главной суммы;
- progress transition;
- добавление/удаление карточки;
- layout transition при фильтрации;
- появление summary blocks;
- tap feedback.

## 21.3. Ограничения

- анимация не задерживает доступ к данным;
- не использовать длинные page transitions;
- не анимировать всё одновременно;
- простые hover/focus/color/opacity transitions делать CSS в соответствующем module;
- учитывать `prefers-reduced-motion`;
- анимации не должны менять semantic DOM order или мешать focus.

---

# 22. Accessibility

Требования:

- semantic HTML;
- `button` для действий, а не clickable `div`;
- visible label для inputs;
- связка errors с полями;
- `aria-label` для icon-only controls;
- keyboard navigation;
- visible focus;
- focus trap внутри modal/drawer;
- возврат focus после закрытия;
- status announcements при необходимости;
- контраст в обеих темах;
- отсутствие информации, переданной только цветом;
- корректные heading levels;
- external links обозначены понятным текстом.

---

# 23. PWA

## 23.1. Manifest

Минимально:

```text
name: Квартирка
short_name: Квартирка
display: standalone
start_url: /
scope: /
lang: ru
```

Также задать:

- theme/background colors;
- 192×192 icon;
- 512×512 icon;
- maskable icon при возможности.

## 23.2. Service worker

Кешировать:

- app shell;
- versioned JS/CSS assets;
- локальные icons/fonts;
- offline fallback shell при необходимости.

Не кешировать как источник истины:

- login response;
- `/me`;
- savings API;
- purchases API;
- mutation requests.

API должен использовать network-first или network-only стратегию, исключающую выдачу устаревших приватных данных как постоянной offline-копии.

## 23.3. Offline

При отсутствии сети:

- app shell может открыться;
- приватные данные могут быть недоступны;
- mutation не должна делать вид, что сохранена;
- показать понятное сообщение и retry после восстановления сети.

## 23.4. Updates

Обновление service worker не должно оставлять приложение надолго на несовместимой смеси старых и новых assets.

Допускается auto-update или понятное уведомление «Доступно обновление» с reload action.

---

# 24. Производительность

## 24.1. Общие требования

- не загружать charts/form/table libraries до их использования;
- tree-shakeable icons imports;
- минимизировать повторные queries;
- не дублировать server data;
- не пересоздавать QueryClient на render;
- не загружать внешние тяжёлые изображения в MVP;
- избегать layout shift при loading.

## 24.2. Code splitting

Route-level lazy loading допускается и предпочтительно после появления заметного bundle size.

Для трёх небольших pages нельзя усложнять bootstrap только ради формального code splitting.

## 24.3. List size

Pagination и virtualization не нужны для ожидаемого небольшого числа записей.

Если реальные данные вызывают проблемы, решение принимается по измерению.

## 24.4. Fonts

Предпочтительно использовать system font stack или локально поставляемый font. Не блокировать первый render внешним font CDN без необходимости.

---

# 25. Безопасность frontend

## 25.1. Session

- token не доступен JavaScript;
- нет localStorage auth;
- все requests используют credentials;
- private cache очищается при logout.

## 25.2. XSS

- не использовать `dangerouslySetInnerHTML` для пользовательских полей;
- комментарии и названия рендерятся как text;
- URL проверяется и открывается безопасно.

## 25.3. Open redirect

`redirect` после login разрешает только внутренние application paths.

## 25.4. Logs

Не логировать:

- password;
- cookies;
- полные private API payloads в production;
- чувствительные пользовательские поля без необходимости.

## 25.5. Vite env

Не считать frontend env секретным хранилищем.

---

# 26. Русский интерфейс

## 26.1. Язык

Единственный язык MVP — русский.

Не устанавливать i18n framework.

## 26.2. Тексты

Тексты допускается хранить рядом с компонентами или в feature constants, если они повторяются.

Не создавать заранее глобальный каталог translation keys.

## 26.3. Форматы

Использовать:

- locale `ru-RU`;
- currency `RUB`;
- русские названия комнат, категорий и статусов;
- понятные даты без английских сокращений.

---

# 27. Query filters покупок

## 27.1. MVP strategy

Первоначально загружать полный список:

```text
GET /purchases
```

и выполнять фильтрацию на frontend.

Причины:

- объём данных небольшой;
- полный массив нужен для summary;
- меньше query/cache variants;
- быстрые переключения tabs.

## 27.2. Backend filters

Backend query filters могут использоваться позже при росте данных.

Если они используются, query key должен включать normalized filters.

## 27.3. URL state

Рекомендуемые search-параметры:

```text
room
status
category
```

Невалидное значение нормализуется к отсутствию фильтра, а не приводит к runtime error.

---

# 28. Профиль

## 28.1. Источник данных

Использовать уже загруженный current user query `/me`.

Не выполнять второй дублирующий запрос только для profile page.

## 28.2. Read-only

Username и login read-only.

Не отображать fake edit controls, которые не могут быть сохранены backend.

## 28.3. Theme

Theme selector управляет только локальной настройкой Mantine.

## 28.4. Avatar

Не создавать avatar upload UI.

Допускается декоративный fallback avatar с первой буквой username, не требующий backend field.

---

# 29. Кодовые соглашения

## 29.1. Exports

Предпочитать named exports.

## 29.2. Barrel files

Не создавать `index.ts`/`index.tsx` для реэкспорта.

## 29.3. Naming

- React component files — PascalCase, например `SavingsSummary.tsx`;
- component styles — файл с тем же PascalCase-именем и suffix `.module.css` рядом с component-файлом;
- остальные source-файлы и многословные каталоги — camelCase;
- kebab-case в именах source-файлов и каталогов не используется;
- CSS Module class names — локальные camelCase-имена по смыслу элемента или состояния;
- components/types — PascalCase;
- functions/variables — camelCase;
- constants — camelCase либо UPPER_SNAKE_CASE только для настоящих глобальных constants;
- boolean names — `is`, `has`, `can`, `should`.

Исключения допустимы для имён, которые задаёт tooling, code generation или file-based routing, например `vite-env.d.ts`, `routeTree.gen.ts` и route-файлы TanStack Router.

## 29.4. Props

Props-типы располагаются рядом с компонентом, если они не используются вне файла.

## 29.5. Comments

Комментарии объясняют причину или неочевидный invariant, а не пересказывают код.

## 29.6. Hooks

Не создавать custom hook только ради переименования одного вызова TanStack Query.

Hook оправдан, если он:

- объединяет lifecycle;
- скрывает повторяемое поведение;
- формирует удобную предметную модель;
- имеет самостоятельную ответственность.

## 29.7. Components

Разделять компонент, когда это:

- уменьшает предметную ответственность;
- позволяет переиспользование;
- облегчает чтение и управление state;
- отделяет сложный блок.

Не дробить каждый `div` в отдельный файл.

---

# 30. ESLint и formatting

## 30.1. ESLint

Настроить проверки для:

- TypeScript;
- React Hooks;
- неиспользуемых imports/variables;
- недопустимого `any`;
- import consistency;
- browser globals.

Желательно запретить default exports правилами проекта, кроме исключений tooling.

## 30.2. Prettier

Использовать единый config.

Не спорить formatting rules через ESLint, если это зона Prettier.

## 30.3. Import order

Можно настроить понятный порядок imports, но не добавлять тяжёлую конфигурацию, которая мешает development.

---

# 31. Автоматические тесты

## 31.1. Scope первой версии

Автоматические frontend-тесты не входят в текущую реализацию.

Не устанавливать Vitest/RTL/Playwright только ради пустой инфраструктуры.

## 31.2. Подготовленность архитектуры

Чистые функции расчётов должны быть написаны так, чтобы позже их можно было покрыть unit tests без React/browser setup.

Приоритет будущих тестов:

1. `calculateSavingsOverview`;
2. monthly plan edge cases;
3. `calculatePurchasesSummary`;
4. money parser;
5. auth redirect flow;
6. CRUD smoke E2E.

## 31.3. Текущая проверка

До добавления тестов обязательны:

```text
pnpm lint
pnpm typecheck
pnpm format:check
pnpm build
```

и ручная проверка acceptance scenarios.

---

# 32. Error boundaries

## 32.1. Root error boundary

Предусмотреть route/root error component для неожиданной ошибки render/navigation.

Он должен:

- показать безопасное сообщение;
- предложить повторную загрузку;
- не показывать stack trace production-пользователю.

## 32.2. Query errors

Query error не обязан обрушать весь React tree. Page-level resource error обрабатывается локальным error state.

---

# 33. Deployment readiness

## 33.1. Build output

Production build создаёт static assets, готовые к раздаче Nginx.

## 33.2. Base path

Production bundle использует тот же относительный путь `/api/v1`, что и development. Отдельная build-time переменная API URL не требуется.

## 33.3. SPA fallback

Nginx configuration должна включать frontend fallback на `index.html`.

## 33.4. Assets caching

Versioned assets можно кешировать длительно.

`index.html` должен обновляться так, чтобы пользователь мог получить новую версию приложения.

## 33.5. HTTPS

Production PWA и Secure session cookie требуют HTTPS.

## 33.6. Same-origin target

Планируемая production-схема на VPS:

```text
Nginx
├── /        → frontend dist
└── /api/v1  → NestJS
```

Развёртывание не входит в текущий frontend implementation scope, но сборка и API configuration не должны ему мешать.

---

# 34. Manual acceptance checklist

Перед завершением MVP вручную проверить минимум:

## Auth

- login success;
- invalid login/password;
- protected route without session;
- refresh protected route with session;
- expired/removed session;
- logout;
- login второго пользователя после logout первого без старых cached данных.

## Savings

- empty entries;
- add entry;
- edit entry;
- delete entry;
- update goal;
- exact target;
- over target;
- deadline future;
- deadline current month;
- overdue target;
- monthly plan after current-month contribution;
- monthly plan after editing previous-month entry.

## Purchases

- empty list;
- create with all fields;
- create with optional fields empty;
- create with price 0;
- edit;
- quick status change;
- delete;
- room filter;
- combined filters if implemented;
- reset filters;
- external link;
- summary amounts by status.

## UI

- light theme;
- dark theme;
- theme persistence after reload;
- colocated CSS Modules корректно применяются;
- global stylesheet не содержит component-specific styles;
- mobile viewport;
- desktop viewport;
- keyboard navigation;
- reduced motion;
- offline/network error;
- direct route refresh;
- PWA installability.

---

# 35. Definition of Done frontend MVP

Frontend MVP технически готов, если:

1. Реализованы маршруты `/login`, `/`, `/purchases`, `/profile`.
2. Auth работает через server-side cookie без token storage.
3. Все requests проходят через единый API client с `credentials: include`.
4. TanStack Query владеет server state.
5. Накопления работают через существующие backend endpoints.
6. Все savings summaries рассчитываются на frontend.
7. Покупки работают через существующие backend endpoints.
8. Все purchase summaries, filters и grouping рассчитываются на frontend.
9. Комнаты, категории и статусы имеют русские labels.
10. Профиль не обещает неподдерживаемое backend редактирование.
11. Поддерживаются светлая и тёмная темы.
12. Выбор темы сохраняется.
13. UI адаптивен и mobile-first.
14. Loading/empty/error/pending states реализованы.
15. PWA manifest и service worker настроены без offline mutations.
16. Production build поддерживает same-origin `/api/v1`.
17. SPA refresh на вложенном route учтён в deployment requirements.
18. Нет лишнего global state manager.
19. Не установлены отложенные библиотеки без потребности.
20. Глобальные design tokens и обе цветовые схемы определяются через Mantine theme и CSS variables.
21. Простая композиция реализована Mantine layout/style props, а собственное компонентное оформление — colocated CSS Modules.
22. Глобальный CSS содержит только действительно глобальные правила.
23. PostCSS настроен через `postcss-preset-mantine` и `postcss-simple-vars`.
24. Tailwind отсутствует в dependencies, configuration и исходном коде.
25. `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` проходят успешно.
26. Manual acceptance checklist пройден и обнаруженные blockers устранены.
