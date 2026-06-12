---
trigger: glob
globs: "**/*.{test,spec}.{ts,tsx}"
---

# Testing Rules

- Arrange, Act, Assert organization where useful
- Test behavior, not private implementation
- Keep tests deterministic
- Use an injected clock
- Avoid arbitrary sleeps
- Isolate mutable test data
- Test error and boundary paths
- Use unit tests for domain policies
- Use integration tests for PostgreSQL behavior
- Use Playwright for complete user workflows
- Do not mock the behavior currently under test
- Never weaken assertions merely to make a test pass
