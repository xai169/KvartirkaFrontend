# Архитектура frontend приложения «Квартирка»

## 1. Назначение документа

Документ фиксирует целевую архитектуру frontend-кода приложения «Квартирка».

Архитектура должна:

- оставаться простой для приложения из нескольких экранов;
- ясно разделять инфраструктуру, страницы, предметные области и общий код;
- поддерживать расчёты на frontend без смешивания их с UI;
- не создавать обязательный overhead полноценного Feature-Sliced Design;
- позволять расширить приложение без полной перестройки структуры.

---

## 2. Архитектурный подход

Используется **лёгкая feature-oriented архитектура с минимальным количеством слоёв**.

Это не строгий FSD. В проекте не вводятся обязательные слои:

```text
entities
features
widgets
processes
```

и не требуется классифицировать каждое действие как отдельную feature.

Основная единица предметной декомпозиции — крупная функциональная область:

```text
auth
savings
purchases
profile
```

Внутри одной области рядом хранятся:

- API-функции;
- TanStack Query-конфигурация;
- типы и предметные константы;
- чистые бизнес-расчёты;
- UI-компоненты этой области.

---

## 3. Основные архитектурные принципы

### 3.1. Вертикальная группировка по предметной области

Код накоплений хранится в `features/savings`, код покупок — в `features/purchases`.

Не следует распределять предметный код по глобальным папкам:

```text
components/
hooks/
services/
types/
utils/
```

так как со временем это смешивает несвязанные области.

### 3.2. Тонкие routes

Route-файлы отвечают за:

- URL;
- protected layout;
- search-параметры;
- выбор page-компонента;
- route-level loading/error при необходимости.

Route-файл не должен содержать крупную разметку экрана, CRUD-логику или финансовые расчёты.

### 3.3. Pages как композиция

Page-компонент собирает экран из блоков разных features.

Он отвечает за композицию, но не становится местом всей предметной логики.

### 3.4. Чистые расчёты в model

Финансовые агрегаты, группировки и сортировки должны быть чистыми функциями в `model` соответствующей feature.

UI не должен содержать длинные `reduce`, правила календарных периодов или семантику статусов.

### 3.5. Производные данные не являются самостоятельным state

Источник истины:

```text
SavingsGoal
SavingsEntry[]
Purchase[]
```

Производные значения рассчитываются из источника истины:

```text
savedAmountMinor
remainingAmountMinor
progressPercent
monthly plan
purchase summaries
groups
filtered lists
```

Они не сохраняются в `useState`, Zustand или отдельной TanStack Query query.

### 3.6. Shared только для действительно общего

Компонент или helper остаётся в своей feature, пока не возникло реальное повторное использование вне неё.

В `shared` нельзя переносить код «на будущее» только потому, что он выглядит универсальным.

### 3.7. Прямая реализация предпочтительнее гипотетической абстракции

Не создавать заранее:

- generic CRUD hooks;
- универсальные repository-классы;
- общий конструктор всех форм;
- универсальный engine карточек;
- собственный state framework;
- внутреннюю design system поверх Mantine без реальной необходимости.

---

## 4. Направление зависимостей

Базовое направление:

```text
app / routes
      ↓
    pages
      ↓
  features
      ↓
   shared
```

Правила:

1. `shared` не импортирует `features`, `pages`, `routes` или `app`.
2. `features` могут импортировать `shared`, но не `pages`, `routes` или `app`.
3. Feature-to-feature imports следует избегать.
4. Если экрану нужны две features, их объединяет `page`, а не одна feature импортирует другую.
5. `pages` могут импортировать несколько features и shared-компоненты.
6. `routes` импортируют pages и минимальные route-level зависимости.
7. `app` собирает глобальные providers, router, theme и shell.

Пример правильной композиции:

```text
ProfilePage
├── auth: current user
├── profile: profile summary
└── profile: theme settings
```

Вместо:

```text
profile feature → импортирует внутренности auth feature
```

Если всё же требуется использовать query options текущего пользователя, page импортирует их напрямую из конкретного файла `features/auth/api/authQueries.ts` и передаёт данные дочернему компоненту.

---

## 5. Предлагаемая структура проекта

```text
src/
├── main.tsx
├── routeTree.gen.ts
│
├── app/
│   ├── AppProviders.tsx
│   ├── appRouter.ts
│   ├── AppShell.tsx
│   ├── AppShell.module.css
│   ├── queryClient.ts
│   ├── theme.ts
│   └── navigation.ts
│
├── routes/
│   ├── __root.tsx
│   ├── login.tsx
│   ├── _authenticated.tsx
│   ├── _authenticated.index.tsx
│   ├── _authenticated.purchases.tsx
│   └── _authenticated.profile.tsx
│
├── pages/
│   ├── loginPage/
│   │   ├── LoginPage.tsx
│   │   └── LoginPage.module.css
│   ├── savingsPage/
│   │   └── SavingsPage.tsx
│   ├── purchasesPage/
│   │   └── PurchasesPage.tsx
│   └── profilePage/
│       └── ProfilePage.tsx
│
├── features/
│   ├── auth/
│   │   ├── api/
│   │   │   ├── authApi.ts
│   │   │   └── authQueries.ts
│   │   ├── model/
│   │   │   └── auth.types.ts
│   │   └── ui/
│   │       └── LoginForm.tsx
│   │
│   ├── savings/
│   │   ├── api/
│   │   │   ├── savingsApi.ts
│   │   │   └── savingsQueries.ts
│   │   ├── model/
│   │   │   ├── savings.types.ts
│   │   │   ├── calculateSavingsOverview.ts
│   │   │   ├── calculateMonthlySavingsPlan.ts
│   │   │   └── savings.schemas.ts
│   │   └── ui/
│   │       ├── SavingsHeroCard.tsx
│   │       ├── MonthlySavingsCard.tsx
│   │       ├── SavingsHistory.tsx
│   │       ├── SavingEntryCard.tsx
│   │       ├── SavingEntryDrawer.tsx
│   │       └── SavingsGoalDrawer.tsx
│   │
│   ├── purchases/
│   │   ├── api/
│   │   │   ├── purchasesApi.ts
│   │   │   └── purchasesQueries.ts
│   │   ├── model/
│   │   │   ├── purchase.types.ts
│   │   │   ├── purchase.constants.ts
│   │   │   ├── purchase.schemas.ts
│   │   │   ├── calculatePurchasesSummary.ts
│   │   │   ├── filterPurchases.ts
│   │   │   ├── sortPurchases.ts
│   │   │   └── groupPurchases.ts
│   │   └── ui/
│   │       ├── PurchasesSummary.tsx
│   │       ├── PurchasesFilters.tsx
│   │       ├── PurchaseList.tsx
│   │       ├── PurchaseCard.tsx
│   │       └── PurchaseDrawer.tsx
│   │
│   └── profile/
│       └── ui/
│           ├── ProfileSummary.tsx
│           └── ThemeSelector.tsx
│
└── shared/
    ├── api/
    │   ├── apiClient.ts
    │   ├── apiError.ts
    │   └── api.types.ts
    ├── config/
    │   └── env.ts
    ├── lib/
    │   ├── dates/
    │   │   ├── formatDate.ts
    │   │   └── parseApiDate.ts
    │   └── money/
    │       ├── formatMoney.ts
    │       ├── parseMoneyInput.ts
    │       └── money.types.ts
    ├── ui/
    │   ├── AppErrorState.tsx
    │   ├── ConfirmationDialog.tsx
    │   ├── EmptyState.tsx
    │   ├── PageHeader.tsx
    │   └── PageLoader.tsx
    └── styles/
        └── globals.css
```

Это целевая структура, а не требование создать все файлы заранее. Файл появляется тогда, когда в нём возникает реальный код.

Если компоненту требуется собственное визуальное оформление, CSS Module располагается рядом с ним и повторяет имя component-файла:

```text
savingsSummary/
├── SavingsSummary.tsx
└── SavingsSummary.module.css
```

CSS Module не создаётся только ради `Stack`, `Group`, простого `gap`, `padding` или другого элементарного layout, который ясно выражается Mantine-компонентами и style props.

`routeTree.gen.ts` генерируется TanStack Router и не редактируется вручную.

---

# 6. Ответственность `app`

`app` содержит только глобальную инфраструктуру приложения.

## 6.1. `AppProviders.tsx`

Собирает providers верхнего уровня:

```text
MantineProvider
Notifications
QueryClientProvider
RouterProvider либо окружение для router
PWA update integration при необходимости
```

Provider не должен содержать предметные запросы накоплений или покупок.

## 6.2. `queryClient.ts`

Содержит конфигурацию единственного `QueryClient`:

- общие retry-правила;
- refetch on focus/reconnect;
- обработку глобальных query/mutation errors только там, где это действительно общее поведение.

## 6.3. `theme.ts`

Содержит:

- Mantine theme tokens и палитру;
- общие radius, spacing, shadows и typography решения;
- breakpoints;
- согласованные light/dark значения и semantic CSS variables;
- semantic color names;
- общие component defaults при необходимости.

Конкретные цвета статуса покупок могут находиться в `purchase.constants.ts`, если они имеют предметный смысл.

## 6.4. `AppShell.tsx`

Отвечает за:

- общую рамку защищённых страниц;
- адаптивную навигацию;
- ограничения ширины контента;
- safe-area отступы PWA;
- место под page content.

Он не должен знать, как рассчитываются накопления.

## 6.5. `navigation.ts`

Может содержать декларативное описание трёх пунктов навигации:

```text
route
label
icon
```

---

# 7. Ответственность `routes`

## 7.1. Root route

`__root.tsx` предоставляет корневой layout TanStack Router и общие route-level boundaries.

## 7.2. Login route

`login.tsx`:

- отображает `LoginPage`;
- перенаправляет уже авторизованного пользователя;
- может читать search-параметр `redirect`.

## 7.3. Protected layout

`_authenticated.tsx`:

- проверяет текущего пользователя через `GET /me`;
- при `401` перенаправляет на `/login`;
- при успехе отображает `AppShell` и дочерний route outlet;
- не хранит token и не выполняет refresh flow.

## 7.4. Предметные routes

Route-файлы для `/`, `/purchases`, `/profile` должны быть тонкими и передавать управление соответствующим pages.

## 7.5. Search-параметры

Search-параметры TanStack Router используются для воспроизводимого UI-state, например:

```text
/purchases?room=kitchen&status=planned
```

Search-параметры проверяются на route-границе через простую typed validation. Zod допускается подключить позднее, если схема станет сложной, но он не является обязательной зависимостью MVP.

Локальное открытие drawer необязательно хранить в URL на MVP. Это следует делать только при реальной необходимости deep link или browser history для формы.

---

# 8. Ответственность `pages`

Page — верхнеуровневая композиция конкретного маршрута.

## 8.1. `SavingsPage`

Собирает:

```text
PageHeader
SavingsHeroCard
MonthlySavingsCard
SavingsHistory
Add saving action
Edit goal action
```

Page может получить query results и передать данные дочерним блокам, но не должна реализовывать формулы расчёта внутри JSX.

## 8.2. `PurchasesPage`

Собирает:

```text
PageHeader
PurchasesSummary
PurchasesFilters
PurchaseList
Add purchase action
```

## 8.3. `ProfilePage`

Собирает:

```text
ProfileSummary
ThemeSelector
Logout action
```

## 8.4. `LoginPage`

Отвечает за визуальную композицию login-экрана, а не за детали HTTP-запроса.

---

# 9. Внутренняя структура feature

Каждая крупная feature может содержать три каталога:

```text
api/
model/
ui/
```

Создание всех трёх каталогов не обязательно, если feature их не использует.

## 9.1. `api`

Слой отвечает за:

- HTTP-функции конкретной области;
- request/response transport types при необходимости;
- query options;
- mutation hooks или mutation options;
- query keys.

Пример разделения:

```text
savingsApi.ts
→ чистые async HTTP-функции

savingsQueries.ts
→ TanStack Query queryOptions/mutationOptions
```

`apiClient` не знает о TanStack Query, а HTTP-функции не должны напрямую показывать notifications.

## 9.2. `model`

Здесь находятся:

- предметные TypeScript-типы;
- enum-like unions;
- русские labels для backend enum values;
- feature-level функции или схемы validation;
- расчёты;
- фильтрация;
- сортировка;
- группировка.

`model` не импортирует React-компоненты и Mantine.

Допускается импорт `dayjs` или shared date/money helpers, если это необходимо для чистого расчёта.

## 9.3. `ui`

Здесь находятся только компоненты конкретной предметной области.

Компоненты могут:

- использовать Mantine, Styles API и colocated CSS Modules;
- вызывать feature query/mutation hooks;
- принимать рассчитанные данные;
- управлять локальным состоянием drawer/form.

UI не должен копировать правила backend validation вручную в нескольких местах. Правила формы концентрируются в schema или одном validation helper.

---

# 10. Архитектура API-клиента

## 10.1. Единая точка HTTP

Все HTTP-запросы проходят через `shared/api/apiClient.ts`.

Он отвечает за:

- base URL;
- `credentials: "include"`;
- JSON request body;
- JSON response parsing;
- корректную обработку `204 No Content`;
- преобразование backend error response в `ApiError`;
- network errors;
- стандартные headers.

Он не должен:

- хранить access token;
- обновлять token;
- знать о конкретной `Purchase` или `SavingsEntry`;
- автоматически показывать UI-notification;
- автоматически повторять mutating requests.

## 10.2. Ошибка API

Внутренняя модель ошибки должна сохранять:

```text
HTTP status
backend code
message
fields
requestId
```

Это позволяет:

- показать field errors;
- распознать `UNAUTHENTICATED`;
- дать пользователю понятное сообщение;
- сохранить request ID для диагностики.

## 10.3. Transport и domain types

Для простых DTO не следует создавать два идентичных типа только ради слоёв.

Допустимо использовать один тип внутри feature, если:

- API-форма совпадает с frontend-моделью;
- дополнительное преобразование не нужно.

Отдельные transport/domain types вводятся только когда есть реальная граница, например:

- API date string преобразуется в специальную модель;
- backend DTO содержит поля, которые UI не должен использовать;
- frontend объединяет несколько ответов в одну модель.

---

# 11. Архитектура авторизации

## 11.1. Источник истины

Источником истины является server-side session cookie и ответ `GET /me`.

Frontend не может и не должен читать HttpOnly cookie.

## 11.2. Текущий пользователь

Текущий пользователь хранится в TanStack Query cache под стабильным query key, например:

```text
["auth", "me"]
```

Не дублировать его в Context или Zustand.

## 11.3. Login

После успешного `POST /auth/login`:

- полученный `user` записывается в query cache либо выполняется `GET /me`;
- происходит redirect;
- пароль не сохраняется.

## 11.4. Logout

После `POST /auth/logout`:

- пользовательский query cache очищается;
- происходит переход на login.

## 11.5. Unauthorized

`401` должен обрабатываться централизованно, но без циклических redirect и без показа нескольких одинаковых notifications.

Возможная ответственность:

- API client формирует `ApiError`;
- auth boundary или router распознаёт `401`;
- app-level обработчик очищает состояние и выполняет redirect.

---

# 12. Архитектура server state

TanStack Query владеет всеми данными, полученными с backend:

```text
current user
savings goal
savings entries
purchases
purchase by id при необходимости
```

Рекомендуемые query keys:

```text
["auth", "me"]
["savings", "goal"]
["savings", "entries"]
["purchases", "list"]
["purchases", "detail", id]
```

После мутаций инвалидируются только связанные queries.

Примеры:

```text
create/update/delete savings entry
→ invalidate ["savings", "entries"]

update savings goal
→ invalidate ["savings", "goal"]

create/update/delete purchase
→ invalidate ["purchases", "list"]
```

Summary query keys отсутствуют, потому что backend не предоставляет summary endpoints.

---

# 13. Архитектура производных данных

## 13.1. Накопления

```text
SavingsGoal + SavingsEntry[] + currentDate
                    ↓
       calculateSavingsOverview
                    ↓
SavingsOverview
```

`SavingsOverview` может содержать:

```ts
interface SavingsOverview {
    savedAmountMinor: number;
    remainingAmountMinor: number;
    overTargetAmountMinor: number;
    rawProgressPercent: number;
    displayedProgressPercent: number;
    deadlineStatus: "active" | "completed" | "overdue";
    currentMonth: {
        requiredAmountMinor: number;
        savedAmountMinor: number;
        remainingAmountMinor: number;
        aheadAmountMinor: number;
    };
}
```

Это frontend view model, а не backend DTO.

## 13.2. Покупки

```text
Purchase[]
   ├── calculatePurchasesSummary
   ├── filterPurchases
   ├── sortPurchases
   └── groupPurchases
```

Функции не должны мутировать исходный массив.

## 13.3. React integration

Дешёвые расчёты можно выполнять непосредственно при render после успешного query.

`useMemo` используется только при измеримой или очевидной необходимости, а не для каждого `reduce` автоматически.

---

# 14. Ownership состояния

| Вид состояния | Владелец |
|---|---|
| Данные backend | TanStack Query |
| Текущий маршрут | TanStack Router |
| Фильтры, которые должны переживать refresh | Router search params |
| Открыт ли Drawer | Локальный React state |
| Ввод простой формы | Локальный React state |
| Светлая/тёмная тема | Mantine color scheme + localStorage |
| Производные суммы | Чистые функции, не state |
| Большая сложная форма в будущем | TanStack Form |
| Сложная таблица в будущем | TanStack Table |
| Глобальный client state в будущем | Zustand только после доказанной необходимости |

---

# 15. Архитектура форм

## 15.1. MVP

Простые формы используют:

- локальное React-state;
- controlled inputs либо небольшой локальный reducer;
- одна feature-level функция validation перед submit;
- backend field errors после ответа.

Zod подключается только при реальном усложнении и повторении правил validation; для небольших форм он не обязателен.

Форма не должна синхронизировать каждое поле с глобальным store.

## 15.2. Когда добавлять TanStack Form

TanStack Form подключается только при появлении реальной сложности:

- много взаимозависимых полей;
- динамические массивы;
- nested values;
- сложный dirty/reset lifecycle;
- переиспользуемые field-компоненты;
- несколько режимов validation;
- form-level async validation.

Он не является обязательной зависимостью начального MVP.

---

# 16. Архитектура списков и таблиц

Списки накоплений и покупок реализуются обычными React-компонентами.

TanStack Table добавляется только если появляются:

- полноценная табличная desktop-подача;
- column sorting;
- resizing;
- column visibility;
- row selection;
- pagination;
- большой объём строк.

Карточный mobile-first список не должен строиться поверх Table без необходимости.

---

# 17. Архитектура UI и стилей

## 17.1. Разделение ответственности

Mantine theme является источником глобальной дизайн-системы:

- цветовой палитры и semantic colors;
- типографики;
- радиусов и теней;
- breakpoints;
- глобальных параметров компонентов;
- согласованного оформления light/dark.

Mantine-компоненты и style props используются для готового UI и простого layout:

- inputs;
- buttons;
- drawers/modals;
- menus;
- tabs/segmented controls;
- badges;
- progress;
- notifications;
- skeletons;
- `Stack`, `Group`, `Flex`, `Grid`;
- spacing, размеры, alignment и простые responsive-настройки.

CSS Modules используются для собственного компонентного оформления:

- сложных фонов и градиентов;
- нестандартной сетки;
- декоративных элементов;
- сложного позиционирования и component-level responsive rules;
- hover, active, focus и других состояний;
- оформления внутренних частей Mantine-компонентов через `classNames` и Styles API;
- отдельных light/dark правил, опирающихся на theme tokens и CSS variables.

Глобальный CSS остаётся минимальным и содержит только действительно глобальные правила для `html`, `body`, `#root`, базового фона, минимальной высоты, сглаживания шрифтов и редких reset-правил. Компонентные стили в него не переносятся.

Motion используется для:

- анимации изменения крупных значений;
- появления/удаления карточек;
- layout transitions;
- небольшого tap feedback;
- сложных переходов, не покрываемых обычным CSS.

Простые изменения `color`, `opacity`, `border` и hover-состояний реализуются CSS transitions без Motion.

## 17.2. Theme tokens

Цвета, spacing, radius, тени, typography и breakpoints должны опираться на Mantine theme tokens и связанные CSS variables.

CSS Modules не должны содержать хаотично продублированные hex-цвета и повторяющиеся magic values. Feature-specific status mapping допустим, если он выражает предметную семантику и ссылается на общие tokens.

Обе темы строятся из одной системы tokens. Компонент не должен иметь независимые, не связанные с theme, наборы light/dark цветов.

## 17.3. Размещение CSS Modules

CSS Module принадлежит тому же архитектурному уровню, что и компонент:

- стили `AppShell` находятся рядом с `AppShell.tsx`;
- стили page-композиции — рядом с соответствующей page;
- стили feature-компонента — внутри `features/<feature>/ui` рядом с компонентом;
- стили действительно общего UI — рядом с компонентом в `shared/ui`.

Нельзя создавать глобальный каталог компонентных styles, который разрывает ownership. Общий `shared/styles/globals.css` не является местом для стилей конкретных карточек, форм или страниц.

## 17.4. Общий UI

`shared/ui` содержит компоненты без предметной семантики:

```text
EmptyState
ConfirmationDialog
PageHeader
PageLoader
AppErrorState
```

`SavingsHeroCard` и `PurchaseCard` не являются shared-компонентами.

---

# 18. Архитектура ошибок

Ошибки делятся на уровни:

## 18.1. Route/page-level

Первоначальная ошибка загрузки основного ресурса показывает error state с retry.

## 18.2. Form-level

Validation errors показываются рядом с полями.

Backend `fields` преобразуются в ошибки соответствующих input.

## 18.3. Mutation-level

При неуспешном submit:

- форма остаётся открыта;
- values сохраняются;
- submit pending снимается;
- показывается field или общий error.

## 18.4. Authentication-level

`401` инициирует переход в unauthenticated state.

## 18.5. Unexpected error

Пользователь получает нейтральное сообщение и возможность повторить действие. `requestId` может быть доступен в технических деталях, но не должен доминировать в интерфейсе.

---

# 19. Архитектура дат и денег

## 19.1. Деньги

В API и model используются только integer minor units.

UI-преобразования находятся в `shared/lib/money`:

```text
parse user input → minor integer
minor integer → ru-RU formatted string
```

Предметные расчёты не работают с отформатированными строками.

## 19.2. Даты без времени

API date `YYYY-MM-DD` является календарной датой, а не UTC timestamp.

Нельзя бездумно превращать её через:

```ts
new Date("2027-06-30")
```

если дальнейшее отображение зависит от локальной timezone.

Используется явный parser календарной даты или dayjs с контролируемым форматом.

## 19.3. Timestamp

`createdAt` и `updatedAt` являются ISO UTC timestamps и могут преобразовываться в локальное время пользователя.

---

# 20. Расширение архитектуры

## 20.1. Аналитика

Когда появится экран аналитики:

- route и page добавляются отдельно;
- данные по-прежнему берутся из существующих queries;
- chart view models рассчитываются в соответствующих model-функциях;
- `@mantine/charts` подключается только на этом этапе.

## 20.2. Редактирование профиля

Когда backend добавит `PATCH /me` или avatar endpoints:

- API появляется в `features/profile/api`;
- текущий `/me` query остаётся единым источником истины;
- frontend не должен проектировать fake profile mutations раньше backend-контракта.

## 20.3. Несколько целей

Если вместо одной цели появится список:

- `savings` остаётся предметной областью;
- query keys расширяются идентификатором;
- route может получить goal id;
- текущая архитектура не требует миграции в FSD.

## 20.4. Рост проекта

Переход к более строгой модульной архитектуре рассматривается только при реальных симптомах:

- десятки предметных областей;
- регулярные циклические зависимости;
- несколько команд;
- необходимость формальных public APIs модулей;
- сложная повторная композиция сущностей и действий.

---

# 21. Запрещённые архитектурные анти-паттерны

Не следует:

1. Создавать глобальный `utils.ts` или `helpers.ts` для несвязанного кода.
2. Создавать глобальный `types.ts` со всеми типами проекта.
3. Складывать все компоненты в `src/components`.
4. Хранить API-данные одновременно в TanStack Query и Zustand.
5. Копировать backend summary в frontend state.
6. Выполнять HTTP-запросы напрямую из случайных presentational components.
7. Хранить session token в localStorage.
8. Создавать отдельный hook на каждую однострочную функцию без причины.
9. Создавать barrel `index.ts`.
10. Импортировать pages из features.
11. Помещать предметные labels комнат в `shared` только потому, что это константы.
12. Добавлять Form/Table/Charts/state manager «на всякий случай».
13. Превращать route-файлы в полноценные страницы на сотни строк.
14. Создавать универсальный компонент, который управляет всеми drawers/forms приложения.
15. Переносить компонентные стили в глобальный CSS.
16. Создавать CSS-класс только ради простого layout, ясно выражаемого Mantine props.
17. Дублировать одинаковые цвета, spacing и breakpoints в несвязанных CSS Modules вместо theme tokens.

---

# 22. Правила именования и размещения

- Файлы React-компонентов — `PascalCase`, например `AppShell.tsx`.
- CSS Module компонента повторяет его имя: `AppShell.module.css`.
- Остальные source-файлы и многословные каталоги — `camelCase`, например `queryClient.ts` и `loginPage/`.
- `kebab-case` в именах source-файлов и каталогов не используется.
- React-компоненты внутри файла — `PascalCase`.
- Functions/variables — `camelCase`.
- Типы/interfaces — `PascalCase`.
- Named exports — по умолчанию.
- Default export используется только если его требует конкретный инструмент.
- Один главный компонент или одна главная ответственность на файл.
- Файл размещается рядом с областью, которой принадлежит его смысл.
- Имена, которые диктует инструмент, generator или file-based routing, могут отступать от этого правила; например `vite-env.d.ts`, `routeTree.gen.ts` и route-файлы TanStack Router.
- Не создавать `index.ts` для реэкспорта.

---

# 23. Архитектурные критерии готовности

Архитектура считается соблюдённой, если:

- route-файлы остаются тонкими;
- страницы собирают features, а не реализуют их бизнес-логику;
- API проходит через единый client;
- cookies отправляются централизованно;
- server state находится в TanStack Query;
- производные финансовые данные вычисляются чистыми функциями;
- нет отдельного глобального state manager без необходимости;
- нет FSD-церемонии, не дающей практической пользы;
- комнаты и категории принадлежат `purchases/model`;
- money/date helpers отделены от JSX;
- theme владеет глобальными design tokens и light/dark схемами;
- простая композиция выражается Mantine layout-компонентами, а собственное оформление — colocated CSS Modules;
- глобальный CSS не содержит стилей отдельных компонентов;
- общий код действительно не имеет предметного смысла;
- нет barrel-файлов;
- новое поведение можно отнести к понятному владельцу.
