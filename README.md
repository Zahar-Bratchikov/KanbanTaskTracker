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
