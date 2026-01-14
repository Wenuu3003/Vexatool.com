/**
 * Calculator utility functions - extracted for testability
 */

export type Operation = '+' | '-' | '*' | '/' | null;

export interface CalculatorState {
  display: string;
  previousValue: string | null;
  operation: Operation;
  waitingForOperand: boolean;
}

export const initialState: CalculatorState = {
  display: '0',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
};

export const inputDigit = (state: CalculatorState, digit: string): CalculatorState => {
  if (state.waitingForOperand) {
    return {
      ...state,
      display: digit,
      waitingForOperand: false,
    };
  }
  return {
    ...state,
    display: state.display === '0' ? digit : state.display + digit,
  };
};

export const inputDecimal = (state: CalculatorState): CalculatorState => {
  if (state.waitingForOperand) {
    return {
      ...state,
      display: '0.',
      waitingForOperand: false,
    };
  }
  if (!state.display.includes('.')) {
    return {
      ...state,
      display: state.display + '.',
    };
  }
  return state;
};

export const clear = (): CalculatorState => initialState;

export const clearEntry = (state: CalculatorState): CalculatorState => ({
  ...state,
  display: '0',
});

export const percentage = (state: CalculatorState): CalculatorState => {
  const value = parseFloat(state.display) / 100;
  return {
    ...state,
    display: String(value),
  };
};

export const toggleSign = (state: CalculatorState): CalculatorState => {
  const value = parseFloat(state.display) * -1;
  return {
    ...state,
    display: String(value),
  };
};

export const performCalculation = (
  currentValue: number,
  inputValue: number,
  operation: Operation
): number | { error: string } => {
  switch (operation) {
    case '+':
      return currentValue + inputValue;
    case '-':
      return currentValue - inputValue;
    case '*':
      return currentValue * inputValue;
    case '/':
      if (inputValue === 0) {
        return { error: 'Cannot divide by zero' };
      }
      return currentValue / inputValue;
    default:
      return inputValue;
  }
};

export const performOperation = (
  state: CalculatorState,
  nextOperation: Operation
): CalculatorState | { state: CalculatorState; historyEntry: string } => {
  const inputValue = parseFloat(state.display);

  if (state.previousValue === null) {
    return {
      ...state,
      previousValue: state.display,
      waitingForOperand: true,
      operation: nextOperation,
    };
  }

  if (state.operation) {
    const currentValue = parseFloat(state.previousValue);
    const result = performCalculation(currentValue, inputValue, state.operation);

    if (typeof result === 'object' && 'error' in result) {
      return state; // Return unchanged state on error
    }

    const historyEntry = `${currentValue} ${state.operation} ${inputValue} = ${result}`;
    return {
      state: {
        display: String(result),
        previousValue: String(result),
        waitingForOperand: true,
        operation: nextOperation,
      },
      historyEntry,
    };
  }

  return {
    ...state,
    waitingForOperand: true,
    operation: nextOperation,
  };
};

export const calculate = (
  state: CalculatorState
): CalculatorState | { state: CalculatorState; historyEntry: string } | { error: string } => {
  if (!state.operation || state.previousValue === null) {
    return state;
  }

  const inputValue = parseFloat(state.display);
  const currentValue = parseFloat(state.previousValue);
  const result = performCalculation(currentValue, inputValue, state.operation);

  if (typeof result === 'object' && 'error' in result) {
    return result;
  }

  const historyEntry = `${currentValue} ${state.operation} ${inputValue} = ${result}`;
  return {
    state: {
      display: String(result),
      previousValue: null,
      operation: null,
      waitingForOperand: true,
    },
    historyEntry,
  };
};
