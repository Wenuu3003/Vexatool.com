# Tools Gallery System - Complete Guide

## Overview

This document provides comprehensive documentation for the Mypdfs Tools Gallery system, including setup, SEO optimization, image management, and AI mockup generation.

---

## 📁 Folder Structure

```
project/
├── public/
│   └── previews/                    # Tool preview images
│       ├── merge-pdf-preview.webp
│       ├── compress-pdf-preview.webp
│       ├── edit-pdf-preview.webp
│       └── [tool-id]-preview.webp   # Naming convention
│
├── src/
│   ├── components/
│   │   └── gallery/
│   │       ├── index.ts             # Barrel exports
│   │       ├── ToolPreviewCard.tsx  # Individual tool card
│   │       ├── ToolsGallery.tsx     # Main gallery grid
│   │       ├── LiveToolPreview.tsx  # Iframe preview component
│   │       └── ToolsSchemaMarkup.tsx # SEO structured data
│   │
│   └── data/
│       └── toolsData.ts             # Tool definitions
│
├── scripts/
│   └── screenshot-automation.js     # Puppeteer screenshot script
│
└── docs/
    └── tools-gallery-guide.md       # This file
```

---

## 🖼️ Image Naming Convention (SEO Optimized)

### File Naming Structure

```
[tool-name]-[type]-[variant].webp
```

### Examples:

| Tool | Preview Image | OG Image | Thumbnail |
|------|---------------|----------|-----------|
| PDF Merge | `merge-pdf-preview.webp` | `merge-pdf-og.webp` | `merge-pdf-thumb.webp` |
| Image Resizer | `image-resizer-preview.webp` | `image-resizer-og.webp` | `image-resizer-thumb.webp` |
| Age Calculator | `age-calculator-preview.webp` | `age-calculator-og.webp` | `age-calculator-thumb.webp` |

### Best Practices:
1. **Use lowercase with hyphens** - Never use underscores or spaces
2. **Include tool name** - Primary keyword first
3. **Use descriptive suffixes** - `-preview`, `-screenshot`, `-mockup`
4. **Use WebP format** - 30-50% smaller than JPEG
5. **Dimensions**: 640x400px for gallery, 1200x630px for OG images

---

## 🎨 AI Prompts for Tool Mockups

### PDF Tools

```
Modern web application interface for PDF merge tool, showing clean dashboard 
with file upload area, drag-and-drop zone, merge button, blue and white 
color scheme, flat design, realistic browser mockup, 4K resolution, 
professional SaaS UI, minimal shadows, rounded corners
```

```
PDF compression web tool interface, showing file size reduction progress bar, 
before/after comparison, green success indicators, modern flat design, 
clean SaaS dashboard, realistic browser frame, white background with 
subtle gradients
```

```
Professional PDF editor web interface with toolbar showing text, shapes, 
and signature tools, document preview area, purple accent colors, 
modern flat UI design, realistic browser mockup, minimal and clean
```

### Calculator Tools

```
Birthday and age calculator web application, colorful and friendly design, 
calendar icon, cake celebration graphics, countdown timer display, 
modern flat dashboard, gradient backgrounds, fun but professional UI
```

```
Love compatibility calculator web tool, romantic pink and red theme, 
heart icons, percentage meter, zodiac symbols, modern glassmorphism 
effect, clean SaaS interface, playful yet professional
```

```
Financial EMI calculator web interface, showing loan amount slider, 
interest rate inputs, monthly payment display, pie chart breakdown, 
green money theme, professional banking UI, clean modern design
```

### Utility Tools

```
QR code generator web application showing customization options, 
color picker, logo upload area, generated QR preview, modern tech 
theme, dark mode support, clean flat design, realistic browser mockup
```

```
Image background remover tool interface, showing before/after comparison, 
AI processing indicator, transparent checkered background, purple 
gradient accents, modern web application design, professional UI
```

### AI Tools

```
AI text generator dashboard with prompt input area, tone selector, 
word count display, generated content preview, futuristic gradient 
theme, neural network visualization, modern SaaS interface, 
professional and clean
```

---

## ⚡ Performance Optimization

### Image Optimization

1. **Use WebP format** - 30-50% smaller than JPEG
2. **Lazy loading** - Load images only when visible
3. **Responsive images** - Use srcset for different screen sizes
4. **CDN delivery** - Serve from edge locations

### Implementation:

```jsx
// Lazy loading with IntersectionObserver
<img
  src={isVisible ? imageSrc : undefined}
  loading="lazy"
  decoding="async"
  alt="Descriptive alt text with keywords"
/>
```

### CDN Setup (Cloudflare):

```
# _headers file
/previews/*
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: image/webp
```

### Image Compression Targets:

| Type | Max Size | Dimensions |
|------|----------|------------|
| Gallery Preview | 50KB | 640x400 |
| OG Image | 100KB | 1200x630 |
| Thumbnail | 20KB | 320x200 |

---

## 🔍 SEO Implementation

### Structured Data (Schema.org)

The `ToolsSchemaMarkup` component implements:

- **ItemList** - Collection of all tools
- **SoftwareApplication** - Individual tool schema
- **BreadcrumbList** - Navigation hierarchy
- **FAQPage** - Common questions
- **Organization** - Website owner info

### Alt Text Guidelines:

```
✅ Good: "PDF Merge Tool - Combine multiple PDF files online free"
✅ Good: "Age Calculator interface showing birthday countdown timer"

❌ Bad: "tool-screenshot.png"
❌ Bad: "Image 1"
```

### Meta Tags Template:

```html
<title>{Tool Name} - Free Online {Category} Tool | Mypdfs</title>
<meta name="description" content="{Tool description in 150-160 chars}" />
<meta name="keywords" content="{keyword1}, {keyword2}, {keyword3}" />
<link rel="canonical" href="https://mypdfs.in/{tool-path}" />
```

---

## 📸 Screenshot Automation

### Setup

```bash
# Install dependencies
npm install puppeteer sharp

# Run manually
node scripts/screenshot-automation.js

# Setup cron job (daily at 3 AM)
crontab -e
0 3 * * * cd /path/to/project && node scripts/screenshot-automation.js >> /var/log/screenshots.log 2>&1
```

### Configuration:

```javascript
const CONFIG = {
  baseUrl: 'https://mypdfs.in',
  outputDir: './public/previews',
  viewport: { width: 1280, height: 800 },
  thumbnailSize: { width: 640, height: 400 },
  quality: 85,
  concurrency: 3
};
```

### GitHub Actions (Alternative):

```yaml
name: Update Screenshots
on:
  schedule:
    - cron: '0 3 * * *'
  workflow_dispatch:

jobs:
  screenshots:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install puppeteer sharp
      - run: node scripts/screenshot-automation.js
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "Update tool preview screenshots"
```

---

## 🎯 AdSense Compliance

### Safe Design Patterns:

1. **Clear button labels** - No deceptive "Download" buttons
2. **Distinct ad styling** - Ads clearly separated from content
3. **No accidental clicks** - Adequate spacing around ads
4. **Content-first layout** - Tools visible above the fold
5. **Mobile-friendly** - Touch targets 48px minimum

### Layout Guidelines:

```
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ Tool Content (Primary)              │
│                                     │
├─────────────────────────────────────┤
│ Ad Unit (Clearly labeled)           │
├─────────────────────────────────────┤
│ Related Tools                       │
└─────────────────────────────────────┘
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
.tools-grid {
  grid-template-columns: 1fr;              /* Mobile */
}

@media (min-width: 640px) {
  .tools-grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet */
  }
}

@media (min-width: 1024px) {
  .tools-grid {
    grid-template-columns: repeat(3, 1fr); /* Desktop */
  }
}

@media (min-width: 1280px) {
  .tools-grid {
    grid-template-columns: repeat(4, 1fr); /* Large */
  }
}
```

---

## 🚀 Quick Start

1. **Import the gallery:**
   ```tsx
   import { ToolsGallery, ToolsSchemaMarkup } from "@/components/gallery";
   ```

2. **Add to page:**
   ```tsx
   <ToolsSchemaMarkup />
   <ToolsGallery showSearch showFilters />
   ```

3. **Generate screenshots:**
   ```bash
   node scripts/screenshot-automation.js
   ```

4. **Verify SEO:**
   - Test structured data: https://validator.schema.org/
   - Check page speed: https://pagespeed.web.dev/

---

## 📊 Monitoring

### Key Metrics:
- **LCP** (Largest Contentful Paint) < 2.5s
- **Image size** < 50KB average
- **Schema validation** - No errors
- **Mobile usability** - 100% score

### Tools:
- Google Search Console
- Google PageSpeed Insights
- Schema Markup Validator
- Lighthouse
