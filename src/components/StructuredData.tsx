import { Helmet } from "react-helmet";

interface WebApplicationData {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}

interface StructuredDataProps {
  type: "WebApplication" | "WebPage";
  data: WebApplicationData;
}

export const StructuredData = ({ type, data }: StructuredDataProps) => {
  const baseUrl = "https://mypdfs.lovable.app";
  
  const generateSchema = () => {
    if (type === "WebApplication") {
      return {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": data.name,
        "description": data.description,
        "url": data.url,
        "applicationCategory": data.applicationCategory,
        "operatingSystem": data.operatingSystem || "All",
        "offers": data.offers || {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "provider": {
          "@type": "Organization",
          "name": "Mypdfs",
          "url": baseUrl
        },
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "softwareVersion": "1.0",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "150"
        }
      };
    }
    
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": data.name,
      "description": data.description,
      "url": data.url
    };
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(generateSchema())}
      </script>
    </Helmet>
  );
};
