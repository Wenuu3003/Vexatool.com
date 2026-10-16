interface SlideContent {
  text: string[];
  images: { data: Uint8Array; type: 'png' | 'jpg' }[];
}

export const extractContentFromPPTX = async (file: File): Promise<SlideContent[]> => {
    if (!file.name.toLowerCase().endsWith('.pptx')) throw new Error('Legacy .ppt files are unsupported. Save as .pptx in PowerPoint first.');
    if (!file.size || file.size > 25 * 1024 * 1024) throw new Error('Choose a PPTX file up to 25 MB.');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      if (!zip.file('ppt/presentation.xml')) throw new Error('Not a PPTX presentation.');
      // Extract all media files first
      const mediaFiles: Map<string, { data: Uint8Array; type: 'png' | 'jpg' }> = new Map();
      const mediaFileNames = Object.keys(zip.files).filter(name => 
        name.startsWith('ppt/media/') && (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg'))
      );
      
      for (const mediaFile of mediaFileNames) {
        const data = await zip.file(mediaFile)?.async('uint8array');
        if (data) {
          const type = mediaFile.endsWith('.png') ? 'png' : 'jpg';
          const fileName = mediaFile.split('/').pop() || '';
          mediaFiles.set(fileName, { data, type });
        }
      }
      
      const slides: SlideContent[] = [];
      const slideFiles = Object.keys(zip.files)
        .filter(name => name.match(/ppt\/slides\/slide\d+\.xml$/))
        .sort((a, b) => {
          const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
          const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
          return numA - numB;
        });

      for (const slideFile of slideFiles) {
        const slideContent: SlideContent = { text: [], images: [] };
        const content = await zip.file(slideFile)?.async('text');
        
        if (content) {
          // Extract text from XML
          const xml = new DOMParser().parseFromString(content, 'application/xml');
          if (xml.querySelector('parsererror')) throw new Error('Invalid slide XML.');
          slideContent.text = Array.from(xml.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 't')).map(node => node.textContent || '').filter(text => text.trim());
        }
        
        // Get slide relationships to find which images are on this slide
        const slideNum = slideFile.match(/slide(\d+)/)?.[1];
        const relsFile = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
        const relsContent = await zip.file(relsFile)?.async('text');
        
        if (relsContent) {
          // Find image references in relationships
          const imageRefs = relsContent.match(/Target="\.\.\/media\/([^"]+)"/g) || [];
          for (const ref of imageRefs) {
            const fileName = ref.match(/Target="\.\.\/media\/([^"]+)"/)?.[1];
            if (fileName && mediaFiles.has(fileName)) {
              slideContent.images.push(mediaFiles.get(fileName)!);
            }
          }
        }
        
        slides.push(slideContent);
      }
      
      if (!slides.length || !slides.some(slide => slide.text.length || slide.images.length)) throw new Error('No supported text or images found.');
      return slides;
    } catch (error) {
      throw new Error('Could not read supported slide content. Use a valid PPTX with text or PNG/JPEG images; no PDF was created.');
    }
  };

