import EMICalculator from './EMICalculator';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import PercentageCalculator from './PercentageCalculator';
import GSTCalculator from './GSTCalculator';
vi.mock('@/components/ToolLayout',()=>({ToolLayout:({children}:any)=><div>{children}</div>}));
vi.mock('@/components/CanonicalHead',()=>({CanonicalHead:()=>null}));
vi.mock('@/components/ToolSEOContent',()=>({default:()=>null}));
vi.mock('@/hooks/use-toast',()=>({useToast:()=>({toast:vi.fn()})}));
afterEach(cleanup);
it('percentage: 63% of 21500 is 13545, edits invalidate the result',()=>{
 render(<PercentageCalculator/>);
 const inputs=screen.getAllByRole('spinbutton');
 fireEvent.change(inputs[0],{target:{value:'63'}});fireEvent.change(inputs[1],{target:{value:'21500'}});
 fireEvent.click(screen.getByRole('button',{name:'Calculate'}));expect(screen.getByText('13545.00')).toBeTruthy();
 fireEvent.change(inputs[1],{target:{value:''}});expect(screen.queryByText('13545.00')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Calculate'}));expect(screen.queryByText('NaN')).toBeNull();
});
it('percentage: overflow must not be displayed as Infinity',()=>{
 render(<PercentageCalculator/>);const inputs=screen.getAllByRole('spinbutton');
 for(const input of inputs)fireEvent.change(input,{target:{value:'1e308'}});
 fireEvent.click(screen.getByRole('button',{name:'Calculate'}));expect(screen.queryByText('Infinity')).toBeNull();expect(screen.queryByText('Result')).toBeNull();
});
it('GST: selected 18% on 1000 gives total 1180; supply change clears stale totals',()=>{
 render(<GSTCalculator/>);fireEvent.change(screen.getByRole('spinbutton'),{target:{value:'1000'}});fireEvent.click(screen.getByRole('button',{name:'Calculate GST'}));
 expect(screen.getAllByText('₹1,180.00').length).toBe(2);expect(screen.getAllByText('₹90.00').length).toBe(2);
 fireEvent.click(screen.getByRole('checkbox'));expect(screen.queryByText('GST Breakdown @ 18%')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Calculate GST'}));expect(screen.getByText('IGST (18%)')).toBeTruthy();expect(screen.getAllByText('₹180.00').length).toBe(2);
});
it('GST: clearing amount removes old output and invalid submission cannot restore it',()=>{
 render(<GSTCalculator/>);const input=screen.getByRole('spinbutton');fireEvent.change(input,{target:{value:'1000'}});fireEvent.click(screen.getByRole('button',{name:'Calculate GST'}));
 fireEvent.change(input,{target:{value:''}});fireEvent.click(screen.getByRole('button',{name:'Calculate GST'}));expect(screen.queryByText('GST Breakdown @ 18%')).toBeNull();
});

it('EMI: zero interest, one year, 12000 principal gives 1000 monthly',()=>{
 render(<EMICalculator/>);
 fireEvent.change(screen.getByLabelText('Loan Amount (₹)'),{target:{value:'12000'}});
 fireEvent.change(screen.getByLabelText('Interest Rate (% per annum)'),{target:{value:'0'}});
 fireEvent.change(screen.getByLabelText('Loan Tenure'),{target:{value:'1'}});
 fireEvent.click(screen.getByRole('button',{name:'Calculate EMI'}));expect(screen.getAllByText('₹1,000').length).toBeGreaterThan(0);
 fireEvent.change(screen.getByLabelText('Loan Tenure'),{target:{value:'1000000'}});
 fireEvent.click(screen.getByRole('button',{name:'Calculate EMI'}));expect(screen.queryByText('₹1,000')).toBeNull();
});
it('EMI: one-year 12% on 12000 rounds to 1066 monthly',()=>{
 render(<EMICalculator/>);
 fireEvent.change(screen.getByLabelText('Loan Amount (₹)'),{target:{value:'12000'}});
 fireEvent.change(screen.getByLabelText('Interest Rate (% per annum)'),{target:{value:'12'}});
 fireEvent.change(screen.getByLabelText('Loan Tenure'),{target:{value:'1'}});
 fireEvent.click(screen.getByRole('button',{name:'Calculate EMI'}));expect(screen.getAllByText('₹1,066').length).toBeGreaterThan(0);
});
