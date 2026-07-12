<<<<<<< HEAD
# 📊 E-commerce Admin Dashboard — Datos a Escala

<!-- Añadir GIF/Screenshot aquí -->
=======
# 🛒 Ecommerce Frontend — Data at Scale

> Una interfaz de e-commerce construida para demostrar que el frontend puede manejar catálogos y datos a gran escala sin sacrificar rendimiento, mantenibilidad ni calidad de código.
>>>>>>> a6217425d705db330ca33e513b495d3d6cade527

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
<<<<<<< HEAD
=======
[![ESLint](https://img.shields.io/badge/ESLint-strict--type--checked-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/code_style-Prettier-F7B93E?logo=prettier&logoColor=black)](https://prettier.io/)
[![Architecture](https://img.shields.io/badge/Architecture-Feature--Sliced_Design-orange)](https://feature-sliced.design/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#)
>>>>>>> a6217425d705db330ca33e513b495d3d6cade527

---

## 📖 Descripción

<<<<<<< HEAD
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
=======
Este proyecto es una prueba de concepto de e-commerce cuyo objetivo **no** es solo mostrar productos en pantalla, sino demostrar que una interfaz de usuario puede **escalar en volumen de datos** (catálogos extensos, listados, filtros, estado compartido) **sin romperse ni degradarse** a medida que el proyecto crece.

Para lograrlo, el proyecto se apoya en tres pilares:

1. **Arquitectura predecible** — [Feature-Sliced Design](https://feature-sliced.design/) evita que el código se convierta en una maraña de dependencias cruzadas a medida que se agregan features.
2. **Tipado estricto de punta a punta** — TypeScript en modo `strict` (+ reglas adicionales) elimina categorías enteras de bugs antes de que lleguen a producción.
3. **Calidad de código no negociable** — ESLint con reglas *type-checked* y Prettier garantizan consistencia sin depender de la disciplina manual de cada desarrollador.

---

## ✨ Características principales

- ⚛️ **React 19** con componentes funcionales y hooks.
- 🔒 **TypeScript en modo `strict`**, con flags adicionales (`noUncheckedIndexedAccess`, `noImplicitReturns`, `noUnusedLocals`, `noUnusedParameters`, `forceConsistentCasingInFileNames`).
- ⚡ **Vite 8** como build tool: arranque instantáneo, HMR y builds de producción optimizados.
- 🧭 **Alias de rutas absolutas** (`@/`) — cero imports relativos del tipo `../../../shared/ui`.
- 🏗️ **Feature-Sliced Design** como arquitectura de carpetas, pensada para escalar en número de features sin acoplamiento.
- 🧹 **ESLint estricto** (`strictTypeChecked` + `stylisticTypeChecked` de `typescript-eslint`) integrado con reglas de React Hooks y React Refresh.
- 🎨 **Prettier** como formateador único, sin conflictos con ESLint (`eslint-config-prettier`).
- 🎯 **CSS puro**, sin frameworks de estilos: control total sobre el bundle final.
- 🔐 **Gestión segura de variables de entorno** vía `.env` + validación en runtime (`shared/config/env.ts`).
>>>>>>> a6217425d705db330ca33e513b495d3d6cade527

---

## 🏛️ Arquitectura y estructura

### ¿Por qué Feature-Sliced Design?

<<<<<<< HEAD
Un panel de administración crece por **dominios de datos** (órdenes, productos, usuarios, métricas), no por tipos de archivo. Organizar por tipo (`components/`, `hooks/`, `services/`) hace que cada nueva vista toque decenas de carpetas y aumente el acoplamiento entre dominios que no deberían conocerse entre sí.

FSD organiza el código en capas con una regla de dependencia estricta:
=======
A medida que un catálogo de e-commerce crece (productos, carrito, checkout, usuario, promociones...), organizar el código **por tipo de archivo** (`components/`, `hooks/`, `services/`) hace que cada nueva feature toque decenas de carpetas distintas y aumente el acoplamiento.

FSD organiza el código **por capas de responsabilidad y por dominio de negocio**, con una regla de dependencia estricta: una capa solo puede importar de las capas inferiores.
>>>>>>> a6217425d705db330ca33e513b495d3d6cade527

```
app  →  pages  →  widgets  →  features  →  entities  →  shared
```

<<<<<<< HEAD
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
=======
Esto significa, por ejemplo, que `entities` (modelos de negocio como `product` o `user`) nunca puede depender de `features`, y que `shared` no sabe nada del dominio del negocio. El resultado: features nuevas se agregan sin tocar código existente, y cada slice expone una API pública clara a través de su `index.ts`.

### Árbol de carpetas

```
src/
├── app/                 # Inicialización global: providers, router, estilos base
│   ├── styles/
│   └── App.tsx
├── pages/                # Composición de páginas / rutas
│   └── home/
│       ├── HomePage.tsx
│       └── index.ts       # API pública del slice
├── widgets/              # Bloques de UI compuestos (Header, Sidebar, ProductGrid)
├── features/             # Acciones de negocio (add-to-cart, filter-products, auth)
├── entities/               # Modelos de negocio (product, user, order)
├── shared/                 # Código reutilizable, sin conocimiento del dominio
│   ├── ui/                  # Design system (ej. Button)
│   ├── lib/                  # Hooks y utilidades genéricas
│   ├── api/                   # Cliente HTTP base
│   ├── config/                 # Configuración y variables de entorno
│   ├── types/
│   └── assets/
├── main.tsx
└── vite-env.d.ts
```

> Regla de oro: nunca importar directamente desde dentro de otro slice (`features/auth/ui/LoginForm`); siempre a través de su `index.ts` público (`features/auth`).
>>>>>>> a6217425d705db330ca33e513b495d3d6cade527

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

<<<<<<< HEAD
Tolerancia cero a errores de tipado y de lint. Ningún cambio debería mergearse sin pasar estas verificaciones:

| Comando | Descripción |
| --- | --- |
| `npm run typecheck` | Verifica los tipos con TypeScript en modo `strict` (`tsc -b`) |
| `npm run lint` | ESLint con reglas *type-checked* estrictas, 0 warnings permitidos |
| `npm run format` | Formatea todo el proyecto con Prettier |
| `npm run build` | Build de producción (incluye `typecheck` + `vite build`) |

**Estándares aplicados:** TypeScript `strict: true` + `noUncheckedIndexedAccess`, `noImplicitReturns`, `noUnusedLocals`, `noUnusedParameters` · ESLint (`typescript-eslint`) en modo `strictTypeChecked` + `stylisticTypeChecked` · Prettier como única fuente de verdad para el formato.
=======
Este proyecto tiene tolerancia cero a errores de tipado y de lint. Ningún cambio debería mergearse sin pasar estas verificaciones:

| Comando               | Descripción                                                        |
| ---------------------- | -------------------------------------------------------------------- |
| `npm run typecheck`   | Verifica los tipos con TypeScript en modo `strict` (`tsc -b`)      |
| `npm run lint`         | Ejecuta ESLint con reglas *type-checked* estrictas, 0 warnings permitidos |
| `npm run format`      | Formatea todo el proyecto con Prettier                              |
| `npm run build`        | Build de producción (incluye `typecheck` + `vite build`)            |

**Estándares aplicados:**

- TypeScript `strict: true` + `noUncheckedIndexedAccess`, `noImplicitReturns`, `noUnusedLocals`, `noUnusedParameters`.
- ESLint con `typescript-eslint` en modo `strictTypeChecked` y `stylisticTypeChecked` (linting con información de tipos, no solo sintáctico).
- Reglas de `react-hooks` y `react-refresh` para prevenir bugs comunes de React.
- Prettier como única fuente de verdad para el formato (sin reglas de estilo duplicadas en ESLint).
>>>>>>> a6217425d705db330ca33e513b495d3d6cade527

---

## 🔑 Variables de entorno

<<<<<<< HEAD
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
=======
El proyecto usa variables de entorno gestionadas por Vite. Todas las variables expuestas al cliente **deben** tener el prefijo `VITE_` — cualquier otra variable no estará disponible en el código del navegador.

1. Copia el archivo de ejemplo:

   ```bash
   cp .env.example .env
   ```

2. Completa los valores según tu entorno:

   ```bash
   # .env
   VITE_API_BASE_URL=https://api.example.com
   VITE_APP_ENV=development
   ```

3. Las variables se consumen de forma centralizada y tipada en [`src/shared/config/env.ts`](src/shared/config/env.ts), que valida en runtime que las variables requeridas existan antes de arrancar la app:

   ```ts
   import { env } from '@/shared/config/env'

   env.apiBaseUrl // string, validado y tipado
   ```

> ⚠️ Nunca subas el archivo `.env` al repositorio ni guardes secretos con prefijo `VITE_` — todo lo que pase por el build queda expuesto en el bundle del cliente. `.env` ya está excluido en `.gitignore`.
>>>>>>> a6217425d705db330ca33e513b495d3d6cade527

---

## 🧰 Stack técnico

<<<<<<< HEAD
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
=======
| Categoría         | Tecnología                                                        |
| ------------------ | -------------------------------------------------------------------- |
| Framework          | React 19                                                             |
| Lenguaje            | TypeScript (strict)                                                  |
| Build tool           | Vite 8                                                               |
| Estilos              | CSS puro                                                             |
| Arquitectura         | Feature-Sliced Design                                                |
| Linter                | ESLint (`typescript-eslint` strict + type-checked)                  |
| Formateador           | Prettier                                                             |
>>>>>>> a6217425d705db330ca33e513b495d3d6cade527
