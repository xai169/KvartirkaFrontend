# Рабочий план разработки frontend приложения «Квартирка»

## 1. Зачем нужен этот документ

Это основной навигационный план для разработки: открыть документ, найти текущий этап, выполнить действия сверху вниз и проверить результат.

Локальная задача L7 от 16 октября 2026 года завершена по [плану локального MVP](06-LOCAL_MVP_L7_PLAN.md): вход, накопления, покупки и профиль реализованы и проверены. Фактические результаты находятся в [отчёте приёмки](07-LOCAL_MVP_VERIFICATION.md). Этот checklist остаётся полным маршрутом развития; его PWA-критерии не считаются закрытыми локальным запуском.

Продолжение для этапов 12–13 описано в [плане PWA](08-PWA_MVP_PLAN.md). 24 октября PWA реализовано в L7; по уточнению пользователя автоматизация и отдельный стенд исключены, ручную приёмку iPhone 17 / iOS 26.6.2 пользователь выполняет самостоятельно. Статические результаты и пошаговый checklist находятся в [отчёте PWA](09-PWA_MVP_VERIFICATION.md). Полная runtime-приёмка ещё не подтверждена.

Документ намеренно не повторяет:

- бизнес-правила из `01-FRONTEND_BUSINESS_SPEC.md`;
- архитектурные объяснения из `02-FRONTEND_ARCHITECTURE.md`;
- технические детали из `03-FRONTEND_TECHNICAL_SPEC.md`;
- расширенные сценарии из `04-FRONTEND_IMPLEMENTATION_PLAN.md`.

Если на этапе нужна формула, API-контракт или подробное техническое правило, нужно открыть соответствующий документ. Этот файл отвечает только на вопрос: **в каком порядке действовать и какой работающий результат получать после каждого шага**.

---

# 2. Как работать по плану

1. Выполнять только один этап одновременно.
2. Перед этапом проверять его предварительные условия.
3. Делать действия в указанном порядке.
4. Не добавлять функциональность следующих этапов «заодно».
5. После этапа запускать проверки и открывать приложение вручную.
6. Переходить дальше только после получения описанного результата.

Минимальные проверки после появления соответствующих scripts:

```text
pnpm lint
pnpm typecheck
pnpm format:check
pnpm build
```

---

# 3. Общий маршрут

| Этап | Что должно появиться |
|---|---|
| 0 | подтверждённый backend-контракт и понятная схема запуска |
| 1 | чистое React/Vite/TypeScript приложение |
| 2 | зависимости и все базовые конфиги |
| 3 | структура проекта, providers, Mantine theme и две темы |
| 4 | Router и пустые страницы |
| 5 | AppShell, mobile menu и desktop header |
| 6 | API client и TanStack Query |
| 7 | LoginPage, session auth и protected routes |
| 8 | общие правила денег, дат, ошибок и форм |
| 9 | полностью работающий раздел накоплений |
| 10 | полностью работающий раздел покупок |
| 11 | Profile, logout и общий UI-аудит |
| 12 | устанавливаемое PWA |
| 13 | проверенный frontend MVP |

Упрощённо:

```text
инициализация
→ конфиги
→ theme/providers
→ Router/pages
→ AppShell/navigation
→ API/Query
→ auth
→ Savings
→ Purchases
→ Profile/polish
→ PWA
→ приёмка
```

---

# 4. Какие конфиги и когда настраиваются

Не нужно пытаться закончить все конфиги в первый день. Они дополняются по мере появления соответствующей инфраструктуры.

| Конфиг | Этап | Что настроить |
|---|---|---|
| `package.json` | 1–2 | scripts, package manager, утверждённые dependencies |
| `tsconfig*.json` | 1 | strict TypeScript, browser/tooling types, alias `@/*` |
| `vite.config.*` | 1 | React plugin, alias, базовый build |
| `vite.config.*` | 4 | TanStack Router plugin и generation |
| `vite.config.*` | 6 | development proxy `/api` на backend |
| `vite.config.*` | 12 | `vite-plugin-pwa` |
| `eslint.config.*` | 2 | TypeScript, React Hooks, unused code, browser globals |
| Prettier config | 2 | единое форматирование |
| `postcss.config.*` | 2–3 | `postcss-preset-mantine`, `postcss-simple-vars`, breakpoints |
| `.gitignore` | 1 | dependencies, build output, cache и local env |
| `src/app/theme.ts` | 3 | Mantine tokens, breakpoints и component defaults |
| global stylesheet | 3 | только `html`, `body`, `#root` и общий baseline |
| `src/app/queryClient.ts` | 6 | общие TanStack Query policies |
| PWA manifest/service worker | 12 | installability, caching и update behavior |

---

# 5. Целевая структура приложения

```text
src/
├── app/       providers, theme, QueryClient, Router setup, AppShell
├── routes/    URL, route guards, search params
├── pages/     композиция экранов
├── features/  auth, savings, purchases, profile
└── shared/    API client, money/date helpers, общий UI
```

Внутри feature по необходимости:

```text
api/    HTTP functions и query configuration
model/  types, validation, calculations и constants
ui/     компоненты конкретной предметной области
```

Не создавать пустые каталоги заранее. Файл появляется тогда, когда он нужен текущему этапу.

---

# 6. Этап 0. Подготовка

## Цель

Убрать неопределённость до создания frontend-кода.

## Сделать

1. Проверить текущее содержимое repository и Git status.
2. Определить директорию будущего frontend.
3. Подтвердить Node.js 24 LTS и используемую версию pnpm.
4. Найти актуальный backend contract.
5. Сверить endpoints login, logout, `/me`, Savings и Purchases.
6. Подтвердить HttpOnly session cookie, DTO, errors, money и date formats.
7. Зафиксировать локальную схему: Vite frontend → `/api/v1` → Vite proxy → backend.
8. Ещё раз подтвердить границы MVP.

## На выходе

Понятно, где создаётся frontend, как он запускается и с каким API работает.

## Проверить

- backend contract доступен;
- неизвестные DTO не приходится придумывать;
- в repository нет существующего frontend, который будет случайно перезаписан;
- выбран один package manager и один lockfile.

## Текущий риск

16 октября 2026 года backend-контракт найден в соседнем repository: [KvartirkaBackend/docs/BACKEND_SPEC.md](../../KvartirkaBackend/docs/BACKEND_SPEC.md). Прочитаны контроллеры основных endpoints и соответствующие части DTO. Runtime подтверждён в локальной приёмке: backend и PostgreSQL доступны, cookie-авторизация и CRUD проверены на настоящем API с отдельной QA-БД. Отсутствие копии спецификации во frontend repository больше не является блокером.

---

# 7. Этап 1. Инициализация приложения

## Цель

Получить чистое приложение, которое запускается и собирается.

## Сделать

1. Создать Vite-проект с React и TypeScript.
2. Использовать pnpm и создать один `pnpm-lock.yaml`.
3. Удалить Vite logo, demo counter, demo assets и демонстрационные стили.
4. Оставить минимальные `main.tsx` и application root.
5. Включить strict TypeScript.
6. Настроить alias `@/*` на `src/*` в TypeScript и Vite.
7. Добавить scripts `dev`, `build`, `preview`, `typecheck`.
8. Настроить `.gitignore`.
9. Не создавать `.env`, пока не появится реальная публичная настройка.

## На выходе

Пустое React-приложение работает без бизнес-функциональности и demo-кода.

## Проверить

- `pnpm dev`;
- HMR;
- `pnpm typecheck`;
- `pnpm build`;
- `pnpm preview`;
- browser console без ошибок.

---

# 8. Этап 2. Зависимости и базовые конфиги

## Цель

Подготовить tooling до появления большого количества исходных файлов.

## Установить

- Mantine Core, Hooks, Notifications и Dates;
- `@tabler/icons-react`;
- TanStack Router и Router Vite plugin;
- TanStack Query;
- Motion;
- dayjs;
- `postcss-preset-mantine`;
- `postcss-simple-vars`;
- ESLint/TypeScript/React Hooks tooling;
- Prettier.

CSS Modules поддерживаются Vite и не требуют отдельной runtime-библиотеки.

Не устанавливать сейчас:

- Zustand/Redux;
- Axios;
- Zod;
- TanStack Form/Table;
- React Hook Form;
- charts;
- Storybook;
- test runner;
- Tailwind CSS;
- `vite-plugin-pwa`.

## Настроить

1. Добавить scripts `lint`, `format`, `format:check`.
2. Настроить ESLint для TypeScript, React Hooks и неиспользуемого кода.
3. Настроить Prettier и исключить generated/build files.
4. Создать `postcss.config.*`.
5. Подключить `postcss-preset-mantine` и `postcss-simple-vars`.
6. Проверить обычный CSS и `*.module.css`.
7. Проверить dependency tree и удалить случайные template packages.

## На выходе

Новый код автоматически проходит TypeScript, lint, formatting и PostCSS processing.

## Проверить

- lint;
- typecheck;
- format check;
- build;
- CSS Module получает локальное имя класса;
- Tailwind и отложенные библиотеки отсутствуют.

---

# 9. Этап 3. Структура, providers и визуальный фундамент

## Цель

Создать основу приложения до Router и реальных страниц.

## Сделать структуру

1. Создать `app`, `routes`, `pages`, `features`, `shared` по мере появления первых файлов.
2. Зафиксировать направление зависимостей из архитектурного документа.
3. Использовать named exports, `PascalCase` для component-файлов и `camelCase` для остальных source-файлов и многословных каталогов.
4. Не создавать barrel `index.ts`.
5. CSS Module компонента хранить рядом с ним.

## Настроить стили

1. Подключить обязательные Mantine package styles.
2. Создать минимальный global stylesheet.
3. Создать `theme.ts`.
4. Определить palette, typography, radius, shadows, spacing и breakpoints.
5. Синхронизировать PostCSS breakpoint variables с Mantine theme.
6. Настроить только light и dark.
7. Сохранять выбор темы локально.
8. Предотвратить flash неправильной темы.

## Собрать providers

1. Создать `AppProviders`.
2. Подключить MantineProvider.
3. Подключить Notifications.
4. Оставить понятные места для QueryClientProvider и RouterProvider.
5. Не помещать feature queries и бизнес-логику в providers.

## На выходе

Приложение имеет структуру, Mantine theme, две темы, notifications и понятный styling workflow.

## Проверить

- light/dark и reload;
- отсутствие flash неправильной темы;
- Mantine Button/Input/Notification;
- простой layout через Mantine;
- собственное оформление через CSS Module;
- global CSS не содержит component styles.

---

# 10. Этап 4. Router и каркас страниц

## Цель

Создать все URL и пустые экраны до подключения backend.

## Настроить Router

1. Добавить TanStack Router plugin в Vite config.
2. Настроить file-based routing и generation.
3. Исключить generated route tree из formatting/lint там, где требуется.
4. Не редактировать generated tree вручную.

## Создать маршруты

- `/login`;
- `/`;
- `/purchases`;
- `/profile`;
- authenticated layout;
- not-found state;
- root error state.

## Создать страницы

- `LoginPage`;
- `SavingsPage`;
- `PurchasesPage`;
- `ProfilePage`.

Пока каждая страница содержит только понятный заголовок и нейтральную заглушку. API, forms и расчёты ещё не добавляются.

## На выходе

Каждый будущий экран имеет стабильный URL и отдельный page component.

## Проверить

- прямое открытие каждого route;
- переходы между routes;
- back/forward;
- reload route в production preview;
- not-found и root error;
- generated tree обновляется автоматически.

---

# 11. Этап 5. AppShell и навигация

## Цель

Создать постоянную рамку защищённой части приложения.

## Сделать

1. Создать authenticated AppShell с route outlet.
2. Добавить content container и ограничение максимальной ширины.
3. Реализовать mobile bottom navigation.
4. Реализовать desktop header navigation.
5. Добавить пункты «Накопления», «Покупки», «Профиль».
6. Для каждого пункта добавить label, Tabler icon, active и focus state.
7. Учесть fixed navigation, content bottom padding и safe-area.
8. Не показывать AppShell на `/login`.
9. Создать PageHeader/PageContainer только после фактического повторения.

Для трёх пунктов текущего MVP достаточно desktop header. Sidebar не создаётся без отдельного UX-решения.

## На выходе

Есть готовая оболочка приложения: mobile menu, desktop header и место для содержимого страниц.

## Проверить

- mobile 320/375 px;
- tablet и desktop;
- active route;
- keyboard focus;
- длинная страница не перекрывается bottom navigation;
- safe-area;
- отсутствие horizontal overflow;
- обе темы.

---

# 12. Этап 6. API client и TanStack Query

## Цель

Создать единую инфраструктуру для общения с backend.

## Сделать

1. Добавить Vite proxy `/api` на локальный backend.
2. Создать `ApiError` со status, code, message, fields и requestId.
3. Создать общий Fetch client.
4. Использовать относительный base path `/api/v1`.
5. Всегда отправлять `credentials: include`.
6. Обработать JSON, `204 No Content`, HTTP errors и network errors.
7. Создать один QueryClient.
8. Определить query retry/refetch defaults.
9. Не повторять mutations автоматически.
10. Подключить QueryClientProvider.
11. Зафиксировать pattern feature API functions, query keys и invalidation.

Общий client не хранит token, не знает feature endpoints и не показывает notifications.

## На выходе

Любая feature может добавить API functions и TanStack Query configuration без собственного transport layer.

## Проверить

- request проходит через proxy;
- cookie credentials отправляются;
- success JSON разбирается;
- `204` не вызывает parse error;
- backend error превращается в `ApiError`;
- network error обрабатывается отдельно;
- production code не содержит localhost.

---

# 13. Этап 7. Login и session auth

## Цель

Реализовать вход и защиту приложения через server-side session.

## Сделать auth layer

1. Создать auth types.
2. Создать API functions для login, logout и `/me`.
3. Создать current-user query и login mutation.
4. Использовать стабильный query key для текущего пользователя.
5. Не дублировать user в Context или Zustand.

## Реализовать LoginPage

1. Создать public layout без AppShell.
2. Добавить login и password.
3. Добавить labels, autocomplete, validation и pending state.
4. Блокировать повторный submit.
5. Показывать единое сообщение при неверных credentials.
6. После success обновлять current-user cache и выполнять redirect.

## Защитить routes

1. Authenticated layout проверяет `/me`.
2. Без session пользователь попадает на `/login`.
3. Активная session не позволяет оставаться на `/login`.
4. Безопасно сохранять исходный route для возврата после входа.
5. `401` очищает auth/private cache и выполняет один redirect.
6. Не создавать redirect loop и повторяющиеся notifications.

Logout UI появится в Profile, но logout API и правила очистки cache определяются здесь.

## На выходе

В приложение нельзя попасть без session, а frontend нигде не хранит access/refresh token.

## Проверить

- valid login;
- invalid credentials;
- duplicate submit;
- protected route без session;
- reload с session;
- активный пользователь на `/login`;
- session expiration;
- network error;
- безопасный redirect.

---

# 14. Этап 8. Общие правила денег, дат, ошибок и форм

## Цель

Подготовить primitives, которые будут одинаково использовать Savings и Purchases.

## Сделать

1. Создать formatter minor units → `ru-RU` money.
2. Создать parser пользовательской суммы → integer minor units.
3. Проверить safe integer и invalid input.
4. Создать parser/formatter для API date `YYYY-MM-DD`.
5. Отдельно обрабатывать UTC timestamps.
6. Не допускать timezone shift календарной даты.
7. Определить mapping `ApiError.fields` в form errors.
8. Зафиксировать lifecycle простой формы: values, validation, pending, error, success/reset.

## На выходе

Финансовые features не копируют parsing, formatting и error handling по разным компонентам.

## Проверить

- 0, копейки, дробный ввод и большие суммы;
- invalid/negative input;
- today, граница месяца и leap date;
- date round trip без timezone shift;
- field и general errors;
- values сохраняются после failed submit.

---

# 15. Этап 9. Раздел «Накопления»

## Цель

Закончить первую feature целиком: model → API → calculations → UI → CRUD.

## Шаг 1. Model и API

1. Сверить SavingsGoal и SavingsEntry с backend.
2. Создать feature types.
3. Создать API functions goal и entries.
4. Создать query keys, queries и mutations.
5. Настроить точную invalidation после mutations.
6. Создать validation для goal и entry forms.

## Шаг 2. Расчёты

1. Реализовать чистый Savings overview по бизнес-спецификации.
2. Реализовать monthly plan.
3. Передавать `currentDate` параметром.
4. Не хранить calculated values в state или Query cache.
5. Проверить empty, completed, overdue, over-target и rounding cases.

## Шаг 3. Read-only экран

1. Подключить goal и entries queries в SavingsPage.
2. Реализовать Savings hero.
3. Реализовать monthly plan card.
4. Реализовать history от новых к старым.
5. Добавить loading, error, retry и empty states.

## Шаг 4. CRUD

1. Добавить edit goal form.
2. Добавить create entry form.
3. Переиспользовать form для edit entry.
4. Добавить delete confirmation.
5. После каждой операции обновлять queries и пересчитывать overview.
6. Добавить pending, validation, server errors и notifications.

## Шаг 5. UI

1. Использовать Mantine для простого layout.
2. Разместить собственные styles рядом с Savings components.
3. Проверить большие суммы, длинные comments, mobile/desktop и обе темы.
4. Добавить только полезные Motion transitions.
5. Учесть reduced motion и focus return.

## На выходе

Пользователь видит цель и месячный план, а также может создать, изменить и удалить пополнение на реальном backend.

## Проверить

- empty history;
- create/edit/delete entry;
- edit goal;
- exact target;
- over target;
- overdue;
- historical entry и monthly recalculation;
- failed/duplicate submit;
- reload;
- mobile/desktop;
- light/dark;
- keyboard/focus.

---

# 16. Этап 10. Раздел «Покупки»

## Цель

Закончить вторую основную feature: model → API → filters → UI → CRUD.

## Шаг 1. Model и API

1. Сверить Purchase DTO и inputs с backend.
2. Создать types комнат, категорий и статусов.
3. Создать русские labels и status order.
4. Создать Purchases API functions.
5. Создать query keys, queries и mutations.
6. Создать form mapping и validation.

## Шаг 2. Calculations и filters

1. Рассчитать total/planned/ordered/purchased/active amounts.
2. Рассчитать unknown price count.
3. Реализовать room filter.
4. При необходимости добавить status/category filters.
5. Реализовать default sorting.
6. Хранить воспроизводимые filters в Router search params.

## Шаг 3. Read-only экран

1. Подключить list query в PurchasesPage.
2. Реализовать financial summary.
3. Реализовать filters.
4. Реализовать PurchaseList и PurchaseCard.
5. Различать full empty и filtered empty states.

## Шаг 4. CRUD

1. Добавить create/edit purchase form.
2. Добавить status update из card только если UX остаётся понятным.
3. Добавить delete confirmation.
4. Добавить безопасную external link.
5. После mutations обновлять list и summary.
6. Обработать pending, validation, server и network errors.

## Шаг 5. UI

1. Сделать mobile single-column list.
2. На desktop при необходимости перейти к grid.
3. Не использовать TanStack Table.
4. Разместить styles рядом с Purchases components.
5. Проверить длинные названия, store, URL и comments.
6. Добавить умеренные animations и reduced motion.

## На выходе

Пользователь видит финансовую сводку, фильтрует покупки и выполняет полный CRUD на реальном backend.

## Проверить

- empty list;
- create minimal/full purchase;
- price 0;
- invalid URL;
- edit/status/delete;
- room и combined filters;
- URL persistence и reset;
- filtered empty;
- external link;
- failed/duplicate mutation;
- mobile/desktop;
- light/dark;
- refetch после изменения вторым пользователем.

---

# 17. Этап 11. Profile и общий UI-аудит

## Цель

Завершить третий экран и привести всё приложение к единому качеству.

## Profile

1. Использовать существующий `/me` query.
2. Показать username и login.
3. Не добавлять profile editing, password change и avatar upload.
4. Добавить ThemeSelector с light/dark.
5. Добавить logout.
6. После logout очистить private Query cache и перейти на `/login`.

## Общий аудит

1. Унифицировать loading, empty, error и pending states.
2. Вынести в shared только реально повторившиеся PageHeader, EmptyState, ErrorState и ConfirmationDialog.
3. Проверить notifications и duplicate operations.
4. Проверить mobile, tablet, desktop, safe-area и длинные данные.
5. Проверить keyboard, focus, labels, contrast и touch targets.
6. Проверить light/dark всех screens и component states.
7. Проверить CSS Modules, theme tokens и минимальный global CSS.
8. Проверить animations и `prefers-reduced-motion`.
9. Проверить единые русские labels и отсутствие raw backend messages.

## На выходе

Все маршруты выглядят и ведут себя как одно приложение, а Profile завершает session и theme scenarios.

## Проверить

- Profile data;
- theme persistence;
- logout success/error/expired session;
- login вторым пользователем без старого cache;
- каждый route без мыши;
- каждый route в обеих темах;
- mobile/desktop;
- slow network и API errors;
- отсутствие horizontal overflow.

---

# 18. Этап 12. PWA

## Цель

Сделать приложение устанавливаемым, не добавляя offline mutations.

## Сделать

1. Установить и подключить `vite-plugin-pwa`.
2. Настроить manifest: name, short name, lang, start URL, scope, standalone, colors.
3. Подготовить icons 192×192, 512×512 и maskable.
4. Кешировать app shell, versioned assets, icons и fonts.
5. Не использовать API cache как постоянный offline source of truth.
6. Не кешировать mutations и не показывать ложный offline success.
7. Добавить понятный offline/error UX.
8. Определить update strategy.
9. Проверить standalone mode, direct routes, session, theme и safe-area.

## На выходе

Приложение устанавливается как online-first PWA и корректно сообщает об отсутствии сети.

## Проверить

- production build;
- manifest;
- service worker;
- installability;
- icons;
- offline app shell;
- offline mutation failure;
- update flow;
- direct `/purchases` и `/profile`;
- standalone mobile layout.

---

# 19. Этап 13. Финальная приёмка

## Цель

Проверить полный MVP на чистом окружении и реальном backend.

## Сделать

1. Выполнить чистую установку dependencies из lockfile.
2. Поднять database/backend, применить migrations и seed.
3. Пройти login/logout/session expiration двумя пользователями.
4. Пройти весь Savings CRUD и calculation matrix.
5. Пройти весь Purchases CRUD, summaries и filters.
6. Проверить Profile и themes.
7. Проверить mobile/desktop, keyboard, slow network, offline и direct routes.
8. Проверить PWA preview.
9. Запустить lint, typecheck, format check и production build.
10. Удалить debug logs, mock data и blocking TODO.
11. Проверить отсутствие secrets и случайных dependencies.
12. Зафиксировать неблокирующие ограничения в backlog.

## На выходе

Frontend MVP готов к отдельной задаче публикации.

## Финальный критерий

- оба пользователя могут войти;
- protected routes защищены;
- Savings и Purchases работают end-to-end;
- Profile, themes и logout работают;
- UI адаптивен и доступен;
- PWA устанавливается;
- quality-команды проходят;
- критических runtime/console ошибок нет;
- frontend использует relative `/api/v1` и готов к same-origin deployment.

Production deployment, VPS, Nginx, TLS, database backups и observability выполняются отдельным планом после завершения frontend MVP.
