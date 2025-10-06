# Library (lib) Organization

This folder contains all API-related code and utilities for the frontend application, organized for maintainability and reusability. This follows Next.js best practices by keeping shared utilities outside the app directory.

## Structure

```
lib/
├── index.ts          # Central exports
├── config.ts         # API configuration & endpoints
├── types.ts          # TypeScript interfaces
├── homepage.ts       # Homepage API calls
└── books.ts          # Book-related API calls
```

## Usage

### Basic Import

```typescript
import { getHomepageData, getBookDetails } from "@/lib";
// or
import { getHomepageData, getBookDetails } from "../lib";
```

### Type-safe Development

```typescript
import type { Book, BookSection, HomepageResponse } from "@/lib/types";
```

### Configuration

The API base URL can be configured via environment variables:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## API Functions

### `getHomepageData()`

Fetches homepage data including all book sections.

**Returns:** `Promise<HomepageResponse>`

### `getBookDetails(bookPath: string)`

Fetches detailed information for a specific book.

**Parameters:**

- `bookPath`: Book identifier path (e.g., "the-courage-to-be-disliked/ichiro-kishimi/fumitake-koga/9781760630737")

**Returns:** `Promise<BookDetailResponse>`

## Error Handling

All API functions include proper error handling and logging. Errors are thrown with descriptive messages for easier debugging.

## Benefits

1. **Following Next.js Conventions**: Utilities in `lib/` folder outside `app/`
2. **Centralized API Logic**: All API calls in one place
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Reusability**: Functions can be used across multiple components
5. **Maintainability**: Easy to update API endpoints or add new features
6. **Error Handling**: Consistent error handling across all API calls
7. **Environment Configuration**: Easy to switch between development and production APIs

## Path Aliases

You can use `@/lib` for cleaner imports by configuring path aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```
