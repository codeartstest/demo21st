## ADDED Requirements

### Requirement: Power Operation
The calculator SHALL support exponentiation (x^y) for any real base and real exponent.

#### Scenario: Positive base and exponent
- **WHEN** a POST request is sent to `/api/calculate` with operation `power`, a=2, b=3
- **THEN** the response returns `{"result": 8}`

#### Scenario: Negative exponent
- **WHEN** a POST request is sent to `/api/calculate` with operation `power`, a=5, b=-1
- **THEN** the response returns `{"result": 0.2}`

#### Scenario: Fractional exponent (square root via power)
- **WHEN** a POST request is sent to `/api/calculate` with operation `power`, a=9, b=0.5
- **THEN** the response returns `{"result": 3.0}`

### Requirement: Square Root Operation
The calculator SHALL support square root calculation for non-negative numbers.

#### Scenario: Square root of positive number
- **WHEN** a POST request is sent to `/api/calculate` with operation `sqrt`, a=16, b=0
- **THEN** the response returns `{"result": 4.0}`

#### Scenario: Square root of zero
- **WHEN** a POST request is sent to `/api/calculate` with operation `sqrt`, a=0, b=0
- **THEN** the response returns `{"result": 0.0}`

#### Scenario: Square root of negative number
- **WHEN** a POST request is sent to `/api/calculate` with operation `sqrt`, a=-4, b=0
- **THEN** the response returns HTTP 400 with detail "Cannot calculate square root of negative number"

### Requirement: Percentage Operation
The calculator SHALL support percentage calculation (x% of y).

#### Scenario: Standard percentage
- **WHEN** a POST request is sent to `/api/calculate` with operation `percent`, a=25, b=200
- **THEN** the response returns `{"result": 50.0}` (25% of 200)

#### Scenario: Zero percentage
- **WHEN** a POST request is sent to `/api/calculate` with operation `percent`, a=0, b=100
- **THEN** the response returns `{"result": 0.0}`

### Requirement: Extended Operations List
The `/api/operations` endpoint SHALL include all new operations.

#### Scenario: List all operations
- **WHEN** a GET request is sent to `/api/operations`
- **THEN** the response includes `["add", "divide", "multiply", "percent", "power", "sqrt", "subtract"]`