import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Helmet } from "react-helmet";

const faqs = [
  {
    question: "Is VexaTool really free to use?",
    answer:
      "VexaTool provides free tools without an account. File-size limits, supported formats and processing requirements vary by tool; check the instructions before starting.",
  },
  {
    question: "Are my files safe and private on VexaTool?",
    answer:
      "Most document and image operations run locally in your browser. Some features contact external services for models, exchange rates or postal lookups. Advertising and analytics may also make network requests; see the Privacy Policy before handling sensitive information.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "Core tools do not require a VexaTool account. Exporting a private Google document may require signing in to Google with permission to access that document.",
  },
  {
    question: "What PDF tools does VexaTool offer?",
    answer:
      "PDF tools include merging, splitting, rotation, password encryption, image conversion, editing, signing and page organization. Conversion support and output formats are explained on each tool page.",
  },
  {
    question: "Can I use VexaTool on my mobile phone?",
    answer:
      "The interface adapts to mobile and desktop screens. Browser support, available memory and file complexity affect processing; large documents may work better on a desktop.",
  },
  {
    question: "How does VexaTool process files without uploading them?",
    answer:
      "Local file tools use JavaScript, WebAssembly and browser APIs to read and transform a selected file. Other features may require network access; local file processing does not mean the whole website works offline.",
  },
  {
    question: "What image tools are available?",
    answer:
      "Image tools include resizing, compression, JPG/PNG/WebP conversion and background removal. Lossy compression can reduce image quality. Check the receiving portal requirements before using a photo preset.",
  },
  {
    question: "Can I convert PDF to Excel while preserving table formatting?",
    answer:
      "PDF-to-Excel results depend on the source document. Complex tables, merged cells and scanned pages may not convert accurately. Compare the downloaded sheet with the original and correct missing or misplaced values.",
  },
  {
    question: "Is VexaTool safe for sensitive business documents?",
    answer:
      "Check your organization’s handling rules and the tool’s documented behavior first. HTTPS protects data in transit but is not a guarantee of confidentiality or compliance. Review the Privacy Policy and avoid processing restricted documents without authorization.",
  },
  {
    question: "How does VexaTool compare to paid tools like Adobe Acrobat?",
    answer:
      "VexaTool supports common browser-based tasks. Complex layout conversion, certificate-based digital signatures and other specialized workflows may need dedicated software. A drawn signature is not a certificate-based signature.",
  },
  {
    question: "What calculators are available on VexaTool?",
    answer:
      "Calculators include EMI, BMI, GST, percentages, age and currency conversion. Results are estimates or mathematical calculations, not medical, tax or financial advice. Currency rates depend on the external provider and its update time.",
  },
  {
    question: "Does VexaTool add watermarks to processed files?",
    answer:
      "Conversion tools do not intentionally add VexaTool branding to output files. The Watermark PDF tool adds the text or image you choose. Always inspect the downloaded result.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export const HomepageFAQ = () => {
  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <section className="py-16 sm:py-20 md:py-24 bg-muted/30 border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-foreground tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Everything you need to know about VexaTool's free online tools
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-2.5 sm:space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="bg-card border border-border/60 rounded-xl px-4 sm:px-5 shadow-sm"
                >
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline py-3.5 sm:py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
};
