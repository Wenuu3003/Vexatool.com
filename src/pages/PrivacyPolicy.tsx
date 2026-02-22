import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalHead } from "@/components/CanonicalHead";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <CanonicalHead
        title="Privacy Policy | VexaTool - Data Protection & Security"
        description="Read VexaTool's Privacy Policy. Learn how we handle your data, protect your privacy, and manage uploaded files securely."
        keywords="privacy policy, data protection, file security, VexaTool privacy, GDPR"
      />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 2026</p>
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">Welcome to VexaTool. We are committed to protecting your privacy and ensuring the security of any information you share with us. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and online tools.</p>
            <p className="text-muted-foreground leading-relaxed mt-4">VexaTool provides free online tools for PDF manipulation, image conversion, calculators, QR codes, and other utilities. Our goal is to offer convenient, secure, and user-friendly services without compromising your privacy.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">We collect minimal information necessary to provide and improve our services:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Usage Data:</strong> Anonymous information about how you interact with our website, including pages visited and tools used.</li>
              <li><strong>Uploaded Files:</strong> Files are processed temporarily to provide the requested service. Most processing occurs in your browser.</li>
              <li><strong>Device Information:</strong> Basic device information such as browser type and screen resolution to optimize your experience.</li>
              <li><strong>Account Information:</strong> If you create an account, we collect your email address and any profile information you provide.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To provide and operate our online tools and services</li>
              <li>To process your uploaded files and deliver the requested output</li>
              <li>To improve website functionality and user experience</li>
              <li>To analyze usage patterns and optimize performance</li>
              <li>To respond to your inquiries or support requests</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">File Handling Policy</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Client-Side Processing:</strong> Many tools process files directly in your browser. Your files never leave your device.</li>
              <li><strong>No File Storage:</strong> We do not store your files permanently. Files are deleted immediately after processing.</li>
              <li><strong>No File Sharing:</strong> We do not share, sell, or distribute your uploaded files to any third parties.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies and Analytics</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Essential Cookies:</strong> Required for basic website functionality and security.</li>
              <li><strong>Analytics Cookies:</strong> We may use Google Analytics to understand how visitors interact with our website.</li>
              <li><strong>Advertising Cookies:</strong> We may display advertisements through Google AdSense. These cookies help show relevant ads.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">You can manage cookie preferences through your browser settings.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Services</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Google Analytics:</strong> For website traffic analysis.</li>
              <li><strong>Google AdSense:</strong> For displaying advertisements on our website.</li>
              <li><strong>Hosting Providers:</strong> To host and deliver our website securely.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Secure HTTPS encryption for all data transmission</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to personal data by authorized personnel only</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Request access to your personal data</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">If you have questions about this Privacy Policy, please contact us at:</p>
            <ul className="list-none mt-4 space-y-2 text-muted-foreground">
              <li><strong>Website:</strong> vexatool.com</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
