# Mikrotek Themes Build

A starter theme/template for the Mikrotek Business Suite Neo. It includes a Laravel 12 backend, Vite‑powered frontend, Docker support, and a set of ready‑to‑use Blade layouts, resources, and API endpoints.

---

## 📦 Prerequisites

- **macOS** (you are on a Mac)
- **Homebrew** – for installing PHP, Composer, Node, etc.
- **PHP 8.2+** – the project requires PHP ≥ 8.2 (the repo is already set up with a private GitHub repo). Verify with:
  ```bash
  php -v
  ```
- **Composer** – dependency manager for PHP.
- **Node 20+** and **npm** – for frontend assets.
- **Docker** (optional) – if you prefer containerised development.

---

## 🛠️ Local Development

### 1. Clone the repo
```bash
git clone git@github.com:jemirokasih/mikrotek-themes-build.git
cd mikrotek-themes-build
```

### 2. Install PHP dependencies
```bash
composer install   # includes dev‑dependencies (PHPUnit, etc.)
```

### 3. Install Node dependencies
```bash
npm install
```

### 4. Build assets (development mode)
```bash
npm run dev   # hot‑reload server – Vite watches your files
```

### 5. Run the Laravel development server
```bash
php artisan serve
```
Visit `http://127.0.0.1:8000` in your browser.

---

## 📦 Docker workflow (recommended)

The repository contains a `Dockerfile` and `docker‑compose.yml` for a fully containerised environment.

```bash
# Build and start the containers
docker compose up -d --build
```

The app will be reachable at `http://localhost:9000` (the `app` service exposes port 9000). The health‑check endpoint can be used to verify the container is ready:

```bash
curl http://localhost:9000/health
# => {"status":"ok"}
```

To stop the containers:
```bash
docker compose down
```

---

## ✅ Running Tests

The project uses **PHPUnit** (installed via Composer). After installing dependencies, run:
```bash
php artisan test
```
All feature and unit tests should pass.

---

## 📚 Project Structure Highlights

- **`app/Http/Resources`** – base API resources (`BaseResource`, `PaginatedCollection`).
- **`resources/views/layouts/app.blade.php`** – base Blade layout with Tailwind & Vite integration.
- **`routes/web.php`** – includes a simple `/health` JSON endpoint.
- **`docker-compose.yml` & `Dockerfile`** – ready‑to‑use Docker environment (PHP 8.5‑fpm base, Composer, Node).
- **`openapi.yaml`** – placeholder for future OpenAPI spec.

---

## 🎯 Quick Start Cheat Sheet

```bash
# Clone
git clone git@github.com:jemirokasih/mikrotek-themes-build.git && cd mikrotek-themes-build

# Install deps
composer install && npm install

# Development (hot‑reload)
npm run dev & php artisan serve

# Or Docker
docker compose up -d --build
```

---

## 📜 License

This project is intended as a **template** for internal use. Adjust the license as needed for your organisation.

---

*Created and maintained by the Mikrotek team.*
