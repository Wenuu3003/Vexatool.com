import { describe, it, expect } from 'vitest';
import {
  initialState,
  inputDigit,
  inputDecimal,
  clear,
  clearEntry,
  percentage,
  toggleSign,
  performCalculation,
  performOperation,
  calculate,
  type CalculatorState,
} from './calculator';

describe('Calculator Logic', () => {
  describe('initialState', () => {
    it('should have correct initial values', () => {
      expect(initialState.display).toBe('0');
      expect(initialState.previousValue).toBeNull();
      expect(initialState.operation).toBeNull();
      expect(initialState.waitingForOperand).toBe(false);
    });
  });

  describe('inputDigit', () => {
    it('should replace 0 with entered digit', () => {
      const result = inputDigit(initialState, '5');
      expect(result.display).toBe('5');
    });

    it('should append digit to existing display', () => {
      const state: CalculatorState = { ...initialState, display: '12' };
      const result = inputDigit(state, '3');
      expect(result.display).toBe('123');
    });

    it('should replace display when waiting for operand', () => {
      const state: CalculatorState = { ...initialState, display: '5', waitingForOperand: true };
      const result = inputDigit(state, '7');
      expect(result.display).toBe('7');
      expect(result.waitingForOperand).toBe(false);
    });

    it('should handle multiple digit input', () => {
      let state = inputDigit(initialState, '1');
      state = inputDigit(state, '2');
      state = inputDigit(state, '3');
      expect(state.display).toBe('123');
    });
  });

  describe('inputDecimal', () => {
    it('should add decimal point to display', () => {
      const state: CalculatorState = { ...initialState, display: '5' };
      const result = inputDecimal(state);
      expect(result.display).toBe('5.');
    });

    it('should not add second decimal point', () => {
      const state: CalculatorState = { ...initialState, display: '5.5' };
      const result = inputDecimal(state);
      expect(result.display).toBe('5.5');
    });

    it('should start with 0. when waiting for operand', () => {
      const state: CalculatorState = { ...initialState, waitingForOperand: true };
      const result = inputDecimal(state);
      expect(result.display).toBe('0.');
      expect(result.waitingForOperand).toBe(false);
    });
  });

  describe('clear', () => {
    it('should reset to initial state', () => {
      const result = clear();
      expect(result).toEqual(initialState);
    });
  });

  describe('clearEntry', () => {
    it('should only clear display', () => {
      const state: CalculatorState = {
        display: '123',
        previousValue: '50',
        operation: '+',
        waitingForOperand: false,
      };
      const result = clearEntry(state);
      expect(result.display).toBe('0');
      expect(result.previousValue).toBe('50');
      expect(result.operation).toBe('+');
    });
  });

  describe('percentage', () => {
    it('should divide by 100', () => {
      const state: CalculatorState = { ...initialState, display: '50' };
      const result = percentage(state);
      expect(result.display).toBe('0.5');
    });

    it('should handle decimal percentages', () => {
      const state: CalculatorState = { ...initialState, display: '25.5' };
      const result = percentage(state);
      expect(result.display).toBe('0.255');
    });
  });

  describe('toggleSign', () => {
    it('should negate positive number', () => {
      const state: CalculatorState = { ...initialState, display: '5' };
      const result = toggleSign(state);
      expect(result.display).toBe('-5');
    });

    it('should negate negative number', () => {
      const state: CalculatorState = { ...initialState, display: '-5' };
      const result = toggleSign(state);
      expect(result.display).toBe('5');
    });

    it('should handle zero', () => {
      const state: CalculatorState = { ...initialState, display: '0' };
      const result = toggleSign(state);
      expect(result.display).toBe('0');
    });
  });

  describe('performCalculation', () => {
    it('should add correctly', () => {
      expect(performCalculation(5, 3, '+')).toBe(8);
    });

    it('should subtract correctly', () => {
      expect(performCalculation(10, 4, '-')).toBe(6);
    });

    it('should multiply correctly', () => {
      expect(performCalculation(6, 7, '*')).toBe(42);
    });

    it('should divide correctly', () => {
      expect(performCalculation(20, 4, '/')).toBe(5);
    });

    it('should return error for division by zero', () => {
      const result = performCalculation(10, 0, '/');
      expect(result).toEqual({ error: 'Cannot divide by zero' });
    });

    it('should handle decimal operations', () => {
      expect(performCalculation(0.1, 0.2, '+')).toBeCloseTo(0.3);
    });

    it('should handle negative numbers', () => {
      expect(performCalculation(-5, 3, '+')).toBe(-2);
      expect(performCalculation(-5, -3, '*')).toBe(15);
    });
  });

  describe('performOperation', () => {
    it('should store first operand', () => {
      const result = performOperation(
        { ...initialState, display: '5' },
        '+'
      );
      expect(result).toEqual({
        display: '5',
        previousValue: '5',
        operation: '+',
        waitingForOperand: true,
      });
    });

    it('should chain operations', () => {
      const state: CalculatorState = {
        display: '3',
        previousValue: '5',
        operation: '+',
        waitingForOperand: false,
      };
      const result = performOperation(state, '*');
      
      if ('state' in result) {
        expect(result.state.display).toBe('8');
        expect(result.state.previousValue).toBe('8');
        expect(result.state.operation).toBe('*');
        expect(result.historyEntry).toBe('5 + 3 = 8');
      }
    });
  });

  describe('calculate', () => {
    it('should perform final calculation', () => {
      const state: CalculatorState = {
        display: '4',
        previousValue: '10',
        operation: '+',
        waitingForOperand: false,
      };
      const result = calculate(state);
      
      if ('state' in result && !('error' in result)) {
        expect(result.state.display).toBe('14');
        expect(result.state.previousValue).toBeNull();
        expect(result.state.operation).toBeNull();
        expect(result.historyEntry).toBe('10 + 4 = 14');
      }
    });

    it('should return unchanged state if no operation', () => {
      const result = calculate(initialState);
      expect(result).toEqual(initialState);
    });

    it('should return error for division by zero', () => {
      const state: CalculatorState = {
        display: '0',
        previousValue: '10',
        operation: '/',
        waitingForOperand: false,
      };
      const result = calculate(state);
      expect(result).toEqual({ error: 'Cannot divide by zero' });
    });
  });

  describe('Complex calculation sequences', () => {
    it('should handle: 5 + 3 * 2 = (chain operations)', () => {
      // Start with 5
      let state = inputDigit(initialState, '5');
      expect(state.display).toBe('5');
      
      // Press +
      let opResult = performOperation(state, '+');
      state = 'state' in opResult ? opResult.state : opResult;
      
      // Enter 3
      state = inputDigit(state, '3');
      expect(state.display).toBe('3');
      
      // Press * (should calculate 5+3=8 first)
      opResult = performOperation(state, '*');
      if ('state' in opResult) {
        state = opResult.state;
        expect(state.display).toBe('8');
      }
      
      // Enter 2
      state = inputDigit(state, '2');
      expect(state.display).toBe('2');
      
      // Press = (should calculate 8*2=16)
      const calcResult = calculate(state);
      if ('state' in calcResult && !('error' in calcResult)) {
        expect(calcResult.state.display).toBe('16');
      }
    });

    it('should handle decimal calculations: 10.5 / 2.5 =', () => {
      let state = inputDigit(initialState, '1');
      state = inputDigit(state, '0');
      state = inputDecimal(state);
      state = inputDigit(state, '5');
      expect(state.display).toBe('10.5');
      
      let opResult = performOperation(state, '/');
      state = 'state' in opResult ? opResult.state : opResult;
      
      state = inputDigit(state, '2');
      state = inputDecimal(state);
      state = inputDigit(state, '5');
      expect(state.display).toBe('2.5');
      
      const calcResult = calculate(state);
      if ('state' in calcResult && !('error' in calcResult)) {
        expect(parseFloat(calcResult.state.display)).toBe(4.2);
      }
    });
  });
});
