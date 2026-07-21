const Calculator = require('../js/calculator');

describe('Calculator module', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.window = global.window || undefined;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe('normalizeOperation', () => {
    test.each([
      ['+', 'add'],
      ['-', 'subtract'],
      ['*', 'multiply'],
      ['/', 'divide'],
      ['add', 'add'],
      ['SUBTRACT', 'subtract'],
      ['Multiply', 'multiply'],
    ])('maps %p to %p', (input, expected) => {
      expect(Calculator.normalizeOperation(input)).toBe(expected);
    });

    test.each([['x'], ['^'], ['', null], ['modulo']])('returns null for invalid %p', (input) => {
      expect(Calculator.normalizeOperation(input)).toBeNull();
    });

    test('returns null for non-string input', () => {
      expect(Calculator.normalizeOperation(5)).toBeNull();
      expect(Calculator.normalizeOperation(null)).toBeNull();
    });
  });

  describe('formatResult', () => {
    test('formats integers without decimals', () => {
      expect(Calculator.formatResult(42)).toBe('42');
      expect(Calculator.formatResult(-7)).toBe('-7');
      expect(Calculator.formatResult(0)).toBe('0');
    });

    test('trims trailing zeros from decimals', () => {
      expect(Calculator.formatResult(3.5)).toBe('3.5');
      expect(Calculator.formatResult(2.1)).toBe('2.1');
    });

    test('represents infinity', () => {
      expect(Calculator.formatResult(Infinity)).toBe('∞');
      expect(Calculator.formatResult(-Infinity)).toBe('-∞');
    });

    test('returns empty string for invalid values', () => {
      expect(Calculator.formatResult(NaN)).toBe('');
      expect(Calculator.formatResult(null)).toBe('');
      expect(Calculator.formatResult(undefined)).toBe('');
      expect(Calculator.formatResult('abc')).toBe('');
      expect(Calculator.formatResult(true)).toBe('');
    });

    test('converts numeric strings', () => {
      expect(Calculator.formatResult('5')).toBe('5');
      expect(Calculator.formatResult('3.14')).toBe('3.14');
    });
  });

  describe('validateInput', () => {
    test('accepts integer strings', () => {
      const result = Calculator.validateInput('42');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(42);
    });

    test('accepts decimal strings', () => {
      const result = Calculator.validateInput('3.14');
      expect(result.valid).toBe(true);
      expect(result.value).toBeCloseTo(3.14);
    });

    test('accepts negative numbers', () => {
      const result = Calculator.validateInput('-8');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(-8);
    });

    test('rejects empty input', () => {
      const result = Calculator.validateInput('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('rejects null and undefined', () => {
      expect(Calculator.validateInput(null).valid).toBe(false);
      expect(Calculator.validateInput(undefined).valid).toBe(false);
    });

    test('rejects incomplete inputs', () => {
      expect(Calculator.validateInput('-').valid).toBe(false);
      expect(Calculator.validateInput('.').valid).toBe(false);
    });

    test('rejects non-numeric strings', () => {
      expect(Calculator.validateInput('abc').valid).toBe(false);
      expect(Calculator.validateInput('1..2').valid).toBe(false);
      expect(Calculator.validateInput('12a').valid).toBe(false);
    });
  });

  describe('calculate', () => {
    function mockFetchOk(result) {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ result }),
      });
    }

    function mockFetchError(status, detail) {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status,
        json: () => Promise.resolve({ detail }),
      });
    }

    test('calls the API with add operation', async () => {
      mockFetchOk(10);
      const result = await Calculator.calculate(6, 4, '+');
      expect(result).toBe(10);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/calculate'),
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body).toEqual({ operation: 'add', a: 6, b: 4 });
    });

    test('supports word-based operation names', async () => {
      mockFetchOk(2);
      const result = await Calculator.calculate(6, 4, 'subtract');
      expect(result).toBe(2);
      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.operation).toBe('subtract');
    });

    test('handles multiply', async () => {
      mockFetchOk(24);
      expect(await Calculator.calculate(6, 4, '*')).toBe(24);
    });

    test('handles divide', async () => {
      mockFetchOk(1.5);
      expect(await Calculator.calculate(6, 4, '/')).toBe(1.5);
    });

    test('coerces numeric string operands', async () => {
      mockFetchOk(10);
      await Calculator.calculate('6', '4', 'add');
      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.a).toBe(6);
      expect(body.b).toBe(4);
    });

    test('rejects invalid operation', async () => {
      mockFetchOk(0);
      await expect(Calculator.calculate(1, 2, 'modulo')).rejects.toThrow(/Invalid operation/);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('rejects non-numeric operands', async () => {
      global.fetch = jest.fn();
      await expect(Calculator.calculate('abc', 2, '+')).rejects.toThrow(/valid numbers/);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('surfaces division-by-zero error from server', async () => {
      mockFetchError(400, 'Division by zero is not allowed');
      await expect(Calculator.calculate(5, 0, '/')).rejects.toThrow(
        'Division by zero is not allowed',
      );
    });

    test('surfaces invalid operation error from server', async () => {
      mockFetchError(400, 'Invalid operation: foo');
      await expect(Calculator.calculate(1, 2, 'add')).rejects.toThrow('Invalid operation: foo');
    });

    test('provides fallback message when detail is missing', async () => {
      mockFetchError(500, undefined);
      await expect(Calculator.calculate(1, 2, 'add')).rejects.toThrow(/Request failed/);
    });

    test('handles network failure', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network down'));
      await expect(Calculator.calculate(1, 2, '+')).rejects.toThrow(
        /Unable to reach the calculator service/,
      );
    });

    test('handles malformed JSON response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });
      await expect(Calculator.calculate(1, 2, '+')).rejects.toThrow();
    });

    test('rejects response without a numeric result', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ result: 'not a number' }),
      });
      await expect(Calculator.calculate(1, 2, '+')).rejects.toThrow(/invalid response/);
    });
  });

  describe('getApiUrl', () => {
    test('returns default URL when no override is set', () => {
      expect(Calculator.getApiUrl()).toBe('http://localhost:8000');
    });

    test('uses global override when available', () => {
      const previous = global.CALCULATOR_API_URL;
      global.CALCULATOR_API_URL = 'https://api.example.com/';
      expect(Calculator.getApiUrl()).toBe('https://api.example.com');
      if (previous === undefined) {
        delete global.CALCULATOR_API_URL;
      } else {
        global.CALCULATOR_API_URL = previous;
      }
    });
  });
});