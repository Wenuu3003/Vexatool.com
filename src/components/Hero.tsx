export const Hero = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in">
          Every tool you need to work with PDFs
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks. 
          All tools are free and easy to use!
        </p>
      </div>
    </section>
  );
};
