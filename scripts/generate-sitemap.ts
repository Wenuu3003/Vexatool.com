/**
 * Sitemap Generation Script
 * 
 * This script automatically generates sitemap.xml from the routes configuration.
 * 
 * Usage:
 *   - Manual: npx tsx scripts/generate-sitemap.ts
 *   - In package.json build script: Run before vite build
 *   
 * The script reads all routes from src/config/routes.ts and generates
 * a valid sitemap.xml in the public directory.
 */

import { generateSitemapXml } from '../src/config/routes';
import * as fs from 'fs';
import * as path from 'path';

const generateSitemap = () => {
  console.log('🗺️  Generating sitemap.xml...');
  
  const sitemap = generateSitemapXml();
  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  
  fs.writeFileSync(outputPath, sitemap, 'utf-8');
  
  const urlCount = (sitemap.match(/<url>/g) || []).length;
  const timestamp = new Date().toISOString();
  
  console.log(`✅ Sitemap generated successfully!`);
  console.log(`   📍 Location: ${outputPath}`);
  console.log(`   📊 Total URLs: ${urlCount}`);
  console.log(`   🕒 Generated at: ${timestamp}`);
  
  // Validate sitemap structure
  if (!sitemap.includes('<?xml version="1.0"')) {
    console.error('❌ Warning: Invalid XML declaration');
  }
  if (!sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
    console.error('❌ Warning: Missing sitemap namespace');
  }
  
  return urlCount;
};

// Run the script
try {
  generateSitemap();
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}
