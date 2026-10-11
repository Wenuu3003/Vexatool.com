import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { extractContentFromPPTX } from './extractPptx';
async function presentation(xml?: string, manifest = true) {
  const zip = new JSZip();
  if (manifest) zip.file('ppt/presentation.xml', '<presentation/>');
  if (xml !== undefined) zip.file('ppt/slides/slide1.xml', xml);
  const data = await zip.generateAsync({ type: 'uint8array' });
  return {name:'test.pptx',size:data.length,arrayBuffer:async()=>data.buffer} as File;
}
describe('PPTX extraction fails instead of inventing slides', () => {
  it('rejects legacy PPT', async () => { await expect(extractContentFromPPTX({name:'old.ppt',size:10} as File)).rejects.toThrow('Legacy'); });
  it('rejects corrupt archives', async () => { await expect(extractContentFromPPTX({name:'bad.pptx',size:3,arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer} as File)).rejects.toThrow('no PDF'); });
  it('rejects an unrelated ZIP', async () => { await expect(extractContentFromPPTX(await presentation('<slide/>',false))).rejects.toThrow('no PDF'); });
  it('rejects an archive without slides', async () => { await expect(extractContentFromPPTX(await presentation())).rejects.toThrow('no PDF'); });
  it('rejects malformed slide XML', async () => { await expect(extractContentFromPPTX(await presentation('<slide>'))).rejects.toThrow('no PDF'); });
  it('rejects content with no supported text or images', async () => { await expect(extractContentFromPPTX(await presentation('<slide/>'))).rejects.toThrow('no PDF'); });
  it('extracts XML entities and namespace aliases correctly', async () => {
    const file = await presentation('<slide xmlns:x="http://schemas.openxmlformats.org/drawingml/2006/main"><x:t>A &amp; B</x:t></slide>');
    expect(await extractContentFromPPTX(file)).toEqual([{text:['A & B'],images:[]}]);
  });
});
