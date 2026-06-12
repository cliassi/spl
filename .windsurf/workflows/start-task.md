---
name: Start Task
description: Begin one Jira-compatible task
---

# /start-task

Begin one Jira-compatible task.

## Steps

1. Read the selected task
2. Verify dependencies
3. Confirm no conflicting active task exists
4. Move the task to `IN_PROGRESS`
5. Record `startedAt`
6. Inspect relevant requirements, ADRs, and code
7. Identify assumptions and risks
8. Add a SANITY entry if a meaningful choice is required
9. State the implementation and test plan
10. Write or identify the first failing test when TDD applies
11. Update `.ai/NEXT.md`
