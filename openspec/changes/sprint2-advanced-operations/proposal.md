## Why

The Calculator API currently supports only basic arithmetic (add, subtract, multiply, divide). Users need advanced mathematical operations for scientific and engineering calculations. This is the top-requested feature from user feedback.

## What Changes

Add advanced calculator operations: power, square root, percentage, and memory functions (store, recall, clear). Extend the backend API with new endpoints and update the frontend UI with scientific mode toggle.

## Capabilities

### New Capabilities
- `advanced-operations`: Power, square root, and percentage calculations via new API endpoints
- `memory-functions`: Memory store (M+), recall (MR), clear (MC), and add-to-memory (M+) operations

### Modified Capabilities
- `calculator-api`: Extend `/api/operations` response to include new operation types; add new POST endpoints for advanced and memory operations

## Impact

- **Backend**: New methods in `Calculator` class, new Pydantic models, new API routes
- **Frontend**: Scientific mode toggle button, new operator buttons (x^y, sqrt, %, M+, MR, MC)
- **E2E Tests**: New test scenarios for advanced operations and memory functions
- **API Contract**: New endpoints — backward compatible (existing endpoints unchanged)