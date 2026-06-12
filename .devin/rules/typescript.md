---
trigger: glob
globs: "**/*.{ts,tsx}"
---

# TypeScript Rules

- Enable strict TypeScript
- Avoid `any`; justify unavoidable uses
- Prefer explicit boundary types
- Validate untrusted runtime data
- Use exhaustive handling for domain unions
- Avoid unsafe type assertions
- Keep functions focused
- Use domain terminology consistently
- Do not use floating point for money
- Do not call the system clock directly in domain logic
- Avoid catch blocks that silently discard errors
