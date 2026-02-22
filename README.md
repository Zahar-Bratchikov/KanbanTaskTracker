# Kanban Task Tracker

Полнофункциональный таск-трекер с канбан-доской на .NET 9 (C#), React + TypeScript и PostgreSQL.

## Запуск

1. Убедитесь, что установлены Docker и Docker Compose.
2. В корне проекта выполните:

```bash
docker compose up --build
```
После запуска:
Фронтенд: http://localhost:3000
API: http://localhost:5000/api/tasks
Данные сохраняются между перезапусками благодаря volume в PostgreSQL.

### Запуск при включённом VPN

Если при включённом VPN приложение на localhost:3000 не открывается, используйте вариант с сетью хоста:

```bash
docker compose -f docker-compose.yml -f docker-compose.vpn.yml up --build
```

Фронтенд тогда слушает порт 3000 напрямую на хосте, без проброса портов Docker. Открывайте по-прежнему: http://localhost:3000 (или http://127.0.0.1:3000).

Дополнительно: в браузере или системе задайте `NO_PROXY=localhost,127.0.0.1`, чтобы localhost не уходил в прокси/VPN.

### Автозапуск при загрузке системы

Контейнеры настроены с `restart: unless-stopped`: после первого запуска Docker будет поднимать их при перезагрузке.

Чтобы таск-трекер гарантированно поднимался при загрузке системы (даже если вы ни разу не запускали его вручную), можно включить systemd-сервис:

```bash
# Подставьте свой путь к проекту, если он отличается
sudo cp /home/zahar/projects/KanbanTaskTracker/kanban-task-tracker.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable kanban-task-tracker.service
```

После следующей загрузки контейнеры запустятся автоматически. Остановить автозапуск: `sudo systemctl disable kanban-task-tracker.service`.

**Автозапуск с VPN** (frontend в режиме host, чтобы работало при включённом VPN):

```bash
sudo cp /home/zahar/projects/KanbanTaskTracker/kanban-task-tracker-vpn.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable kanban-task-tracker-vpn.service
```

Включайте только один из сервисов: либо `kanban-task-tracker.service`, либо `kanban-task-tracker-vpn.service`.

### Селекторы для UI-тестов

У элементов интерфейса заданы стабильные **классы** (префикс `kt-`) и **data-testid** для тестов (в т.ч. Playwright, Vitest).

- **По data-testid:** `[data-testid="add-task-button"]`, `[data-testid="task-card-1"]`, `[data-testid="column-todo"]`, `[data-testid="edit-task-modal"]` и т.д.
- **По классам:** `.kt-app`, `.kt-board`, `.kt-new-task-form`, `.kt-task-card`, `.kt-column-todo`, `.kt-theme-toggle`, `.kt-button` и др.
- **По данным:** у карточки задачи — `data-task-id`, `data-task-status`, `data-task-overdue`; у колонки — `data-column-status`, `data-status`.

Полный список: см. `frontend/src/App.tsx`, `KanbanBoard.tsx`, `TaskCard.tsx`.

---

## docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: kanban
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - kanban_data:/var/lib/postgresql/data
    networks:
      - kanban-net

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:8080"
    environment:
      - ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=kanban;Username=user;Password=password
    depends_on:
      - db
    networks:
      - kanban-net

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://localhost:5000
    networks:
      - kanban-net

volumes:
  kanban_data:

networks:
  kanban-net:
    driver: bridge
