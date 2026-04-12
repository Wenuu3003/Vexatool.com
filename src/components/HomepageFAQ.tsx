import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Helmet } from "react-helmet";

const faqs = [
  {
    question: "Is VexaTool really free to use?",
    answer:
      "Yes! All tools on VexaTool are completely free with no hidden charges, no premium tiers, and no registration required. Whether you need to merge PDF, compress PDF, convert PDF to Excel, or generate QR codes — everything is free and unlimited.",
  },
  {
    question: "Are my files safe and private on VexaTool?",
    answer:
      "Absolutely. Most tools process files directly in your browser using client-side JavaScript, meaning your files never leave your device. This is especially important for sensitive documents like identification cards, salary slips, and legal agreements. No server uploads needed.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No account, registration, or login is required. Simply visit any tool page, upload your file, and download the result. All tools work without signup — completely anonymous and free.",
  },
  {
    question: "What PDF tools does VexaTool offer?",
    answer:
      "VexaTool offers 20+ free PDF tools including: PDF editing (merge, split, compress, convert, rotate, protect, sign, watermark, unlock), PDF converters (PDF to Excel, PDF to Word, Word to PDF, Image to PDF, PDF to JPG, PDF to PNG), and advanced features like PDF repair and organize.",
  },
  {
    question: "Can I use VexaTool on my mobile phone?",
    answer:
      "Yes! All tools are fully responsive and work perfectly on smartphones, tablets, and desktop computers. No app installation needed — just open vexatool.com in your mobile browser. We specifically test on budget Android devices and slow networks.",
  },
  {
    question: "How does VexaTool process files without uploading them?",
    answer:
      "VexaTool uses modern browser technologies like JavaScript, WebAssembly, and the Canvas API to process files entirely on your device. When you upload a file, it stays in your browser's memory — never sent to any server. This is called client-side processing, and it's the most private way to handle documents online.",
  },
  {
    question: "What image tools are available?",
    answer:
      "VexaTool provides free image tools including: Image Compressor (reduce file size without quality loss), Image Resizer (resize for social media, passports, government forms), Background Remover (AI-powered background removal), Image Format Converter (JPG, PNG, WebP conversion), and specialized photo resizers for Aadhaar, passport, and WhatsApp DP.",
  },
  {
    question: "Can I convert PDF to Excel while preserving table formatting?",
    answer:
      "Yes! Our PDF to Excel converter is designed to accurately detect and preserve table structures, columns, and rows from your PDF documents. The conversion maintains data integrity so you can immediately work with the spreadsheet without manual reformatting.",
  },
  {
    question: "Is VexaTool safe for sensitive business documents?",
    answer:
      "Yes. VexaTool uses 256-bit SSL encryption for all connections and processes files client-side. Your files never leave your device, making it safe for contracts, financial documents, legal agreements, and confidential business files. We store zero user files and share nothing with third parties.",
  },
  {
    question: "How does VexaTool compare to paid tools like Adobe Acrobat?",
    answer:
      "VexaTool offers core PDF operations (merge, split, compress, convert, edit, sign) completely free with no watermarks or daily limits. Paid tools like Adobe Acrobat offer advanced features like OCR and digital certificates, but for everyday document tasks, VexaTool provides professional-quality results at zero cost.",
  },
  {
    question: "What calculators are available on VexaTool?",
    answer:
      "VexaTool offers free calculators including: EMI Calculator (for home, car, and personal loans), BMI Calculator (body mass index with health insights), GST Calculator (CGST, SGST, IGST for Indian businesses), Percentage Calculator, Age Calculator (with shareable birthday cards), Love Calculator, and Currency Converter with live exchange rates.",
  },
  {
    question: "Does VexaTool add watermarks to processed files?",
    answer:
      "Never. VexaTool does not add watermarks, logos, or branding to any file you process. The output is clean and professional — exactly as you'd expect from a paid tool, but completely free.",
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
