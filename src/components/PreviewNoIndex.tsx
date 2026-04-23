import { Helmet } from "react-helmet";

/**
 * Emits <meta name="robots" content="noindex, nofollow"> on any host
 * that is NOT the canonical production domain (vexatool.com).
 * This prevents Lovable preview URLs, the .lovable.app published mirror,
 * and any www. variant from being indexed by Google/Bing — eliminating
 * duplicate-content signals and protecting AdSense approval.
 */
export const PreviewNoIndex = () => {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname.toLowerCase();
  const isCanonical = host === "vexatool.com";
  if (isCanonical) return null;

  return (
    <Helmet>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="googlebot" content="noindex, nofollow" />
    </Helmet>
  );
};

export default PreviewNoIndex;