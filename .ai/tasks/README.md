# Task Management System

This directory contains the canonical task management for the Smart Package Locker project.

## Files

- **`task.schema.json`** — JSON Schema for task validation
- **`backlog.json`** — All epics and unstarted tasks
- **`active.json`** — Currently in-progress task(s)
- **`completed.json`** — Done tasks with completion records
- **`SANITY.md`** — Sanity check log for scope/design decisions
- **`sprints/`** — Sprint summaries (human-readable)

## ID Format

| Prefix | Type | Example |
|--------|------|---------|
| SPL-E01+ | Epic | SPL-E01 |
| SPL-101+ | Story/Task | SPL-101 |
| SPL-B01+ | Bug | SPL-B01 |
| SPL-S01+ | Spike | SPL-S01 |

## Status Flow

```
BACKLOG → READY → IN_PROGRESS → IN_REVIEW → DONE
              ↓        ↓
            BLOCKED (can return to READY/IN_PROGRESS)
```

## Rules

1. **Only one IN_PROGRESS task** unless parallel work is explicitly justified
2. **JSON is canonical** — Markdown sprint files are summaries only
3. **Validate all JSON** against `task.schema.json`
4. **Move tasks** through statuses accurately
5. **Record dates** for startedAt, completedAt

## Workflow

1. Check `active.json` for current work
2. Complete task → move to `completed.json`
3. Update `NEXT.md` with next action
4. Record session log entry
