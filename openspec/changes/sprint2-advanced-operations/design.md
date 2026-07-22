## Context

The Calculator API (FastAPI + Python backend, vanilla HTML/CSS/JS frontend) currently supports 4 basic operations: add, subtract, multiply, divide. Sprint 1 delivered the MVP. Sprint 2 adds advanced operations and memory functions.

## Goals / Non-Goals

**Goals:**
- Add power, square root, and percentage operations to the existing `/api/calculate` endpoint
- Add memory store/recall/clear/add via a new `/api/memory` endpoint
- Add scientific mode toggle to the frontend UI
- Maintain backward compatibility with existing API

**Non-Goals:**
- No trigonometric functions (sin, cos, tan) — deferred to Sprint 3
- No logarithmic functions — deferred to Sprint 3
- No persistent storage across server restarts (memory is session-scoped)
- No user authentication or multi-user memory isolation

## Decisions

1. **Extend existing endpoint for advanced ops**: Power, sqrt, and percent use the same `POST /api/calculate` pattern — consistent API, minimal frontend changes
2. **New endpoint for memory**: Memory is stateful and conceptually different from stateless calculations — separate `/api/memory` endpoint with RESTful verbs (GET/POST/DELETE)
3. **In-memory storage**: Memory value stored as a class variable on the Calculator instance — simple, no database needed for MVP
4. **Frontend scientific mode toggle**: A toggle button switches between basic and scientific layout — avoids cluttering the basic UI
5. **Validation**: Negative sqrt returns HTTP 400 (consistent with division-by-zero error pattern)

## Risks / Trade-offs

- **In-memory storage lost on restart**: Acceptable for MVP; persistent storage can be added later
- **No concurrent user isolation**: Single Calculator instance shared across requests — fine for single-user demo
- **Floating-point precision**: Python `**` operator handles edge cases well, but very large exponents may cause OverflowError — should catch and return 400