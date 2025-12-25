// Run with: npx ts-node scripts/generate-sitemap.ts
// Or add to package.json scripts: "generate-sitemap": "ts-node scripts/generate-sitemap.ts"

import { generateSitemapXml } from '../src/config/routes';
import * as fs from 'fs';
import * as path from 'path';

const sitemap = generateSitemapXml();
const outputPath = path.join(__dirname, '../public/sitemap.xml');

fs.writeFileSync(outputPath, sitemap, 'utf-8');
console.log(`✓ Sitemap generated at: ${outputPath}`);
console.log(`  Total URLs: ${sitemap.split('<url>').length - 1}`);
