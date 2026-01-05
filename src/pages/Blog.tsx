import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image?: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: "how-to-merge-pdfs-complete-guide",
    title: "How to Merge PDFs: Complete Guide to Combining PDF Files",
    excerpt: "Learn how to combine multiple PDF files into one document easily. Step-by-step guide with tips for merging PDFs online without losing quality.",
    date: "2026-01-05",
    readTime: "6 min read",
  },
  {
    slug: "best-image-compression-tips",
    title: "Best Image Compression Tips: Reduce File Size Without Losing Quality",
    excerpt: "Master image compression with expert tips. Learn the best techniques to reduce image file sizes while maintaining visual quality for web and print.",
    date: "2026-01-04",
    readTime: "7 min read",
  },
  {
    slug: "pdf-security-guide",
    title: "PDF Security Guide: How to Protect Your Documents",
    excerpt: "Complete guide to PDF security. Learn how to password protect, encrypt, and secure your PDF documents from unauthorized access and modifications.",
    date: "2026-01-04",
    readTime: "8 min read",
  },
  {
    slug: "compress-pdf-without-losing-quality",
    title: "How to Compress PDF Without Losing Quality (Free & Online)",
    excerpt: "Learn the best techniques to reduce PDF file size while maintaining document quality. Discover free online methods and expert tips for efficient PDF compression.",
    date: "2026-01-03",
    readTime: "5 min read",
  },
  {
    slug: "best-free-pdf-tools-online-2026",
    title: "Best Free PDF Tools Online in 2026",
    excerpt: "Discover the top free PDF tools available online in 2026. From compression to conversion, explore the best options for managing your PDF documents efficiently.",
    date: "2026-01-02",
    readTime: "6 min read",
  },
];

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>Blog - PDF Tips, Guides & Tutorials | MyPDFs</title>
        <meta name="description" content="Explore helpful guides, tips, and tutorials about PDF management, compression, conversion, and more. Learn how to work with PDFs efficiently." />
        <meta name="keywords" content="PDF blog, PDF tips, PDF guides, PDF tutorials, document management, PDF tools" />
        <link rel="canonical" href="https://mypdfs.lovable.app/blog" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Blog</h1>
            <p className="text-xl text-muted-foreground mb-12">
              Tips, guides, and tutorials for working with PDFs and documents
            </p>

            <div className="space-y-8">
              {blogPosts.map((post) => (
                <article 
                  key={post.slug}
                  className="border rounded-xl p-6 hover:shadow-lg transition-shadow bg-card"
                >
                  <Link to={`/blog/${post.slug}`}>
                    <h2 className="text-2xl font-semibold mb-3 text-foreground hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <Link 
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    Read More <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
