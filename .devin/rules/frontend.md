---
trigger: glob
globs: "apps/web/**/*.{ts,tsx,css}"
---

# Frontend Rules

- Organize by feature
- Server remains authoritative for business rules
- Use accessible semantic HTML
- Associate labels and errors with form controls
- Support keyboard interaction
- Handle loading, empty, success, and failure states
- Avoid unnecessary global state
- Keep server data in TanStack Query
- Never persist or redisplay plaintext pickup codes after the successful storage result leaves memory
- Test user-visible behavior
