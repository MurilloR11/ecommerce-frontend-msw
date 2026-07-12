# 📊 E-commerce Admin Dashboard — Datos a Escala

<!-- Añadir GIF/Screenshot aquí -->

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

---

## 📖 Descripción

Este proyecto **no es un storefront**. No hay carrito, no hay checkout, no hay login de cliente final. Es un **panel de administración** orientado a la operación diaria de un e-commerce: visualizar, filtrar y gestionar órdenes (`orders`) en tablas densas.

El reto técnico real no es pintar componentes bonitos: es demostrar que una tabla con **más de 5,000 filas**, filtros combinados y navegación por URL puede mantenerse **fluida a 60fps** sin que el navegador se congele, aplicando técnicas profesionales de optimización frontend.

### La regla de oro

> **El cliente nunca tiene el dataset completo.** El frontend solo puede *pedir* datos. Paginación, filtrado y agregaciones ocurren siempre en el servidor — nunca se filtra ni se pagina en memoria sobre un array cargado por completo.

---

## 🎯 Pilares técnicos evaluados

Estos son los verdaderos diferenciadores del proyecto, no una lista de features de producto:

| Pilar | Qué resuelve |
| --- | --- |
| **Virtualización de tablas** | Renderizar solo las filas visibles en el viewport (`OrdersTable`), manteniendo 60fps sin importar si hay 500 o 50,000 registros. |
| **Filtros e histórico sincronizados con la URL** | El estado de filtros (`filter-orders`) vive en los query params, no en memoria volátil. La URL es el estado — compartible, recargable, con historial de navegador funcional. |
| **Paginación estricta en el servidor** | El cliente jamás descarga el dataset completo para paginar/filtrar localmente. Cada cambio de página o filtro dispara una nueva petición con sus propios parámetros. |
| **Diseño para el fallo** | Todo endpoint puede tardar, fallar o devolver vacío. La UI contempla explícitamente estados de *loading* (skeletons), error de red y respuesta vacía — no solo el "happy path". |

---

## 🏛️ Arquitectura y estructura

### ¿Por qué Feature-Sliced Design?

Un panel de administración crece por **dominios de datos** (órdenes, productos, usuarios, métricas), no por tipos de archivo. Organizar por tipo (`components/`, `hooks/`, `services/`) hace que cada nueva vista toque decenas de carpetas y aumente el acoplamiento entre dominios que no deberían conocerse entre sí.

FSD organiza el código en capas con una regla de dependencia estricta:

```
app  →  pages  →  widgets  →  features  →  entities  →  shared
```

Una capa solo puede importar de las capas inferiores. `entities/order` (el modelo de negocio "orden") nunca depende de `features/filter-orders`; `shared` no sabe nada del dominio del negocio. Cada slice expone su API pública a través de un único `index.ts`.

### Árbol de carpetas (arquitectura objetivo)

```
src/
├── app/                        # Inicialización global: providers, estilos base
├── pages/
│   └── dashboard/
│       └── DashboardPage.tsx    # Composición de la vista de órdenes
├── widgets/
│   └── orders-table/
│       └── OrdersTable.tsx      # Tabla virtualizada + paginación servidor
├── features/
│   └── filter-orders/
│       └── useOrdersFilters.ts  # Filtros sincronizados con la URL
├── entities/
│   └── order/
│       ├── model/                # Tipos y lógica de dominio de "orden"
│       └── api/                  # Fetchers tipados hacia /api/orders
├── shared/
│   ├── ui/                        # Design system (Button, Skeleton, ...)
│   ├── lib/                        # Hooks y utilidades genéricas
│   ├── api/                         # Cliente HTTP base
│   ├── config/                       # Variables de entorno
│   └── mocks/                         # Handlers de MSW (frontera de red)
└── main.tsx
```

> Regla de oro de FSD: nunca importar directamente de dentro de otro slice; siempre a través de su `index.ts` público.

---

## 🎭 ¿Por qué MSW y no un backend real?

**Mock Service Worker (MSW)** no es un mock rápido para prototipar: es una **decisión de arquitectura**. MSW intercepta las peticiones `fetch`/`XHR` a nivel de *Service Worker*, directamente en el navegador, actuando como una **frontera de red HTTP simulada** — el frontend nunca sabe que está hablando con un mock en vez de un servidor real.

Esto tiene una consecuencia deliberada: **si mañana se elimina MSW y `VITE_API_BASE_URL` apunta a una API real (Node/Postgres), el frontend funciona sin tocar un solo componente.** Ningún `fetch`, ningún hook, ninguna lógica de UI necesita cambiar — porque nunca dependieron de MSW, dependieron del contrato HTTP.

Además, al controlar el servidor de mocks, se pueden simular condiciones que un backend real no siempre reproduce bajo demanda:

- **Latencia alta artificial**, para validar que los estados de carga (*skeletons*) se sientan bien y no parpadeen.
- **Errores 500 / timeouts**, para probar el manejo de errores de red sin depender de que el backend realmente falle.
- **Respuestas vacías**, para verificar el estado "sin resultados" de filtros y tablas.
- **Datasets grandes generados on-demand** (5,000+ órdenes), sin necesidad de levantar ni poblar una base de datos.

---

## 🚀 Requisitos previos e instalación

### Requisitos

- [Node.js](https://nodejs.org/) 20 o superior
- npm 10 o superior

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/MurilloR11/ecommerce-frontend-msw.git
cd ecommerce-frontend-msw

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (ver sección siguiente)
cp .env.example .env

# 4. Levantar el entorno de desarrollo
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`.

---

## ✅ Calidad de código

Tolerancia cero a errores de tipado y de lint. Ningún cambio debería mergearse sin pasar estas verificaciones:

| Comando | Descripción |
| --- | --- |
| `npm run typecheck` | Verifica los tipos con TypeScript en modo `strict` (`tsc -b`) |
| `npm run lint` | ESLint con reglas *type-checked* estrictas, 0 warnings permitidos |
| `npm run format` | Formatea todo el proyecto con Prettier |
| `npm run build` | Build de producción (incluye `typecheck` + `vite build`) |

**Estándares aplicados:** TypeScript `strict: true` + `noUncheckedIndexedAccess`, `noImplicitReturns`, `noUnusedLocals`, `noUnusedParameters` · ESLint (`typescript-eslint`) en modo `strictTypeChecked` + `stylisticTypeChecked` · Prettier como única fuente de verdad para el formato.

---

## 🔑 Variables de entorno

Todas las variables expuestas al cliente **deben** tener el prefijo `VITE_` — cualquier otra variable no estará disponible en el código del navegador.

```bash
cp .env.example .env
```

```bash
# .env
VITE_API_BASE_URL=/api
VITE_APP_ENV=development
```

`VITE_API_BASE_URL=/api` es una **ruta relativa**, no una URL absoluta, y esto es intencional: MSW se registra en el navegador como Service Worker e intercepta cualquier petición que salga desde el mismo origen hacia `/api/*` (por ejemplo, `/api/orders?page=2`), respondiendo con datos mockeados de forma completamente transparente para el código de la aplicación. Los fetchers en `entities/order/api` no saben que MSW existe; solo hacen `fetch(\`${env.apiBaseUrl}/orders\`)`.

Para apuntar a un backend real, el único cambio necesario es reemplazar el valor por una URL absoluta (`https://api.miempresa.com`) y no registrar el *worker* de MSW — cero cambios en componentes, hooks o lógica de negocio.

---

## 📌 Estado actual

Este README describe la arquitectura objetivo del proyecto. Para evitar hablar en futuro de cosas que no existen, este es el corte real:

**✅ Construido:**
- Proyecto inicializado con Vite + React 19 + TypeScript en modo `strict`.
- ESLint (`strictTypeChecked`) y Prettier configurados y verificados (`lint`, `typecheck`, `build` pasan sin errores).
- Alias de rutas (`@/`) configurado en `tsconfig` y `vite.config.ts`.
- Esqueleto de carpetas Feature-Sliced Design (`app`, `pages`, `widgets`, `features`, `entities`, `shared`).
- Componente base de ejemplo en `shared/ui` (`Button`).
- Gestión de variables de entorno con validación en runtime (`shared/config/env.ts`).

**🔜 Planeado (roadmap):**
- Integración de MSW y handlers en `shared/mocks`.
- `entities/order`: modelo de dominio y fetchers tipados.
- `widgets/orders-table`: tabla virtualizada con paginación servidor.
- `features/filter-orders`: filtros sincronizados con la URL.
- Estados de carga (*skeletons*) y manejo de errores de red.
- `pages/dashboard`: composición final de la vista.

---

## 🧰 Stack técnico

| Categoría | Tecnología |
| --- | --- |
| Framework | React 19 |
| Lenguaje | TypeScript (strict) |
| Build tool | Vite 8 |
| Estilos | CSS puro |
| Arquitectura | Feature-Sliced Design |
| Mocking de red | MSW (Mock Service Worker) — planeado |
| Linter | ESLint (`typescript-eslint` strict + type-checked) |
| Formateador | Prettier |
