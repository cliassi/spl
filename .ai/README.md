# AI Governance Directory

This directory contains AI-assisted development governance for the Smart Package Locker Management System.

## Directory Structure

```
.ai/
  README.md          # This file
  rules.md           # AI rules and constraints
  NEXT.md            # Current state and next action bookmark
  log/               # Session logs (YYYY-MM-DD.md)
  mem/               # Project memory files
    project.md       # Project overview and status
    domain.md        # Domain knowledge and rules
    architecture.md  # Architecture decisions and patterns
    conventions.md   # Coding conventions
  decisions/         # Architecture Decision Records (ADRs)
  tasks/             # Task management
    README.md        # Task system documentation
    task.schema.json # JSON Schema for tasks
    backlog.json     # Backlog tasks
    active.json      # Currently in-progress task(s)
    completed.json   # Completed tasks
    SANITY.md        # Sanity check log
    sprints/         # Sprint summaries
```

## Purpose

This governance system ensures:

1. **Transparency**: All AI assistance is documented and reviewable
2. **Continuity**: Work can resume seamlessly across sessions
3. **Quality**: Decisions are recorded with context and rationale
4. **Accountability**: Human review and verification is required
5. **Safety**: Secrets are never stored, evidence is never fabricated

## Usage

- Check `NEXT.md` to understand current state and next action
- Review `tasks/active.json` for the current task
- Read `mem/` files for project context
- Consult `decisions/` for architectural rationale
- Append to `log/` after meaningful work sessions
