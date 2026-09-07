/**
 * Internal-link registry for the published programmatic SEO pages.
 *
 * These pages live at flat `/:slug` routes and are rendered by
 * ProgrammaticSEOPage from the database. This file is the single place that
 * gives them inbound internal links from the normal site navigation
 * (category pages, All Tools, and their parent tools) so crawlers can reach
 * them without relying on the sitemap alone.
 *
 * Keep slugs in sync with the published rows in `programmatic_seo_pages`.
 */

export interface SizeGuideLink {
  href: string;
  label: string;
  desc: string;
}

export interface SizeGuideGroup {
  id: "pdfSizes" | "imageSizes" | "photoGuides" | "formGuides";
  heading: string;
  intro: string;
  links: SizeGuideLink[];
}

export const pdfSizeGuides: SizeGuideGroup = {
  id: "pdfSizes",
  heading: "Popular PDF Size Targets",
  intro:
    "Upload portals often cap PDF uploads at a fixed size. These guides walk through hitting each target without making the document unreadable.",
  links: [
    { href: "/compress-pdf-to-50kb", label: "Compress PDF to 50 KB", desc: "The tightest common upload cap, for short single-page documents." },
    { href: "/compress-pdf-to-100kb", label: "Compress PDF to 100 KB", desc: "A frequent limit on application forms and ID proof uploads." },
    { href: "/compress-pdf-to-150kb", label: "Compress PDF to 150 KB", desc: "Comfortable for two to four page scanned documents." },
    { href: "/compress-pdf-to-200kb", label: "Compress PDF to 200 KB", desc: "Room for legible scans of multi-page certificates." },
    { href: "/compress-pdf-to-300kb", label: "Compress PDF to 300 KB", desc: "Keeps photos inside a PDF reasonably sharp." },
    { href: "/compress-pdf-to-500kb", label: "Compress PDF to 500 KB", desc: "A relaxed limit that preserves most image detail." },
    { href: "/compress-pdf-to-1mb", label: "Compress PDF to 1 MB", desc: "For long reports and portfolios with many images." },
  ],
};

export const formGuides: SizeGuideGroup = {
  id: "formGuides",
  heading: "Document Preparation Guides",
  intro: "Step-by-step help for putting together the file formats specific forms ask for.",
  links: [
    { href: "/jpg-to-pdf-for-sbi-form", label: "JPG to PDF for a Bank Form", desc: "Combine photographed pages into one clean PDF for a bank submission." },
  ],
};

export const imageSizeGuides: SizeGuideGroup = {
  id: "imageSizes",
  heading: "Popular Image Size Targets",
  intro:
    "When a form states an exact kilobyte limit, these guides explain how to reach it while keeping the picture usable.",
  links: [
    { href: "/compress-image-to-50kb", label: "Compress Image to 50 KB", desc: "A common ceiling for photographs on application forms." },
    { href: "/compress-jpeg-to-20kb", label: "Compress JPEG to 20 KB", desc: "Very tight target used for signatures and small portraits." },
    { href: "/compress-jpeg-to-100kb", label: "Compress JPEG to 100 KB", desc: "Enough headroom for a detailed colour photograph." },
    { href: "/resize-image-to-20kb", label: "Resize Image to 20 KB", desc: "Reduce dimensions first, then compress, to hit a tiny limit." },
    { href: "/resize-image-to-50kb", label: "Resize Image to 50 KB", desc: "Balance pixel dimensions and quality for a 50 KB cap." },
  ],
};

export const photoGuides: SizeGuideGroup = {
  id: "photoGuides",
  heading: "Photo Size Guides",
  intro:
    "Each guide covers the photo dimensions and file size a particular application asks for, and how to prepare an image that fits.",
  links: [
    { href: "/passport-size-photo-maker-online", label: "Passport Size Photo Maker", desc: "Create a standard passport-style photo from an ordinary picture." },
    { href: "/resize-photo-for-aadhaar-20kb", label: "Aadhaar Photo (20 KB)", desc: "Prepare a portrait small enough for Aadhaar-related uploads." },
    { href: "/pan-card-photo-resizer", label: "PAN Card Photo Resizer", desc: "Match the photo dimensions used on PAN applications." },
    { href: "/voter-id-photo-resizer", label: "Voter ID Photo Resizer", desc: "Resize a portrait for voter registration uploads." },
    { href: "/driving-licence-photo-resizer", label: "Driving Licence Photo Resizer", desc: "Prepare a photo for a driving licence application form." },
    { href: "/neet-photo-resizer", label: "NEET Photo Resizer", desc: "Size a candidate photograph for the NEET application portal." },
    { href: "/upsc-photo-resizer", label: "UPSC Photo Resizer", desc: "Prepare photo and signature files for a UPSC application." },
    { href: "/ssc-cgl-photo-resizer", label: "SSC CGL Photo Resizer", desc: "Resize a photo for the SSC CGL online form." },
    { href: "/ssc-chsl-photo-resizer", label: "SSC CHSL Photo Resizer", desc: "Resize a photo for the SSC CHSL online form." },
    { href: "/rrb-photo-resizer", label: "RRB Photo Resizer", desc: "Prepare a photograph for a railway recruitment application." },
    { href: "/ibps-photo-resizer", label: "IBPS Photo Resizer", desc: "Size photo and signature files for an IBPS bank exam form." },
    { href: "/sbi-po-photo-resizer", label: "SBI PO Photo Resizer", desc: "Prepare an application photograph for the SBI PO portal." },
  ],
};

export const allSizeGuideGroups: SizeGuideGroup[] = [
  pdfSizeGuides,
  imageSizeGuides,
  photoGuides,
  formGuides,
];

/** Every programmatic slug that receives an internal link from this registry. */
export const linkedProgrammaticSlugs: string[] = allSizeGuideGroups.flatMap((g) =>
  g.links.map((l) => l.href.replace(/^\//, ""))
);
