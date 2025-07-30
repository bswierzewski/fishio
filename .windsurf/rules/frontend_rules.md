---
trigger: model_decision
description:
globs: frontend/**
---

# 🎣 Fishio Frontend - Rules for Cursor

**Objective:** These rules are intended to ensure that code generated or modified by Cursor is consistent with the Fishio client architecture, project conventions, and the technologies used (Next.js App Router, React, TypeScript, shadcn/ui, TailwindCSS, Zustand, React Query, React Hook Form, date-fns).

## 🏛️ 1. General Principles and Architecture

1.  **Adhere to Next.js App Router Conventions:**
    - The folder structure in `app/` defines routing.
    - Use `page.tsx` for the main UI content of a page.
    - Use `layout.tsx` for shared layouts.
    - Use `loading.tsx` to define loading UI for route segments.
    - Use `error.tsx` to handle errors in route segments.
    - Server Components by default; use the `"use client"` directive for Client Components.
2.  **Mobile-First Design:**
    - Design components and layouts with mobile devices as the primary consideration.
    - Use responsive TailwindCSS classes to adapt the appearance for larger screens.
3.  **TypeScript Everywhere:**
    - Apply strong typing for props, state, functions, and API data.
    - Define types in `lib/definitions.ts` or locally within components if they are specific. API response types (DTOs/models) and query/mutation hooks are typically generated and available in `@/lib/api/models` and `@/lib/api/endpoints` respectively.
4.  **Code Formatting (Prettier):**
    - Ensure code is formatted according to the configuration in `.prettierrc` before each commit.
5.  **Component Structure:**
    - **UI Components (`components/ui/`):** Base, reusable user interface components, often derived from or extending `shadcn/ui`.
    - **Layout Components (`components/layout/`):** Structural components like `Navbar`, `BottomNavbar`, `Sidebar`.
    - **Functional/View-Specific Components:** Can be co-located in route folders within `app/` (e.g., `app/competitions/_components/CompetitionCard.tsx`) or in a dedicated `components/features/` folder if they become more complex and reusable across different views.
6.  **Accessibility (a11y):**
    - Pay attention to HTML semantics and ARIA attributes to ensure application accessibility. `shadcn/ui` components often have this built-in.
7.  **API Client:**
    - The API client, including models (DTOs) and React Query hooks for endpoints, is auto-generated using Orval.
    - These generated files are located in `@/lib/api/models` for types/interfaces and `@/lib/api/endpoints` for query/mutation hooks.
    - Always use these generated hooks and types for interacting with the backend API to ensure consistency and type safety. Do not manually write `fetch` calls for API interactions if a generated hook is available.
    - **To regenerate the API client after backend changes:** Run `npx orval` in the client directory. This will update all endpoints and models based on the latest OpenAPI specification from the backend.

## 🔄 2. State Management

1.  **React Query (TanStack Query) for Server State:**
    - Use for fetching, caching, synchronizing, and updating data from the server, primarily through the auto-generated hooks from `@/lib/api/endpoints`.
    - Generated hooks already define query keys (`queryKey`).
    - Use the generated `useQuery` variants for fetching data and `useMutation` variants for CUD (Create, Update, Delete) operations.
    - Implement UI-specific optimistic updates and error handling using the callbacks provided by these hooks.
2.  **Zustand for Global Client State:**
    - Use for managing state that is shared across multiple components and does not directly originate from the server (e.g., UI state, user preferences, state of open modals/drawers).
    - Create small, dedicated stores (slices) for specific parts of the state.

## 📝 3. Forms

1.  **React Hook Form:**
    - Use for all forms in the application.
    - Integrate with `shadcn/ui` components (e.g., `Input`, `Select`, `Checkbox`, `Textarea`).
    - Implement client-side validation (e.g., with Zod and `@hookform/resolvers/zod`).
    - Manage form state, errors, and submission process.

## 🎨 4. Styling and UI

1.  **TailwindCSS:**
    - The primary tool for styling. Use utility classes.
    - Configuration in `tailwind.config.js`.
2.  **shadcn/ui:**
    - Utilize predefined components as a base. Copy and customize components into the project according to `shadcn/ui` documentation.
    - `shadcn/ui` component styles are based on TailwindCSS.
3.  **Global Styles (`app/globals.css`):**
    - Use for a minimal amount of global styles, basic resets, or CSS variable definitions if necessary.
4.  **Toast Notifications:**
    - Use `react-hot-toast` for displaying toast notifications. Ensure the `Toaster` component is added to a global layout.

## 🎣 5. Custom Hooks (`hooks/`)

1.  Create custom hooks for reusable logic that is tied to React (e.g., `use-media-query.tsx`).
2.  Naming: `useHookName.tsx`.

## 📚 6. Library (`lib/`)

1.  **`definitions.ts`:** A central place for _custom_ TypeScript type definitions, especially for client-side domain objects, or types not covered by API generation.
2.  **`utils.ts`:** General-purpose helper functions, not directly related to UI or component business logic.
3.  **`config.ts`:** Client-side application configuration (e.g., API URL, public keys).
4.  **`static-data.ts`:** Static data used in the application (e.g., options for selects that rarely change).
5.  **`appVersion.ts`:** Logic related to the application version (if generated and used on the client-side).
6.  **Date Formatting (`date-fns`):** Use the `date-fns` library for all date parsing, manipulation, and formatting tasks. Avoid using native `Date` methods directly for formatting where `date-fns` provides a more robust and explicit alternative.

## 🖼️ 7. Static Assets (`public/`)

1.  Place all images, icons (SVG), fonts, and other static assets in the `public/` folder.
2.  Reference them using a path relative to the root (e.g., `/logo.svg`).

## 📛 8. Naming Conventions

1.  **Components and Types:** `PascalCase` (e.g., `CompetitionCard.tsx`, `type UserProfile`).
2.  **Files and Folders (route segments, components):** `kebab-case` (e.g., `my-competitions`, `bottom-navbar.tsx`) or `PascalCase` for component files (`BottomNavbar.tsx`). Be consistent. Next.js prefers `kebab-case` for route segments.
3.  **Functions and Variables:** `camelCase` (e.g., `fetchCompetitions`, `currentUser`).
4.  **Hooks:** `use-kebab-case.tsx` for the file name, `useCamelCase` for the hook name (e.g., `use-media-query.tsx` -> `useMediaQuery`).

## ✨ 9. Creating New Functionality (Example Workflow)

Let's assume we are adding a new "My Fishing Stats" page:

1.  **Routing (App Router):**
    - Create a folder `app/(main)/my-fishing-stats/`.
    - Inside, add `page.tsx`.
    - If a loading state is needed, add `loading.tsx`.
2.  **Type Definitions (`@/lib/api/models`):**
    - Verify if the necessary DTOs for statistical data are already generated (e.g., `FishingStatsResponse`, `MonthlyCatchesDto`). If not, the backend API and client generation process might need an update.
3.  **Data Fetching (React Query - Generated Hooks):**
    - Locate and use the auto-generated React Query hook from `@/lib/api/endpoints` to fetch the stats (e.g., `useGetFishingStats`).
    - The `queryKey` will be managed by the generated hook.
4.  **Page Component (`app/(main)/my-fishing-stats/page.tsx`):**
    - Mark as `"use client"`.
    - Use the generated hook (e.g., `useGetFishingStats()`) to fetch data.
    - Display loading and error states.
    - Present the statistical data using components from `components/ui/` or by creating new, specific components (e.g., `components/features/stats/CatchesChart.tsx`).
5.  **UI/Functional Components:**
    - If the page requires complex, reusable UI parts, extract them into separate components. They can be located in a `_components` subfolder within `app/(main)/my-fishing-stats/` or in `components/features/stats/`.
6.  **Navigation:**
    - Add a link to the new page in the appropriate place (e.g., `BottomNavbar.tsx` or `Navbar.tsx`).
7.  **Styling:**
    - Use TailwindCSS classes to style the components.

---

## 📝 Additional Notes for Cursor (Frontend)

1.  **Image Optimization:** Use the `<Image>` component from `next/image` for image optimization (size, format, lazy loading).
2.  **Dynamic Imports:** For large components or libraries that are not needed immediately, consider using `next/dynamic` for dynamic importing and code splitting.
3.  **SEO and Metadata:** Utilize Next.js's built-in mechanisms for managing metadata (e.g., the `generateMetadata` function in `page.tsx` or `layout.tsx`) for better SEO.
4.  **Error Handling:** In addition to `error.tsx` for route segments, implement granular error handling within components using the `onError` callbacks from React Query mutations and by checking the `error` state of queries. Display user-friendly messages, potentially using `react-hot-toast`.
5.  **Internationalization (i18n):** If the application is to be multilingual, plan the structure and tools for i18n (e.g., `next-intl`). The project does not currently assume this, but it's worth keeping in mind.
6.  **Testing:**
    - Consider introducing libraries for component testing (e.g., React Testing Library) and E2E tests (e.g., Playwright, Cypress).
    - Test the logic of hooks and helper functions.
7.  **Environments:** Ensure that configuration (e.g., API URL in `lib/config.ts`) can be easily changed depending on the environment (development, staging, production) via Next.js environment variables (e.g., `NEXT_PUBLIC_API_URL`).
8.  **Performance:** Monitor application performance using browser developer tools and Next.js Analytics (if enabled). Pay attention to bundle sizes, load times, and interactivity.
9.  **Middleware (`middleware.ts`):** Use for logic that must be executed before a request is processed, e.g., route protection, redirects, header modification. Be mindful of middleware limitations (Edge Runtime).

---
