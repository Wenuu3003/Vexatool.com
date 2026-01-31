import { lazy, Suspense } from "react";

// Lazy load gallery components for better initial load
const ToolsGallery = lazy(() => 
  import("./gallery").then(m => ({ default: m.ToolsGallery }))
);
const ToolsSchemaMarkup = lazy(() => 
  import("./gallery").then(m => ({ default: m.ToolsSchemaMarkup }))
);

/**
 * ToolsGrid - Main tools display component for the homepage
 * 
 * Features:
 * - Modern card design with preview images
 * - Search and category filtering
 * - Lazy loading for performance
 * - SEO schema markup
 * - Responsive grid layout
 */
export const ToolsGrid = () => {
  return (
    <>
      <Suspense fallback={null}>
        <ToolsSchemaMarkup />
      </Suspense>
      <Suspense fallback={
        <section className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <div className="h-10 w-64 mx-auto rounded-lg bg-muted animate-pulse" />
              <div className="h-6 w-96 mx-auto mt-4 rounded-lg bg-muted animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      }>
        <ToolsGallery 
          showSearch={true} 
          showFilters={true} 
          gridColumns="4"
        />
      </Suspense>
    </>
  );
};