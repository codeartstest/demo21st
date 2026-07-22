## 1. Backend — Advanced Operations

- [ ] 1.1 Add `power(a, b)`, `sqrt(a)`, `percent(a, b)` methods to `Calculator` class in `app/calculator.py`
- [ ] 1.2 Add validation: `sqrt` rejects negative input with `ValueError`
- [ ] 1.3 Add `power`, `sqrt`, `percent` to `VALID_OPERATIONS` set in `app/main.py`
- [ ] 1.4 Wire new operations into `/api/calculate` route handler
- [ ] 1.5 Write unit tests for `power`, `sqrt`, `percent` in `tests/test_calculator.py` (happy path + edge cases)

## 2. Backend — Memory Functions

- [ ] 2.1 Add `_memory` class variable and `memory_store()`, `memory_recall()`, `memory_clear()`, `memory_add()` methods to `Calculator` class
- [ ] 2.2 Create `MemoryRequest` Pydantic model (action: store|add, value: float)
- [ ] 2.3 Add `GET /api/memory`, `POST /api/memory`, `DELETE /api/memory` routes in `app/main.py`
- [ ] 2.4 Write unit tests for memory functions in `tests/test_calculator.py`

## 3. Frontend — Scientific Mode UI

- [ ] 3.1 Add scientific mode toggle button to calculator UI
- [ ] 3.2 Add operator buttons: x^y, sqrt, %, M+, MR, MC
- [ ] 3.3 Add `data-action="operator"` attributes for new operators (power, sqrt, percent)
- [ ] 3.4 Add `data-action="memory"` attributes for memory buttons (store, recall, clear, add)
- [ ] 3.5 Update JS event handlers to call `/api/calculate` with new operations
- [ ] 3.6 Update JS event handlers to call `/api/memory` endpoints
- [ ] 3.7 Add CSS styles for scientific mode layout

## 4. E2E Tests

- [ ] 4.1 Add Playwright test: power operation via UI
- [ ] 4.2 Add Playwright test: square root operation via UI
- [ ] 4.3 Add Playwright test: percentage operation via UI
- [ ] 4.4 Add Playwright test: memory store, recall, add, clear via UI
- [ ] 4.5 Add Playwright test: scientific mode toggle switches layout
- [ ] 4.6 Add Playwright test: sqrt of negative number shows error