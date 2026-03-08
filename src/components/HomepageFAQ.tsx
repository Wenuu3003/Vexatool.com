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
      "VexaTool offers free PDF tools including: PDF editing (merge, split, compress, convert, rotate, protect, sign, watermark, unlock), PDF converters (PDF to Excel, PDF to Word, Word to PDF, Image to PDF), image tools (compress, resize, background removal), QR code generator, and calculators (EMI, BMI, percentage calculator).",
  },
  {
    question: "Can I use VexaTool on my mobile phone?",
    answer:
      "Yes! All tools are fully responsive and work perfectly on smartphones, tablets, and desktop computers. No app installation needed — just open vexatool.com in your mobile browser.",
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
              Everything you need to know about VexaTool
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
