import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Helmet } from "react-helmet";
const faqs = [{
  question: "Is Mypdfs really free to use?",
  answer: "Yes! All 50+ tools on Mypdfs are completely free with no hidden charges, no premium tiers, and no registration required. We are supported by non-intrusive advertisements."
}, {
  question: "Are my files safe and private?",
  answer: "Absolutely. Most of our tools process files directly in your browser using client-side JavaScript, meaning your files never leave your device. For tools requiring server processing, files are encrypted during transfer and automatically deleted immediately after processing."
}, {
  question: "Do I need to create an account?",
  answer: "No, you don't need to create an account to use any of our tools. Simply visit the tool page, upload your file, and download the result. Account creation is optional and provides additional features like file history."
}, {
  question: "What types of tools does Mypdfs offer?",
  answer: "Mypdfs offers 50+ free tools including: PDF editing (merge, split, compress, convert, rotate, protect), image tools (compress, resize, format convert, background removal), AI-powered tools (chat, text generator, resume builder, grammar checker), calculators (EMI, GST, BMI, age), and utilities (QR code generator/scanner, currency converter, unit converter, PIN code finder)."
}, {
  question: "Can I use Mypdfs tools on mobile devices?",
  answer: "Yes! All our tools are fully responsive and work perfectly on smartphones, tablets, and desktop computers. No app installation needed - just use your web browser."
}, {
  question: "How do I merge multiple PDF files?",
  answer: "Use our Merge PDF tool - upload multiple PDF files, drag to arrange them in your preferred order, then click 'Merge' to combine them into a single PDF. Download your merged document instantly."
}, {
  question: "Can I convert PDF to Word for free?",
  answer: "Yes! Our PDF to Word converter is 100% free. Upload your PDF file, and we'll convert it to an editable Word document (.docx) that preserves the original formatting as much as possible."
}, {
  question: "Is there a file size limit?",
  answer: "There are no artificial file size limits imposed by us. However, very large files may take longer to process depending on your device's capabilities and internet speed. For best results, we recommend files under 100MB."
}];

// Generate FAQPage schema for homepage only
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
export const HomepageFAQ = () => {
  return <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-tool-edit bg-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about using Mypdfs free online tools
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => <AccordionItem key={index} value={`faq-${index}`} className="bg-background border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>)}
            </Accordion>
          </div>
        </div>
      </section>
    </>;
};