# 🛒 Ecommerce Frontend — Data at Scale

> Una interfaz de e-commerce construida para demostrar que el frontend puede manejar catálogos y datos a gran escala sin sacrificar rendimiento, mantenibilidad ni calidad de código.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-strict--type--checked-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/code_style-Prettier-F7B93E?logo=prettier&logoColor=black)](https://prettier.io/)
[![Architecture](https://img.shields.io/badge/Architecture-Feature--Sliced_Design-orange)](https://feature-sliced.design/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#)

---

## 📖 Descripción

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

---

## 🏛️ Arquitectura y estructura

### ¿Por qué Feature-Sliced Design?

A medida que un catálogo de e-commerce crece (productos, carrito, checkout, usuario, promociones...), organizar el código **por tipo de archivo** (`components/`, `hooks/`, `services/`) hace que cada nueva feature toque decenas de carpetas distintas y aumente el acoplamiento.

FSD organiza el código **por capas de responsabilidad y por dominio de negocio**, con una regla de dependencia estricta: una capa solo puede importar de las capas inferiores.

```
app  →  pages  →  widgets  →  features  →  entities  →  shared
```

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

---

## 🔑 Variables de entorno

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

---

## 🧰 Stack técnico

| Categoría         | Tecnología                                                        |
| ------------------ | -------------------------------------------------------------------- |
| Framework          | React 19                                                             |
| Lenguaje            | TypeScript (strict)                                                  |
| Build tool           | Vite 8                                                               |
| Estilos              | CSS puro                                                             |
| Arquitectura         | Feature-Sliced Design                                                |
| Linter                | ESLint (`typescript-eslint` strict + type-checked)                  |
| Formateador           | Prettier                                                             |
