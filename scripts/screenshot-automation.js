/**
 * Automated Screenshot Generator for Tool Previews
 * 
 * This script automatically captures screenshots of each tool page
 * and saves them as optimized WebP images for the tools gallery.
 * 
 * Features:
 * - Puppeteer-based browser automation
 * - WebP optimization with sharp
 * - Daily cron job scheduling
 * - Parallel processing for speed
 * - Error handling and retry logic
 * 
 * Requirements:
 * npm install puppeteer sharp
 * 
 * Usage:
 * node scripts/screenshot-automation.js
 * 
 * Cron Setup (daily at 3 AM):
 * 0 3 * * * cd /path/to/project && node scripts/screenshot-automation.js >> /var/log/screenshots.log 2>&1
 */

const puppeteer = require('puppeteer');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'https://mypdfs.in',
  outputDir: path.join(__dirname, '../public/previews'),
  tempDir: path.join(__dirname, '../temp-screenshots'),
  viewport: { width: 1280, height: 800 },
  thumbnailSize: { width: 640, height: 400 },
  quality: 85,
  timeout: 30000,
  concurrency: 3,
  retryAttempts: 3,
};

// Tool routes to capture
const TOOLS = [
  { id: 'ai-text-generator', path: '/ai-text-generator' },
  { id: 'ai-grammar-tool', path: '/ai-grammar-tool' },
  { id: 'ai-resume-builder', path: '/ai-resume-builder' },
  { id: 'hashtag-generator', path: '/hashtag-generator' },
  { id: 'youtube-generator', path: '/youtube-generator' },
  { id: 'whatsapp-analyzer', path: '/whatsapp-analyzer' },
  { id: 'image-resizer', path: '/image-resizer' },
  { id: 'image-converter', path: '/image-format-converter' },
  { id: 'background-remover', path: '/background-remover' },
  { id: 'compress-image', path: '/compress-image' },
  { id: 'love-calculator', path: '/love-calculator' },
  { id: 'age-calculator', path: '/age-calculator' },
  { id: 'bmi-calculator', path: '/bmi-calculator' },
  { id: 'emi-calculator', path: '/emi-calculator' },
  { id: 'gst-calculator', path: '/gst-calculator' },
  { id: 'unit-converter', path: '/unit-converter' },
  { id: 'word-counter', path: '/word-counter' },
  { id: 'qr-code-scanner', path: '/qr-code-scanner' },
  { id: 'qr-code-generator', path: '/qr-code-generator' },
  { id: 'currency-converter', path: '/currency-converter' },
  { id: 'seo-tool', path: '/seo-tool' },
  { id: 'calculator', path: '/calculator' },
  { id: 'pincode-generator', path: '/pincode-generator' },
  { id: 'file-compressor', path: '/file-compressor' },
  { id: 'compress-pdf', path: '/compress-pdf' },
  { id: 'merge-pdf', path: '/merge-pdf' },
  { id: 'split-pdf', path: '/split-pdf' },
  { id: 'edit-pdf', path: '/edit-pdf' },
  { id: 'sign-pdf', path: '/sign-pdf' },
  { id: 'watermark-pdf', path: '/watermark-pdf' },
  { id: 'rotate-pdf', path: '/rotate-pdf' },
  { id: 'unlock-pdf', path: '/unlock-pdf' },
  { id: 'protect-pdf', path: '/protect-pdf' },
  { id: 'organize-pdf', path: '/organize-pdf' },
  { id: 'repair-pdf', path: '/repair-pdf' },
  { id: 'pdf-to-word', path: '/pdf-to-word' },
  { id: 'word-to-pdf', path: '/word-to-pdf' },
  { id: 'pdf-to-excel', path: '/pdf-to-excel' },
  { id: 'excel-to-pdf', path: '/excel-to-pdf' },
  { id: 'word-to-excel', path: '/word-to-excel' },
  { id: 'excel-to-word', path: '/excel-to-word' },
  { id: 'pdf-to-powerpoint', path: '/pdf-to-powerpoint' },
  { id: 'ppt-to-pdf', path: '/ppt-to-pdf' },
  { id: 'pdf-to-html', path: '/pdf-to-html' },
  { id: 'html-to-pdf', path: '/html-to-pdf' },
  { id: 'pdf-to-image', path: '/pdf-to-image' },
  { id: 'pdf-to-jpg', path: '/pdf-to-jpg' },
  { id: 'pdf-to-png', path: '/pdf-to-png' },
  { id: 'image-to-pdf', path: '/image-to-pdf' },
  { id: 'jpg-to-pdf', path: '/jpg-to-pdf' },
  { id: 'png-to-pdf', path: '/png-to-pdf' },
  { id: 'google-drive-to-pdf', path: '/google-drive-to-pdf' },
];

/**
 * Ensure directories exist
 */
async function ensureDirectories() {
  await fs.mkdir(CONFIG.outputDir, { recursive: true });
  await fs.mkdir(CONFIG.tempDir, { recursive: true });
  console.log(`✓ Directories ready: ${CONFIG.outputDir}`);
}

/**
 * Capture screenshot of a single tool
 */
async function captureScreenshot(browser, tool) {
  const page = await browser.newPage();
  const tempPath = path.join(CONFIG.tempDir, `${tool.id}.png`);
  const outputPath = path.join(CONFIG.outputDir, `${tool.id}-preview.webp`);

  try {
    await page.setViewport(CONFIG.viewport);
    
    // Navigate to tool page
    const url = `${CONFIG.baseUrl}${tool.path}`;
    console.log(`📸 Capturing: ${tool.id} (${url})`);
    
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout
    });

    // Wait for main content to load
    await page.waitForSelector('main', { timeout: 10000 }).catch(() => {});
    
    // Hide any cookie banners or modals
    await page.evaluate(() => {
      const selectors = [
        '[class*=\\\"cookie\\\"]',
        '[class*=\\\"banner\\\"]',
        '[class*=\\\"modal\\\"]',
        '[class*=\\\"popup\\\"]',
        '[id*=\\\"cookie\\\"]',
        '[id*=\\\"consent\\\"]'
      ];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.style.display = 'none';
        });
      });
    });

    // Wait a bit for animations to settle
    await new Promise(r => setTimeout(r, 1000));

    // Take screenshot
    await page.screenshot({
      path: tempPath,
      type: 'png',
      fullPage: false
    });

    // Optimize and convert to WebP
    await sharp(tempPath)
      .resize(CONFIG.thumbnailSize.width, CONFIG.thumbnailSize.height, {
        fit: 'cover',
        position: 'top'
      })
      .webp({ quality: CONFIG.quality })
      .toFile(outputPath);

    console.log(`✓ Saved: ${tool.id}-preview.webp`);
    
    // Clean up temp file
    await fs.unlink(tempPath).catch(() => {});
    
    return { success: true, tool: tool.id };
  } catch (error) {
    console.error(`✗ Failed: ${tool.id} - ${error.message}`);
    return { success: false, tool: tool.id, error: error.message };
  } finally {
    await page.close();
  }
}

/**
 * Process tools in batches for parallel execution
 */
async function processBatch(browser, tools) {
  const results = [];
  
  for (let i = 0; i < tools.length; i += CONFIG.concurrency) {
    const batch = tools.slice(i, i + CONFIG.concurrency);
    const batchResults = await Promise.all(
      batch.map(tool => captureScreenshot(browser, tool))
    );
    results.push(...batchResults);
    
    // Progress update
    const completed = Math.min(i + CONFIG.concurrency, tools.length);
    console.log(`\n📊 Progress: ${completed}/${tools.length} tools\n`);
  }
  
  return results;
}

/**
 * Retry failed captures
 */
async function retryFailed(browser, failedTools) {
  console.log(`\n🔄 Retrying ${failedTools.length} failed captures...\n`);
  
  const results = [];
  for (const tool of failedTools) {
    const toolData = TOOLS.find(t => t.id === tool);
    if (toolData) {
      const result = await captureScreenshot(browser, toolData);
      results.push(result);
    }
  }
  
  return results;
}

/**
 * Generate summary report
 */
function generateReport(results) {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success);
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 SCREENSHOT CAPTURE REPORT');
  console.log('='.repeat(50));
  console.log(`✓ Successful: ${successful}/${results.length}`);
  console.log(`✗ Failed: ${failed.length}/${results.length}`);
  
  if (failed.length > 0) {
    console.log('\nFailed tools:');
    failed.forEach(f => console.log(`  - ${f.tool}: ${f.error}`));
  }
  
  console.log('\n' + '='.repeat(50));
  
  return { successful, failed: failed.length, total: results.length };
}

/**
 * Clean up old screenshots
 */
async function cleanupOld() {
  try {
    const files = await fs.readdir(CONFIG.outputDir);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    for (const file of files) {
      const filePath = path.join(CONFIG.outputDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        // File is older than 7 days, keep it but log
        console.log(`📁 Old file: ${file} (${Math.round((now - stats.mtime.getTime()) / 86400000)} days old)`);
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Screenshot Automation');
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`🌐 Base URL: ${CONFIG.baseUrl}`);
  console.log(`📁 Output: ${CONFIG.outputDir}`);
  console.log(`📸 Tools: ${TOOLS.length}\n`);
  
  await ensureDirectories();
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  
  try {
    // Initial capture
    let results = await processBatch(browser, TOOLS);
    
    // Retry failed ones
    const failed = results.filter(r => !r.success).map(r => r.tool);
    if (failed.length > 0 && CONFIG.retryAttempts > 0) {
      for (let attempt = 1; attempt <= CONFIG.retryAttempts; attempt++) {
        console.log(`\n🔄 Retry attempt ${attempt}/${CONFIG.retryAttempts}`);
        const retryResults = await retryFailed(browser, failed);
        
        // Update results with retry outcomes
        for (const result of retryResults) {
          const idx = results.findIndex(r => r.tool === result.tool);
          if (idx !== -1 && result.success) {
            results[idx] = result;
          }
        }
        
        // Check if all succeeded
        const stillFailed = results.filter(r => !r.success);
        if (stillFailed.length === 0) break;
      }
    }
    
    // Generate report
    const report = generateReport(results);
    
    // Cleanup old files
    await cleanupOld();
    
    // Clean up temp directory
    await fs.rm(CONFIG.tempDir, { recursive: true, force: true }).catch(() => {});
    
    console.log('\n✅ Screenshot automation complete!');
    
    // Exit with error code if there were failures
    if (report.failed > 0) {
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main, TOOLS, CONFIG };
