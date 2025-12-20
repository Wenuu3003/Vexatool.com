import {
  Layers,
  Scissors,
  FileDown,
  FileType2,
  FileEdit,
  PenTool,
  Droplets,
  RotateCw,
  Unlock,
  Lock,
  LayoutGrid,
  Wrench,
} from "lucide-react";
import { ToolCard } from "./ToolCard";

const tools = [
  {
    title: "Merge PDF",
    description: "Combine PDFs in the order you want with the easiest PDF merger available.",
    icon: Layers,
    colorClass: "bg-tool-merge",
  },
  {
    title: "Split PDF",
    description: "Separate one page or a whole set for easy conversion into independent PDF files.",
    icon: Scissors,
    colorClass: "bg-tool-split",
  },
  {
    title: "Compress PDF",
    description: "Reduce file size while optimizing for maximal PDF quality.",
    icon: FileDown,
    colorClass: "bg-tool-compress",
  },
  {
    title: "PDF to Word",
    description: "Easily convert your PDF files into easy to edit DOC and DOCX documents.",
    icon: FileType2,
    colorClass: "bg-tool-convert",
  },
  {
    title: "Edit PDF",
    description: "Add text, images, shapes or freehand annotations to a PDF document.",
    icon: FileEdit,
    colorClass: "bg-tool-edit",
  },
  {
    title: "Sign PDF",
    description: "Sign yourself or request electronic signatures from others.",
    icon: PenTool,
    colorClass: "bg-tool-sign",
  },
  {
    title: "Watermark",
    description: "Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.",
    icon: Droplets,
    colorClass: "bg-tool-watermark",
  },
  {
    title: "Rotate PDF",
    description: "Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!",
    icon: RotateCw,
    colorClass: "bg-tool-rotate",
  },
  {
    title: "Unlock PDF",
    description: "Remove PDF password security, giving you the freedom to use your PDFs as you want.",
    icon: Unlock,
    colorClass: "bg-tool-unlock",
  },
  {
    title: "Protect PDF",
    description: "Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.",
    icon: Lock,
    colorClass: "bg-tool-protect",
  },
  {
    title: "Organize PDF",
    description: "Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages.",
    icon: LayoutGrid,
    colorClass: "bg-tool-organize",
  },
  {
    title: "Repair PDF",
    description: "Repair a damaged PDF and recover data from corrupt PDF. Fix PDF files.",
    icon: Wrench,
    colorClass: "bg-tool-repair",
  },
];

export const ToolsGrid = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <div
              key={tool.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ToolCard {...tool} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
