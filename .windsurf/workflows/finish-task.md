---
name: Finish Task
description: Verify and close an active task
---

# /finish-task

Verify and close an active task.

## Steps

1. Re-read acceptance criteria
2. Inspect the complete task diff
3. Run targeted tests
4. Run relevant type checking and linting
5. Run broader checks according to risk
6. Confirm documentation accuracy
7. Record actual verification evidence
8. Keep the task open if any required check fails
9. If complete:
   - Move it to `DONE`
   - Record `completedAt`
   - Move it to `completed.json`
   - Update sprint summary
   - Update memory
   - Update session log
   - Set exactly one next action in `.ai/NEXT.md`
10. Report completed behavior and verification succinctly
