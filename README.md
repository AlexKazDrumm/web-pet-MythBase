# MythBase

Каталог существ, героев и духов вымышленного мира. Записи объединены с типами
и иерархией локаций; каталог поддерживает поиск, составные фильтры, подробные
карточки и добавление новых данных.

![Каталог существ](docs/screenshots/catalog.png)

## Возможности

- поиск существ по имени;
- фильтрация по типам и одной или нескольким ветвям локаций;
- иерархия локаций произвольной вложенности;
- режим «только уникальные» для выбранного поддерева;
- карточки с описанием, альтернативными и исходными именами;
- создание существ и дочерних локаций;
- безопасный seed с 12 демонстрационными существами;
- состояния загрузки, пустой выдачи и ошибок API;
- адаптивный интерфейс и управление модальными окнами с клавиатуры.

## Архитектура

```text
back/                 Express API, TypeORM, миграции и seed
front/                Next.js-клиент и компонентные тесты
e2e/                  Playwright-проверки desktop/mobile
docs/screenshots/      актуальные снимки интерфейса
docker-compose.yml    PostgreSQL, API и production-клиент
```

Backend хранит схему только в миграциях TypeORM: автоматическая синхронизация
отключена. Frontend обращается к отдельному HTTP API, поэтому адрес API
задаётся на этапе сборки через `NEXT_PUBLIC_API_URL`.

## Стек

| Слой | Технологии |
| --- | --- |
| Backend | Node.js 24 LTS, Express 5, TypeORM, PostgreSQL 17, Zod |
| Frontend | Next.js 16, React 19, TypeScript |
| Тесты | Vitest, Supertest, Testing Library, Playwright |
| Инфраструктура | Docker, Docker Compose, GitHub Actions |

## Требования

- Node.js 24.x и npm 11+;
- PostgreSQL 17+ для локальной разработки либо Docker с Compose;
- Chromium, установленный через Playwright, для browser-тестов.

## Быстрый старт через Docker Compose

```powershell
Copy-Item .env.example .env
# Замените POSTGRES_PASSWORD в .env на собственное локальное значение.
docker compose up -d --build
docker compose run --build --rm seed
```

- приложение: <http://localhost:3000>;
- API: <http://localhost:4000>;
- health-check: <http://localhost:4000/health>.

Команда `seed` откажется изменять непустую базу. Для намеренной полной замены
демонстрационных данных задайте `SEED_FORCE=true`.

Остановить контейнеры без удаления данных:

```powershell
docker compose down
```

Полностью пересоздать локальную базу:

```powershell
docker compose down -v
```

### Подключение существующей PostgreSQL

Для API в Docker укажите в корневом `.env` строку подключения с доступным из
контейнера адресом:

```dotenv
API_DATABASE_URL=postgres://user:password@host.docker.internal:5432/mythbase
RUN_MIGRATIONS=false
```

Затем запустите прикладные сервисы без контейнера БД:

```powershell
docker compose up -d --build --no-deps api web
```

## Локальная разработка

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

По умолчанию клиент работает на <http://localhost:3000>, API — на
<http://localhost:4000>.

## Переменные окружения

| Переменная | Назначение |
| --- | --- |
| `DATABASE_URL` | PostgreSQL для локального API |
| `TEST_DATABASE_URL` | отдельная тестовая БД; её имя обязано содержать `test` |
| `API_DATABASE_URL` | внешняя PostgreSQL для API в Docker; пустое значение использует сервис `db` |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | параметры контейнера PostgreSQL |
| `POSTGRES_PORT`, `API_PORT`, `WEB_PORT` | публикуемые порты Compose |
| `DB_SSL` | TLS для подключения backend к PostgreSQL |
| `RUN_MIGRATIONS` | применение миграций при запуске API |
| `CORS_ORIGINS` | разрешённые browser-origin через запятую |
| `JSON_BODY_LIMIT` | максимальный размер JSON-запроса |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` | ограничение частоты изменяющих запросов |
| `NEXT_PUBLIC_API_URL` | адрес API, доступный из браузера |
| `SEED_FORCE` | разрешение seed заменить существующие записи |

Безопасные шаблоны находятся в `.env.example`, `back/.env.example` и
`front/.env.example`. Настоящие `.env` не должны попадать в Git.

## Миграции и seed

```powershell
Set-Location back
npm run migration:run
npm run migration:revert
npm run seed
```

Production-контейнер API применяет миграции при `RUN_MIGRATIONS=true`. Seed
работает отдельным Compose-сервисом и не запускается автоматически.

## Проверки

После установки зависимостей в корневом пакете и приложениях основные проверки
доступны из корня:

```powershell
npm ci
npm ci --prefix back
npm ci --prefix front
npm ci --prefix e2e

npm run typecheck
npm run lint
npm run test:unit
npm run build
```

### Backend

Unit-тесты не требуют БД:

```powershell
Set-Location back
npm run typecheck
npm run test:unit
npm run build
```

Полный `npm test` включает integration-тесты, которые пересоздают данные.
Поэтому они принимают только отдельную БД с `test` в имени:

```powershell
docker run --rm --name mythbase-test-db `
  -e POSTGRES_USER=mythbase `
  -e POSTGRES_PASSWORD=mythbase `
  -e POSTGRES_DB=mythbase_test `
  -p 55432:5432 -d postgres:17-alpine

$env:TEST_DATABASE_URL="postgres://mythbase:mythbase@localhost:55432/mythbase_test"
npm test
docker stop mythbase-test-db
```

### Frontend

```powershell
Set-Location front
npm run typecheck
npm test
npm run build
```

### Browser QA

После запуска и наполнения Docker-стека:

```powershell
Set-Location e2e
npm ci
npm run install:browsers
npm test
```

Playwright проверяет основной сценарий в светлой и тёмной desktop-теме и в
mobile viewport, загрузку обложек и favicon, browser console, сетевые ошибки и
горизонтальный overflow. Те же проверки запускаются в GitHub Actions.

## HTTP API

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/health` | состояние API |
| `GET` | `/creatures` | список и фильтрация существ |
| `GET` | `/creatures/:id` | подробная карточка |
| `POST` | `/creatures` | создание существа |
| `GET` | `/locations` | дерево локаций со счётчиками |
| `POST` | `/locations` | создание локации |
| `GET` | `/types` | типы со счётчиками |

DTO валидируются Zod-схемами, неизвестные поля отклоняются, ошибки API не
раскрывают внутренние данные. Изменяющие endpoints ограничены rate limit.
Демонстрационный проект не реализует аутентификацию, поэтому перед открытой
публикацией записи следует добавить авторизацию или ограничить `POST` на уровне
reverse proxy.

## Production-сборка

```powershell
Set-Location back
npm ci
npm run build

Set-Location ..\front
npm ci
npm run build
```

Backend запускается командой `npm start`, frontend — `npm start` после
production-сборки. Docker Compose собирает те же артефакты на Node.js 24.

## Скриншоты

| Каталог с фильтрами | Карточка существа |
| --- | --- |
| ![Каталог](docs/screenshots/catalog.png) | ![Карточка](docs/screenshots/detail.png) |

![Мобильная версия](docs/screenshots/mobile.png)
