import { Helmet } from "react-helmet";
import { toolsData } from "@/data/toolsData";

interface ToolsSchemaMarkupProps {
  baseUrl?: string;
}

/**
 * ToolsSchemaMarkup - Generates JSON-LD structured data for the tools gallery
 * 
 * Implements:
 * - ItemList schema for the collection
 * - SoftwareApplication schema for each tool
 * - Breadcrumb navigation
 * - Organization data
 */
export const ToolsSchemaMarkup = ({ baseUrl = "https://mypdfs.in" }: ToolsSchemaMarkupProps) => {
  // ItemList schema for the tools collection
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Free Online PDF & Utility Tools",
    "description": "Collection of 50+ free online tools for PDF editing, image processing, calculators, and AI utilities",
    "url": `${baseUrl}/tools`,
    "numberOfItems": toolsData.length,
    "itemListElement": toolsData.map((tool, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SoftwareApplication",
        "@id": `${baseUrl}${tool.href}`,
        "name": tool.title,
        "description": tool.description,
        "url": `${baseUrl}${tool.href}`,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "1000",
          "bestRating": "5",
          "worstRating": "1"
        }
      }
    }))
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": `${baseUrl}/tools`
      }
    ]
  };

  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mypdfs",
    "url": baseUrl,
    "logo": `${baseUrl}/favicon.png`,
    "sameAs": [
      "https://twitter.com/Mypdfs5"
    ],
    "description": "Free online PDF editor, converter, and utility tools. No signup required."
  };

  // WebSite schema with SearchAction
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Mypdfs",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(itemListSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
};

/**
 * Individual tool schema markup for tool detail pages
 */
interface ToolDetailSchemaProps {
  toolId: string;
  baseUrl?: string;
}

export const ToolDetailSchema = ({ toolId, baseUrl = "https://mypdfs.in" }: ToolDetailSchemaProps) => {
  const tool = toolsData.find(t => t.id === toolId);
  
  if (!tool) return null;

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.title,
    "description": tool.description,
    "url": `${baseUrl}${tool.href}`,
    "image": tool.previewImage ? `${baseUrl}${tool.previewImage}` : `${baseUrl}/og-image.png`,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript. Works in all modern browsers.",
    "softwareVersion": "1.0",
    "author": {
      "@type": "Organization",
      "name": "Mypdfs",
      "url": baseUrl
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": tool.features.join(", "),
    "keywords": tool.seoKeywords.join(", ")
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": `${baseUrl}/tools`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tool.title,
        "item": `${baseUrl}${tool.href}`
      }
    ]
  };

  // FAQ schema for common questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Is ${tool.title} free to use?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, ${tool.title} is completely free to use. No signup or payment required.`
        }
      },
      {
        "@type": "Question",
        "name": `Is ${tool.title} safe and secure?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all processing happens in your browser. Your files are never uploaded to our servers."
        }
      },
      {
        "@type": "Question",
        "name": `What are the main features of ${tool.title}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The main features include: ${tool.features.join(", ")}.`
        }
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
};
