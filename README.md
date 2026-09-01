# MythBase

Каталог существ, героев и духов вымышленного мира с поиском, фильтрами и
иерархией локаций.

![Каталог существ](docs/screenshots/catalog.png)

## Возможности

- поиск по имени;
- фильтрация по типам и ветвям локаций;
- дерево локаций произвольной вложенности;
- режим уникальных существ для выбранного поддерева;
- подробные карточки с описанием и вариантами имени;
- добавление существ и дочерних локаций;
- адаптивный интерфейс со светлой и тёмной темой.

## Интерфейс

| Карточка существа | Мобильная версия |
| --- | --- |
| ![Карточка](docs/screenshots/detail.png) | ![Мобильная версия](docs/screenshots/mobile.png) |

## Стек

- Next.js 16, React 19, TypeScript;
- Express 5, TypeORM, PostgreSQL 17;
- Zod, Vitest, Testing Library, Supertest, Playwright;
- Docker Compose.

## Структура

```text
back    API, миграции и seed
front   интерфейс
e2e     Playwright-сценарии
```

## Запуск

Требуются Node.js 24, npm 11 и Docker Compose.

```powershell
Copy-Item .env.example .env
docker compose up -d --build
docker compose run --build --rm seed
```

- приложение: http://localhost:3000
- API: http://localhost:4000
- healthcheck: http://localhost:4000/health

```powershell
docker compose down
docker compose down -v
```

## Локальная разработка

Backend:

```powershell
Set-Location back
Copy-Item .env.example .env
npm ci
npm run migration:run
npm run seed
npm run dev
```

Frontend:

```powershell
Set-Location front
Copy-Item .env.example .env.local
npm ci
npm run dev
```

## Конфигурация

| Переменная | Назначение |
| --- | --- |
| `DATABASE_URL` | PostgreSQL для локального API |
| `TEST_DATABASE_URL` | отдельная тестовая база |
| `API_DATABASE_URL` | PostgreSQL для API в Docker |
| `CORS_ORIGINS` | разрешённые browser-origin |
| `RUN_MIGRATIONS` | применение миграций при запуске |
| `NEXT_PUBLIC_API_URL` | адрес API для браузера |
| `SEED_FORCE` | замена существующих записей при seed |

Полный список находится в `.env.example`, `back/.env.example` и
`front/.env.example`.

## Команды

```powershell
npm run typecheck
npm run lint
npm run test:unit
npm run build
```

```powershell
Set-Location e2e
npm ci
npm run install:browsers
npm test
```

## API

| Метод | Путь |
| --- | --- |
| `GET` | `/health` |
| `GET`, `POST` | `/creatures` |
| `GET` | `/creatures/:id` |
| `GET`, `POST` | `/locations` |
| `GET` | `/types` |
