(function () {
  const Calculator = window.Calculator;

  const state = {
    displayValue: '0',
    storedValue: null,
    pendingOperation: null,
    waitingForOperand: false,
    error: false,
    busy: false,
  };

  const els = {
    display: document.getElementById('display'),
    expression: document.getElementById('expression'),
    body: document.body,
    grid: document.getElementById('keypad'),
  };

  function render() {
    els.display.textContent = state.error
      ? state.displayValue
      : Calculator.formatResult(state.displayValue) || '0';
    els.display.classList.toggle('is-error', state.error);
    els.display.classList.toggle('is-busy', state.busy);
    els.body.classList.toggle('is-busy', state.busy);

    if (state.pendingOperation && state.storedValue !== null) {
      const symbol = state.pendingOperation === 'divide' ? '/' : state.pendingOperation === 'multiply' ? '×' : state.pendingOperation === 'subtract' ? '−' : '+';
      els.expression.textContent = `${Calculator.formatResult(state.storedValue)} ${symbol}`;
    } else {
      els.expression.textContent = '';
    }

    document.querySelectorAll('[data-action="operator"]').forEach((btn) => {
      const active = btn.dataset.op === state.pendingOperation && state.waitingForOperand === false;
      btn.classList.toggle('is-active', active);
    });
  }

  function setDisplay(value) {
    state.displayValue = value;
    state.error = false;
  }

  function inputDigit(digit) {
    if (state.error) clearAll();
    if (state.busy) return;
    if (state.waitingForOperand) {
      state.displayValue = digit;
      state.waitingForOperand = false;
    } else {
      if (state.displayValue === '0') {
        state.displayValue = digit;
      } else {
        if (state.displayValue.replace('-', '').length >= 14) return;
        state.displayValue = state.displayValue + digit;
      }
    }
    render();
  }

  function inputDecimal() {
    if (state.error) clearAll();
    if (state.busy) return;
    if (state.waitingForOperand) {
      state.displayValue = '0.';
      state.waitingForOperand = false;
    } else if (state.displayValue.indexOf('.') === -1) {
      state.displayValue = state.displayValue + '.';
    }
    render();
  }

  function toggleSign() {
    if (state.error || state.busy) return;
    if (state.displayValue === '0') return;
    if (state.displayValue.startsWith('-')) {
      state.displayValue = state.displayValue.slice(1);
    } else {
      state.displayValue = '-' + state.displayValue;
    }
    render();
  }

  function applyPercent() {
    if (state.error || state.busy) return;
    const { valid, value, error } = Calculator.validateInput(state.displayValue);
    if (!valid) {
      showError(error);
      return;
    }
    setDisplay(Calculator.formatResult(value / 100));
    render();
  }

  async function chooseOperation(op) {
    if (state.error || state.busy) return;
    const { valid, value, error } = Calculator.validateInput(state.displayValue);
    if (!valid) {
      showError(error);
      return;
    }
    if (state.storedValue === null) {
      state.storedValue = value;
    } else if (state.pendingOperation && !state.waitingForOperand) {
      state.busy = true;
      render();
      try {
        await performPending(value, true);
      } catch (err) {
        showError(err.message);
        return;
      } finally {
        state.busy = false;
      }
      if (state.error) {
        render();
        return;
      }
    }
    state.pendingOperation = op;
    state.waitingForOperand = true;
    render();
  }

  async function performPending(currentValue, chain) {
    if (state.storedValue === null || !state.pendingOperation) return;
    const result = await Calculator.calculate(state.storedValue, currentValue, state.pendingOperation);
    state.storedValue = result;
    if (!chain) {
      state.pendingOperation = null;
      state.waitingForOperand = true;
    }
  }

  async function handleEquals() {
    if (state.error || state.busy) return;
    if (state.storedValue === null || !state.pendingOperation) return;
    const { valid, value, error } = Calculator.validateInput(state.displayValue);
    if (!valid) {
      showError(error);
      return;
    }

    state.busy = true;
    render();

    try {
      const result = await Calculator.calculate(state.storedValue, value, state.pendingOperation);
      setDisplay(Calculator.formatResult(result));
      state.storedValue = null;
      state.pendingOperation = null;
      state.waitingForOperand = true;
    } catch (err) {
      showError(err.message);
    } finally {
      state.busy = false;
      render();
    }
  }

  function showError(message) {
    state.displayValue = message || 'Error';
    state.error = true;
    state.storedValue = null;
    state.pendingOperation = null;
    state.waitingForOperand = false;
  }

  function clearAll() {
    state.displayValue = '0';
    state.storedValue = null;
    state.pendingOperation = null;
    state.waitingForOperand = false;
    state.error = false;
    state.busy = false;
    render();
  }

  function clearEntry() {
    if (state.error) {
      clearAll();
      return;
    }
    state.displayValue = '0';
    state.waitingForOperand = false;
    render();
  }

  function backspace() {
    if (state.error || state.busy) return;
    if (state.waitingForOperand) return;
    if (state.displayValue.length <= 1 || (state.displayValue.length === 2 && state.displayValue.startsWith('-'))) {
      state.displayValue = '0';
    } else {
      state.displayValue = state.displayValue.slice(0, -1);
      if (state.displayValue === '-') state.displayValue = '0';
    }
    render();
  }

  function handleKey(event) {
    const { key } = event;
    if (/^[0-9]$/.test(key)) {
      inputDigit(key);
    } else if (key === '.') {
      inputDecimal();
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
      const map = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide' };
      chooseOperation(map[key]);
    } else if (key === 'Enter' || key === '=') {
      event.preventDefault();
      handleEquals();
    } else if (key === 'Backspace') {
      backspace();
    } else if (key === 'Escape') {
      clearAll();
    } else if (key === '%') {
      applyPercent();
    }
  }

  function handleButtonClick(event) {
    const target = event.target.closest('button');
    if (!target) return;
    const action = target.dataset.action;
    switch (action) {
      case 'digit': inputDigit(target.dataset.digit); break;
      case 'decimal': inputDecimal(); break;
      case 'operator': chooseOperation(target.dataset.op); break;
      case 'equals': handleEquals(); break;
      case 'clear': clearAll(); break;
      case 'clear-entry': clearEntry(); break;
      case 'backspace': backspace(); break;
      case 'sign': toggleSign(); break;
      case 'percent': applyPercent(); break;
    }
  }

  function bind() {
    els.grid.addEventListener('click', handleButtonClick);
    const equalsBtn = document.querySelector('[data-action="equals"]');
    if (equalsBtn && !els.grid.contains(equalsBtn)) {
      equalsBtn.addEventListener('click', handleButtonClick);
    }
    window.addEventListener('keydown', handleKey);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }

  render();
})();