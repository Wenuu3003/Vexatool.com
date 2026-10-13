import { expect,it } from 'vitest';
import { parsePageRange } from './pdfPageRange';
it('extracts explicit pages once in document order',()=>expect(parsePageRange('3, 1-2,2',4)).toEqual([0,1,2]));
it('blank selects all pages',()=>expect(parsePageRange(' ',3)).toEqual([0,1,2]));
it.each(['1foo','1.5','1-2-3','0','4','1-4','3-1','1,','1,,2','-1','99999999999999999999'])('rejects the entire invalid request %s',range=>expect(()=>parsePageRange(range,3)).toThrow());
