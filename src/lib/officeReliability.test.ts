import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import ExcelJS from 'exceljs';
import { parseCSV, sheetToArray, readExcelFile } from './excelUtils';
import { extractWordText, wrapOfficeText } from './officeText';
import { parseDocxContent } from './docxTableParser';
import { extractContentFromPPTX } from './extractPptx';
const file = (name: string, data: Uint8Array) => ({name, size:data.length, arrayBuffer:async()=>data.buffer} as File);
describe('Office conversion content fidelity', () => {
  it('retains embedded newlines, escaped quotes and commas in CSV cells', () => {
    expect(parseCSV('Name,Note\r\nAlice,"Line 1\nLine 2, ""quoted"""\r\n')).toEqual([['Name','Note'],['Alice','Line 1\nLine 2, "quoted"']]);
    expect(()=>parseCSV('a,"unfinished')).toThrow('Unclosed');
  });
  it('exports rich text, cached formula values and spreadsheet errors', () => {
    const ws = new ExcelJS.Workbook().addWorksheet('Data');
    ws.addRow([{richText:[{text:'Alpha '},{text:'Beta'}]}, {formula:'1+2',result:3}, {formula:'NOW()'}, {error:'#DIV/0!'}, {text:'Link',hyperlink:'https://example.com'}]);
    expect(sheetToArray(ws)[0]).toEqual(['Alpha Beta','3','[Formula result unavailable]','#DIV/0!','Link']);
  });
  it('rejects legacy XLS instead of treating it as an XLSX archive', async () => {
    await expect(readExcelFile(file('old.xls', new Uint8Array([1])))).rejects.toThrow('Legacy XLS');
  });
  it('decodes DOCX namespace aliases, XML entities, tables and paragraphs', async () => {
    const zip=new JSZip();
    zip.file('word/document.xml','<x:document xmlns:x="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><x:body><x:p><x:r><x:t>A &amp; B</x:t></x:r></x:p><x:tbl><x:tr><x:tc><x:tcPr><x:gridSpan x:val="2"/></x:tcPr><x:p><x:r><x:t>Cell &lt;1&gt;</x:t></x:r></x:p></x:tc><x:tc><x:p><x:r><x:t>Last</x:t></x:r></x:p></x:tc></x:tr></x:tbl></x:body></x:document>');
    const doc=file('input.docx',await zip.generateAsync({type:'uint8array'}));
    expect(await extractWordText(doc)).toBe('A & B\nCell <1>\nLast');
    expect(await parseDocxContent(doc)).toEqual({paragraphs:['A & B'],tables:[{rows:[['Cell <1>','','Last']]}]});
  });
  it('wraps long IDs without losing characters', () => {
    const token='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(10);
    const lines=wrapOfficeText(token,10,value=>value.length);
    expect(lines.join('')).toBe(token); expect(lines.every(line=>line.length<=10)).toBe(true);
  });
  it('reads PPTX slides in manifest order', async () => {
    const zip=new JSZip();
    zip.file('ppt/presentation.xml','<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:sldIdLst><p:sldId r:id="second"/><p:sldId r:id="first"/></p:sldIdLst></p:presentation>');
    zip.file('ppt/_rels/presentation.xml.rels','<Relationships><Relationship Id="first" Target="slides/slide1.xml"/><Relationship Id="second" Target="slides/slide2.xml"/></Relationships>');
    for(const n of [1,2])zip.file(`ppt/slides/slide${n}.xml`,`<slide xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:t>Slide ${n}</a:t></slide>`);
    const result=await extractContentFromPPTX(file('test.pptx',await zip.generateAsync({type:'uint8array'})));
    expect(result.map(slide=>slide.text[0])).toEqual(['Slide 2','Slide 1']);
  });
});
