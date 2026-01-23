import { Helmet } from "react-helmet";
import { useCanonicalUrl } from "@/hooks/useCanonicalUrl";

interface CanonicalHeadProps {
  title: string;
  description: string;
  keywords?: string;
}

/**
 * Reusable component for adding canonical URLs and SEO meta tags to pages.
 * Uses the production domain (mypdfs.in) for all canonical URLs.
 */
export const CanonicalHead = ({ title, description, keywords }: CanonicalHeadProps) => {
  const canonicalUrl = useCanonicalUrl();
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
    </Helmet>
  );
};
