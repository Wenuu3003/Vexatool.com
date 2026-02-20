import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Helmet } from "react-helmet";
const faqs = [{
  question: "Is MyPDFs really free to use?",
  answer: "Yes! All 50+ tools on MyPDFs are completely free with no hidden charges, no premium tiers, and no registration required. Whether you need to merge PDF, compress PDF, convert PDF to Excel, or generate QR codes — everything is free and unlimited."
}, {
  question: "Are my files safe and private on MyPDFs?",
  answer: "Absolutely. Most tools process files directly in your browser using client-side JavaScript, meaning your files never leave your device. This is especially important for sensitive Indian documents like Aadhaar cards, PAN cards, salary slips, and legal agreements. No server uploads needed."
}, {
  question: "Do I need to create an account?",
  answer: "No account, registration, or login is required. Simply visit any tool page, upload your file, and download the result. All 50+ tools work without signup — completely anonymous and free."
}, {
  question: "What PDF tools does MyPDFs offer?",
  answer: "MyPDFs offers 50+ free tools including: PDF editing (merge, split, compress, convert, rotate, protect, sign, watermark, unlock), PDF converters (PDF to Excel, PDF to Word, Word to PDF, Image to PDF), image tools (compress, resize, background removal), AI tools (chat, resume builder, grammar checker), QR code generator, and calculators (EMI, GST, BMI, age calculator)."
}, {
  question: "Can I use MyPDFs on my mobile phone?",
  answer: "Yes! All tools are fully responsive and work perfectly on smartphones, tablets, and desktop computers. No app installation needed — just open mypdfs.in in your mobile browser. Optimized for Indian networks and budget devices."
}, {
  question: "How do I merge multiple PDF files online?",
  answer: "Use our free Merge PDF tool — upload up to 20 PDF files, arrange them in your preferred order, then click 'Merge & Download'. Your combined PDF downloads instantly. No signup, no watermarks, completely free."
}, {
  question: "Can I convert PDF to Excel for free?",
  answer: "Yes! Our PDF to Excel converter extracts tables and data from PDF files into editable Excel spreadsheets (.xlsx). It supports batch processing for multiple files. 100% free with no daily limits."
}, {
  question: "Is the PDF editor really free without watermarks?",
  answer: "Yes, our PDF editor is completely free and never adds watermarks to your edited documents. Edit text, add images, insert signatures, and annotate PDFs — all without any branding on the output."
}, {
  question: "Can I generate QR codes for UPI payments?",
  answer: "Yes! Our free QR code generator supports URLs, WhatsApp links, UPI payment links, contact details, and plain text. You can add your brand logo, customize colors, and download in PNG or SVG format."
}, {
  question: "Is there a file size limit?",
  answer: "There are no artificial file size limits. Since processing happens in your browser, performance depends on your device. For best results, we recommend files under 100MB. Our tools work well even on budget smartphones."
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