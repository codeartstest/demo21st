## ADDED Requirements

### Requirement: Memory Store
The calculator SHALL persist a value in memory that can be recalled later.

#### Scenario: Store value in memory
- **WHEN** a POST request is sent to `/api/memory` with action `store` and value=42
- **THEN** the response returns `{"stored": 42}`

### Requirement: Memory Recall
The calculator SHALL return the currently stored memory value.

#### Scenario: Recall stored value
- **WHEN** a GET request is sent to `/api/memory`
- **THEN** the response returns `{"value": 42}` (the last stored value)

#### Scenario: Recall with no stored value
- **WHEN** a GET request is sent to `/api/memory` and no value has been stored
- **THEN** the response returns `{"value": 0}`

### Requirement: Memory Clear
The calculator SHALL reset the stored memory value to zero.

#### Scenario: Clear memory
- **WHEN** a DELETE request is sent to `/api/memory`
- **THEN** the response returns `{"cleared": true}` and subsequent recall returns `{"value": 0}`

### Requirement: Memory Add
The calculator SHALL add a value to the currently stored memory value.

#### Scenario: Add to memory
- **WHEN** a POST request is sent to `/api/memory` with action `add` and value=8
- **THEN** the response returns `{"stored": 50}` (42 + 8)

#### Scenario: Add to empty memory
- **WHEN** a POST request is sent to `/api/memory` with action `add` and value=10 and no prior store
- **THEN** the response returns `{"stored": 10}` (0 + 10)