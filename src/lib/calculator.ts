/**
 * Calculator utility functions - extracted for testability
 * Supports basic arithmetic, scientific operations, and safe number handling
 */

export type Operation = '+' | '-' | '*' | '/' | '^' | null;

export interface CalculatorState {
  display: string;
  previousValue: string | null;
  operation: Operation;
  waitingForOperand: boolean;
  error: string | null;
}

export const initialState: CalculatorState = {
  display: '0',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
  error: null,
};

// Maximum safe display length to prevent overflow
const MAX_DISPLAY_LENGTH = 15;
const MAX_SAFE_VALUE = 1e15;
const MIN_SAFE_VALUE = 1e-15;

// Format number for display, handling very large/small numbers
export const formatDisplayNumber = (value: number): string => {
  if (!isFinite(value)) {
    return 'Error';
  }
  
  if (Math.abs(value) > MAX_SAFE_VALUE) {
    return value.toExponential(8);
  }
  
  if (Math.abs(value) < MIN_SAFE_VALUE && value !== 0) {
    return value.toExponential(8);
  }
  
  const stringValue = String(value);
  if (stringValue.length > MAX_DISPLAY_LENGTH) {
    // Try to fit by reducing decimal places
    const decimalIndex = stringValue.indexOf('.');
    if (decimalIndex !== -1) {
      const intPart = stringValue.substring(0, decimalIndex);
      const availableDecimals = MAX_DISPLAY_LENGTH - intPart.length - 1;
      if (availableDecimals > 0) {
        return value.toFixed(availableDecimals);
      }
    }
    return value.toExponential(6);
  }
  
  return stringValue;
};

export const inputDigit = (state: CalculatorState, digit: string): CalculatorState => {
  // Clear any error state
  if (state.error) {
    return {
      ...initialState,
      display: digit,
    };
  }
  
  if (state.waitingForOperand) {
    return {
      ...state,
      display: digit,
      waitingForOperand: false,
      error: null,
    };
  }
  
  // Prevent display from getting too long
  if (state.display.replace(/[.-]/g, '').length >= MAX_DISPLAY_LENGTH) {
    return state;
  }
  
  return {
    ...state,
    display: state.display === '0' ? digit : state.display + digit,
    error: null,
  };
};

export const inputDecimal = (state: CalculatorState): CalculatorState => {
  // Clear any error state
  if (state.error) {
    return {
      ...initialState,
      display: '0.',
    };
  }
  
  if (state.waitingForOperand) {
    return {
      ...state,
      display: '0.',
      waitingForOperand: false,
      error: null,
    };
  }
  
  // Prevent multiple decimals
  if (state.display.includes('.')) {
    return state;
  }
  
  return {
    ...state,
    display: state.display + '.',
    error: null,
  };
};

export const clear = (): CalculatorState => initialState;

export const clearEntry = (state: CalculatorState): CalculatorState => ({
  ...state,
  display: '0',
  error: null,
});

export const backspace = (state: CalculatorState): CalculatorState => {
  if (state.error || state.waitingForOperand) {
    return {
      ...state,
      display: '0',
      error: null,
    };
  }
  
  const newDisplay = state.display.length > 1 
    ? state.display.slice(0, -1) 
    : '0';
  
  return {
    ...state,
    display: newDisplay,
    error: null,
  };
};

export const percentage = (state: CalculatorState): CalculatorState => {
  const value = parseFloat(state.display) / 100;
  return {
    ...state,
    display: formatDisplayNumber(value),
    waitingForOperand: true,
    error: null,
  };
};

export const toggleSign = (state: CalculatorState): CalculatorState => {
  const value = parseFloat(state.display) * -1;
  return {
    ...state,
    display: formatDisplayNumber(value),
    error: null,
  };
};

export const squareRoot = (state: CalculatorState): CalculatorState | { error: string } => {
  const value = parseFloat(state.display);
  
  if (value < 0) {
    return { error: 'Invalid input for square root' };
  }
  
  const result = Math.sqrt(value);
  return {
    ...state,
    display: formatDisplayNumber(result),
    waitingForOperand: true,
    error: null,
  };
};

export const square = (state: CalculatorState): CalculatorState => {
  const value = parseFloat(state.display);
  const result = value * value;
  
  if (!isFinite(result)) {
    return {
      ...state,
      display: 'Error',
      error: 'Number overflow',
      waitingForOperand: true,
    };
  }
  
  return {
    ...state,
    display: formatDisplayNumber(result),
    waitingForOperand: true,
    error: null,
  };
};

export const reciprocal = (state: CalculatorState): CalculatorState | { error: string } => {
  const value = parseFloat(state.display);
  
  if (value === 0) {
    return { error: 'Cannot divide by zero' };
  }
  
  const result = 1 / value;
  return {
    ...state,
    display: formatDisplayNumber(result),
    waitingForOperand: true,
    error: null,
  };
};

export const performCalculation = (
  currentValue: number,
  inputValue: number,
  operation: Operation
): number | { error: string } => {
  let result: number;
  
  switch (operation) {
    case '+':
      result = currentValue + inputValue;
      break;
    case '-':
      result = currentValue - inputValue;
      break;
    case '*':
      result = currentValue * inputValue;
      break;
    case '/':
      if (inputValue === 0) {
        return { error: 'Cannot divide by zero' };
      }
      result = currentValue / inputValue;
      break;
    case '^':
      result = Math.pow(currentValue, inputValue);
      break;
    default:
      return inputValue;
  }
  
  if (!isFinite(result)) {
    return { error: 'Number overflow' };
  }
  
  return result;
};

export const performOperation = (
  state: CalculatorState,
  nextOperation: Operation
): CalculatorState | { state: CalculatorState; historyEntry: string } => {
  // Clear any error state
  if (state.error) {
    return {
      ...initialState,
      display: state.display === 'Error' ? '0' : state.display,
      previousValue: state.display === 'Error' ? null : state.display,
      waitingForOperand: true,
      operation: nextOperation,
    };
  }
  
  const inputValue = parseFloat(state.display);

  if (state.previousValue === null) {
    return {
      ...state,
      previousValue: state.display,
      waitingForOperand: true,
      operation: nextOperation,
      error: null,
    };
  }

  // Auto-correct: if waiting for operand, just change the operation
  if (state.waitingForOperand) {
    return {
      ...state,
      operation: nextOperation,
    };
  }

  if (state.operation) {
    const currentValue = parseFloat(state.previousValue);
    const result = performCalculation(currentValue, inputValue, state.operation);

    if (typeof result === 'object' && 'error' in result) {
      return {
        ...state,
        display: 'Error',
        error: result.error,
        waitingForOperand: true,
      };
    }

    const formattedResult = formatDisplayNumber(result);
    const historyEntry = `${currentValue} ${state.operation} ${inputValue} = ${result}`;
    return {
      state: {
        display: formattedResult,
        previousValue: formattedResult,
        waitingForOperand: true,
        operation: nextOperation,
        error: null,
      },
      historyEntry,
    };
  }

  return {
    ...state,
    waitingForOperand: true,
    operation: nextOperation,
    error: null,
  };
};

export const calculate = (
  state: CalculatorState
): CalculatorState | { state: CalculatorState; historyEntry: string } | { error: string } => {
  if (state.error) {
    return { error: state.error };
  }
  
  if (!state.operation || state.previousValue === null) {
    return state;
  }

  const inputValue = parseFloat(state.display);
  const currentValue = parseFloat(state.previousValue);
  const result = performCalculation(currentValue, inputValue, state.operation);

  if (typeof result === 'object' && 'error' in result) {
    return result;
  }

  const formattedResult = formatDisplayNumber(result);
  const historyEntry = `${currentValue} ${state.operation} ${inputValue} = ${result}`;
  return {
    state: {
      display: formattedResult,
      previousValue: null,
      operation: null,
      waitingForOperand: true,
      error: null,
    },
    historyEntry,
  };
};
