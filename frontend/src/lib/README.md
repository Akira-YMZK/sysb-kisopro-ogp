# Backend to Server Actions Migration

This directory contains the migrated backend functionality using Next.js Server Actions.

## Directory Structure

- `data/` - Contains JSON data files migrated from the backend
  - `classrooms.json` - Classroom data
  - `schedules.json` - Schedule data
- `actions/` - Contains Server Actions (functions with 'use server' directives)
  - `classrooms.ts` - Classroom-related server actions
  - `schedules.ts` - Schedule-related server actions
- `utils/` - Contains utility functions
  - `data-utils.ts` - Data reading utilities

## Migration Details

The original Express backend was migrated to use Next.js Server Actions. This provides several advantages:

1. **Unified Codebase**: All code now resides in the Next.js frontend, eliminating the need for a separate backend server.
2. **Type Safety**: Full TypeScript integration from frontend to backend.
3. **Simplified Architecture**: Direct function calls instead of HTTP requests.
4. **Improved Performance**: Reduces network overhead by eliminating API calls between frontend and backend.

## How it Works

### Data Access

Data is now read directly from JSON files in the `data/` directory using Node.js filesystem APIs.

### Server Actions

Functions in the `actions/` directory are marked with the `'use server'` directive, allowing them to run on the server but be called directly from client components.

### API Compatibility

For backward compatibility, API route handlers have been created that map to the corresponding Server Actions. These maintain the same URL patterns as the original Express API.

## Usage

### Direct Usage (Recommended)

```typescript
import { searchClassroomsByParams } from '@/lib/actions/classrooms';

// In a server component or another server action
const classrooms = await searchClassroomsByParams({ building: '工学部3号館' });
```

### Through API Wrapper (For Client Components)

```typescript
import { searchClassrooms } from '@/utils/api';

// In a client component
const classrooms = await searchClassrooms({ building: '工学部3号館' });
```
