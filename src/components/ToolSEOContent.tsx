import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RelatedTools } from "@/components/RelatedTools";
import { SocialShare } from "@/components/SocialShare";
import { BacklinkCTA } from "@/components/BacklinkCTA";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";

interface FAQ {
  question: string;
  answer: string;
}

interface ToolSEOContentProps {
  toolName: string;
  whatIs: string;
  howToUse: string[];
  features: string[];
  safetyNote: string;
  faqs: FAQ[];
}

const ToolSEOContent = ({
  toolName,
  whatIs,
  howToUse,
  features,
  safetyNote,
  faqs,
}: ToolSEOContentProps) => {
  const location = useLocation();
  
  // Generate FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      
      {/* Social Share Section */}
      <div className="mt-8">
        <SocialShare title={toolName} />
      </div>
      
      {/* Related Tools Section */}
      <RelatedTools currentPath={location.pathname} className="mb-8 mt-8" />
      
      <section className="mt-12 space-y-8 text-foreground">
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">{toolName} Online – Free & Secure | VexaTool</h2>
          
          {/* What is section */}
          <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
            <h3 className="text-xl font-semibold mb-3">What is {toolName}?</h3>
            <p className="text-muted-foreground leading-relaxed">{whatIs}</p>
          </div>

          {/* How to use section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">How to Use {toolName} Online</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              {howToUse.map((step, index) => (
                <li key={index} className="leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>

          {/* Features section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Key Features & Benefits</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {features.map((feature, index) => (
                <li key={index} className="leading-relaxed">{feature}</li>
              ))}
            </ul>
          </div>

          {/* Safety section */}
          <div className="mb-6 bg-muted/30 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-3">Is It Safe to Use This Tool?</h3>
            <p className="text-muted-foreground leading-relaxed">{safetyNote}</p>
          </div>

          {/* FAQs section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Backlink CTA Section */}
          <BacklinkCTA currentTool={toolName} />
        </div>
      </section>
    </>
  );
};

export default ToolSEOContent;
