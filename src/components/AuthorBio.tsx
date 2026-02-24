import { User } from "lucide-react";

interface AuthorBioProps {
  name?: string;
  title?: string;
  bio?: string;
}

export const AuthorBio = ({
  name = "VexaTool Editorial Team",
  title = "Digital Tools Specialist & PDF Workflow Expert",
  bio = "With over a decade of experience in document management, workflow automation, and online productivity tools, our editorial team has helped thousands of users simplify their document workflows. From guiding students through competitive exam applications to advising businesses on secure document handling, we focus on practical solutions that save time and protect privacy. Our expertise spans PDF processing, image optimization, digital signatures, and browser-based tool development. Every guide we publish is tested, verified, and written to help real people solve real problems — without unnecessary jargon or filler."
}: AuthorBioProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 mt-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-base mb-1">{name}</h3>
          <p className="text-sm text-primary mb-2">{title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
        </div>
      </div>
    </div>
  );
};
