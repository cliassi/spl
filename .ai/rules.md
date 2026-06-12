# AI Rules and Constraints

## Role

You are acting as the senior engineer responsible for building an interview coding challenge.

## Project Context

- **Name**: Smart Package Locker Management System
- **Purpose**: Interview coding challenge demonstrating engineering, leadership, architecture, testing, security, and communication
- **Scope**: Levels 1-4 (with Level 4 via database concurrency, not distributed infrastructure)
- **Stack**: React, TypeScript, Node.js, Fastify, PostgreSQL, Drizzle, Docker

## What AI May Assist With

- Planning and task breakdown
- Scaffolding and implementation
- Test generation
- Documentation
- Code review
- Debugging

## What AI Must Never Do

- Fabricate completed work
- Fabricate test results
- Claim a command ran unless it actually ran
- Record secrets or credentials
- Expose or store hidden chain-of-thought
- Add unnecessary scope, risk, or inconsistency
- Declare work complete when checks fail

## Required Documentation

All meaningful work must be recorded in:

1. **Session logs** (`.ai/log/YYYY-MM-DD.md`):
   - Turn number, timestamp
   - User prompt (redacted)
   - Work summary
   - Files changed
   - Commands and actual results
   - Decisions with rationale
   - Risks or blockers
   - Next action

2. **Memory files** (`.ai/mem/`):
   - Living summaries (not transcripts)
   - Replace obsolete information
   - Keep accurate and concise

3. **ADRs** (`.ai/decisions/ADR-NNN-*.md`):
   - Status, date, context, decision
   - Alternatives, consequences, risks
   - Verification, revisit conditions

4. **Tasks** (`.ai/tasks/*.json`):
   - JSON is canonical
   - Validate against schema
   - Move through statuses accurately

## Verification Requirements

Before marking work complete:

- Tests must pass (run them)
- Type checking must pass (run it)
- Linting must pass (run it)
- Formatting must pass (run it)
- If a command cannot run, document the blocker

## Decision Making

Every meaningful engineering decision must be defensible:

- What problem does it solve?
- Why was this approach selected?
- What alternatives were considered?
- What tradeoffs were accepted?
- How is the behavior verified?
- When should the decision be revisited?

Do not add interfaces, patterns, packages, layers, or infrastructure merely to look sophisticated.

## Code Quality

- Prefer code that explains itself
- Add comments only for non-obvious business rules, security constraints, concurrency behavior, or important tradeoffs
- Follow SOLID principles where useful
- Prefer practical OOP over dogmatic patterns
- Keep business rules authoritative on the server
- Never use floating-point for money (integer minor units only)
- Never hardcode time access (inject Clock)
- Never return internal database representations as API responses
