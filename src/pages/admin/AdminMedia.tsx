import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminMedia = () => {
  const [files, setFiles] = useState<{ name: string; url: string; size: number }[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const newFiles = selected.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      size: f.size,
    }));
    setFiles([...files, ...newFiles]);
    toast({ title: `${selected.length} file(s) uploaded` });
  };

  const handleDelete = (index: number) => {
    URL.revokeObjectURL(files[index].url);
    setFiles(files.filter((_, i) => i !== index));
    toast({ title: "File removed" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media</h1>
          <p className="text-muted-foreground">Upload and manage files</p>
        </div>
        <div className="relative">
          <input type="file" multiple onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,.pdf,.svg" />
          <Button><Upload className="w-4 h-4 mr-2" /> Upload Files</Button>
        </div>
      </div>

      {files.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No files uploaded yet. Upload images or documents to use across the site.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file, idx) => (
            <Card key={idx} className="overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center">
                {file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(idx)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
