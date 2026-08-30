# MythBase

Каталог существ, героев и духов вымышленного мира. Сущности распределены по
иерархии локаций, доступны поиск и фильтрация, просмотр карточек и добавление
новых записей.

![Каталог существ](docs/screenshots/catalog.png)

## Возможности

- поиск существ по имени;
- фильтрация по типу и одной или нескольким локациям;
- локации произвольной вложенности;
- режим «только уникальные» для существ, встречающихся только внутри выбранной
  ветви локаций;
- карточка с описанием, альтернативными именами и местами обитания;
- создание существ и локаций;
- начальный набор данных для первого запуска.

## Стек

| Слой | Технологии |
| --- | --- |
| Backend | Node.js, Express 5, TypeORM, PostgreSQL 17, Zod |
| Frontend | Next.js 16, React 19, TypeScript |
| Тесты | Vitest, Supertest, Testing Library |
| Запуск | Docker, Docker Compose |

## Структура

```text
back/                 REST API
  src/config/         конфигурация
  src/db/             подключение, миграции и начальные данные
  src/domain/         работа с деревом локаций
  src/entities/       сущности TypeORM
  src/routes/         маршруты API
  src/validation/     схемы Zod
front/                клиент на Next.js
docker-compose.yml    PostgreSQL, API и клиент
```

## Запуск через Docker Compose

```powershell
Copy-Item .env.example .env
docker compose up -d --build
docker compose run --build --rm seed
```

- клиент: <http://localhost:3000>
- API: <http://localhost:4000>
- проверка API: <http://localhost:4000/health>

Команда `seed` заполняет пустую базу. Если в ней уже есть данные, выполнение
будет остановлено. Для намеренной полной замены данных задайте
`SEED_FORCE=true`.

### Подключение существующей PostgreSQL

Для API в Docker укажите в `.env` строку подключения с адресом хоста:

```dotenv
API_DATABASE_URL=postgres://user:password@host.docker.internal:5432/myth_base
RUN_MIGRATIONS=false
```

Запуск без контейнера `db`:

```powershell
docker compose up -d --build --no-deps api web
```

## Локальный запуск

Понадобятся Node.js 20+ и PostgreSQL.

### Backend

```powershell
Set-Location back
Copy-Item .env.example .env
npm ci
npm run migration:run
npm run seed
npm run dev
```

### Frontend

```powershell
Set-Location front
Copy-Item .env.example .env.local
npm ci
npm run dev
```

## Конфигурация

### Backend

| Переменная | Назначение |
| --- | --- |
| `DATABASE_URL` | строка подключения к PostgreSQL |
| `PORT` | порт API |
| `DB_SSL` | TLS для подключения к базе |
| `RUN_MIGRATIONS` | применение миграций при старте |
| `CORS_ORIGINS` | разрешённые источники запросов |
| `JSON_BODY_LIMIT` | максимальный размер JSON-запроса |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` | ограничение частоты запросов |
| `API_DATABASE_URL` | внешняя PostgreSQL для API в Docker |

### Frontend

`NEXT_PUBLIC_API_URL` задаёт адрес API, доступный из браузера.

Корневой `.env` используется Docker Compose и содержит параметры PostgreSQL и
публикуемые порты. Примеры находятся в `.env.example`, `back/.env.example` и
`front/.env.example`.

## Миграции и начальные данные

```powershell
Set-Location back
npm run migration:run
npm run migration:revert
npm run seed
```

Схема базы хранится в миграциях TypeORM; автоматическая синхронизация схемы
отключена.

## Проверки

```powershell
Set-Location back
npm run typecheck
npm test
npm run build

Set-Location ..\front
npm run typecheck
npm test
npm run build
```

## Скриншоты

| Каталог с фильтрами | Карточка существа |
| --- | --- |
| ![Каталог](docs/screenshots/catalog.png) | ![Карточка](docs/screenshots/detail.png) |

![Мобильная версия](docs/screenshots/mobile.png)
