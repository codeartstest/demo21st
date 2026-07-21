(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.Calculator = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const DEFAULT_API_URL = 'http://localhost:8000';

  const SYMBOL_TO_OPERATION = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    '/': 'divide',
  };

  const VALID_OPERATIONS = ['add', 'subtract', 'multiply', 'divide'];

  function getApiUrl() {
    const override =
      (typeof globalThis !== 'undefined' && globalThis.CALCULATOR_API_URL) ||
      (typeof window !== 'undefined' && window.CALCULATOR_API_URL);
    if (override) {
      return String(override).replace(/\/$/, '');
    }
    return DEFAULT_API_URL;
  }

  function normalizeOperation(operation) {
    if (typeof operation !== 'string') {
      return null;
    }
    const trimmed = operation.trim();
    const lower = trimmed.toLowerCase();
    if (SYMBOL_TO_OPERATION[trimmed]) {
      return SYMBOL_TO_OPERATION[trimmed];
    }
    if (VALID_OPERATIONS.includes(lower)) {
      return lower;
    }
    return null;
  }

  async function calculate(a, b, operation) {
    const op = normalizeOperation(operation);
    if (!op) {
      throw new Error(`Invalid operation: ${operation}`);
    }

    const operandA = Number(a);
    const operandB = Number(b);
    if (Number.isNaN(operandA) || Number.isNaN(operandB)) {
      throw new Error('Operands must be valid numbers');
    }

    let response;
    try {
      response = await fetch(`${getApiUrl()}/api/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: op, a: operandA, b: operandB }),
      });
    } catch (networkError) {
      throw new Error('Unable to reach the calculator service');
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const detail = data && data.detail ? data.detail : `Request failed (${response.status})`;
      throw new Error(detail);
    }

    if (!data || typeof data.result !== 'number' || Number.isNaN(data.result)) {
      throw new Error('Received an invalid response from the server');
    }

    return data.result;
  }

  function formatResult(value) {
    if (value === null || value === undefined || typeof value === 'boolean') {
      return '';
    }
    const num = Number(value);
    if (Number.isNaN(num)) {
      return '';
    }
    if (!Number.isFinite(num)) {
      return num > 0 ? '∞' : '-∞';
    }
    if (Number.isInteger(num)) {
      return String(num);
    }
    const rounded = Number(num.toFixed(10));
    let str = String(rounded);
    if (str.indexOf('.') !== -1) {
      str = str.replace(/0+$/, '').replace(/\.$/, '');
    }
    if (str.length > 14) {
      return num.toExponential(8);
    }
    return str;
  }

  function validateInput(value) {
    if (value === null || value === undefined || value === '') {
      return { valid: false, error: 'Input is required' };
    }
    const str = String(value).trim();
    if (str === '-' || str === '.') {
      return { valid: false, error: 'Input is incomplete' };
    }
    if (!/^-?\d*\.?\d+$/.test(str)) {
      return { valid: false, error: 'Input must be a valid number' };
    }
    const num = Number(str);
    if (!Number.isFinite(num)) {
      return { valid: false, error: 'Input must be a finite number' };
    }
    return { valid: true, value: num };
  }

  return {
    calculate,
    formatResult,
    validateInput,
    normalizeOperation,
    getApiUrl,
  };
});