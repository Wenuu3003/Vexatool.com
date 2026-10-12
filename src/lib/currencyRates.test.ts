import { expect, it } from 'vitest';
import { parseRates, convertAmount } from './currencyRates';
it('validates USD reference data and retains provider date', () => {
  expect(parseRates({base:'USD',date:'2026-10-01',rates:{USD:1,EUR:0.9,INR:Infinity}})).toEqual({date:'2026-10-01',rates:{USD:1,EUR:0.9}});
});
it('rejects missing dates, wrong bases and invalid base rates', () => {
  for (const data of [null,{}, {base:'EUR',date:'2026-10-01',rates:{USD:1}}, {base:'USD',rates:{USD:1}}, {base:'USD',date:'2026-10-01',rates:{USD:0}}]) expect(()=>parseRates(data)).toThrow();
});
it('does not invent missing currency rates', () => {
  expect(convertAmount('10','USD','EUR',{USD:1})).toBeNull();
  expect(convertAmount('10','EUR','USD',{USD:1})).toBeNull();
  expect(convertAmount('10','USD','EUR',null)).toBeNull();
});
it('rejects invalid amounts and accepts zero and cross rates', () => {
  const rates={USD:1,EUR:0.8,INR:80};
  for(const amount of ['', 'abc', '1foo', '-1', 'Infinity', '1e999']) expect(convertAmount(amount,'USD','EUR',rates)).toBeNull();
  expect(convertAmount('0','USD','EUR',rates)).toBe(0);
  expect(convertAmount('2','EUR','INR',rates)).toBe(200);
});
