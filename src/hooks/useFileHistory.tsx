import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useFileHistory = () => {
  const { user } = useAuth();

  const saveFileHistory = async (fileName: string, fileType: string, toolUsed: string) => {
    if (!user) return;

    try {
      await supabase.from('user_files').insert({
        user_id: user.id,
        file_name: fileName,
        file_type: fileType,
        tool_used: toolUsed,
      });
    } catch (error) {
      console.error('Error saving file history:', error);
    }
  };

  return { saveFileHistory };
};
import { PDFDocument } from "pdf-lib";
import fs from "fs";

export const imageToPDF = async (req, res) => {
  const pdf = await PDFDocument.create();

  for (const file of req.files) {
    const imgBytes = fs.readFileSync(file.path);
    const img = await pdf.embedJpg(imgBytes);
    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0 });
    fs.unlinkSync(file.path);
  }

  const output = `uploads/images_${Date.now()}.pdf`;
  fs.writeFileSync(output, await pdf.save());

  res.download(output, () => fs.unlinkSync(output));
};
