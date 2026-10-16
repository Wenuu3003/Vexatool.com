import { useEffect, useRef, useState } from 'react';
import { Lock, Download, Eye, EyeOff } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CanonicalHead } from '@/components/CanonicalHead';
import ToolSEOContent from '@/components/ToolSEOContent';
import { MAX_PDF_BYTES, passwordError } from '@/lib/pdf-protection/encrypt';
import { protectPdf } from '@/lib/pdf-protection/client';

export default function ProtectPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);
  const operation = useRef<AbortController | null>(null);
  const downloadUrl = useRef<string | null>(null);
  useEffect(() => () => { operation.current?.abort(); if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current); }, []);
  const clearResult = () => {
    if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
    downloadUrl.current = null;
    setResult(null);
  };
  const run = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    clearResult();
    setError('');
    const file = files[0];
    const invalid = passwordError(password);
    if (!file || files.length !== 1) return setError('Choose one PDF.');
    if (file.size > MAX_PDF_BYTES || !file.size) return setError('Choose a PDF up to 25 MB.');
    if (invalid) return setError(invalid);
    if (password !== confirmation) return setError('Passwords do not match exactly.');
    const controller = new AbortController();
    operation.current = controller;
    setBusy(true);
    try {
      const bytes = await protectPdf(new Uint8Array(await file.arrayBuffer()), password, controller.signal);
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }));
      downloadUrl.current = url;
      setResult({ url, name: `protected_${file.name}` });
      setPassword(''); setConfirmation(''); setVisible(false);
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Encryption failed.');
    } finally {
      if (operation.current === controller) { operation.current = null; setBusy(false); }
    }
  };
  return <>
    <CanonicalHead title="Protect PDF with AES-256 Password Encryption | VexaTool" description="Encrypt an unencrypted PDF with a password in your browser. Up to 25 MB; no document upload required for encryption." keywords="protect PDF, encrypt PDF, password PDF" />
    <ToolLayout title="Protect PDF" description="Add a password required to open your PDF" icon={Lock} colorClass="bg-tool-protect">
      <div className="mx-auto max-w-xl space-y-6">
        <p className="rounded-lg border bg-muted/40 p-4 text-sm">AES-256 encryption runs on your device. Choose one unencrypted PDF up to 25 MB. Keep your original file: encryption changes the file and can invalidate digital signatures.</p>
        <form onSubmit={run} className="space-y-5">
          <fieldset disabled={busy} className="space-y-5 min-w-0">
            <FileUpload files={files} onFilesChange={(next) => { setFiles(next.slice(0, 1)); clearResult(); setError(''); }} colorClass="bg-tool-protect" />
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="flex gap-2">
                <Input id="password" autoComplete="new-password" type={visible ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); clearResult(); }} aria-describedby="password-help" />
                <Button type="button" variant="outline" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide passwords' : 'Show passwords'}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</Button>
              </div>
              <p id="password-help" className="text-xs text-muted-foreground">Use a long, unique password (at least 8 characters, at most 127 UTF-8 bytes). Spaces are preserved exactly. Store it safely; this tool cannot recover it.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" autoComplete="new-password" type={visible ? 'text' : 'password'} value={confirmation} onChange={e => { setConfirmation(e.target.value); clearResult(); }} />
              {confirmation && password !== confirmation && <p className="text-sm text-destructive">Passwords do not match exactly.</p>}
            </div>
            <Button type="submit" className="w-full gap-2" disabled={!files.length || !!passwordError(password) || password !== confirmation}><Lock size={18} />{busy ? 'Encrypting…' : 'Encrypt PDF'}</Button>
          </fieldset>
          {busy && <Button type="button" variant="outline" onClick={() => { operation.current?.abort(); setError('Protection cancelled. No output was downloaded.'); }}>Cancel</Button>}
        </form>
        {error && <p role="alert" className="rounded-lg border border-destructive p-4 text-sm text-destructive">{error}</p>}
        {result && <div role="status" className="space-y-3 rounded-lg border p-4">
          <p className="font-medium">Your encrypted PDF is ready.</p>
          <p className="text-sm text-muted-foreground">Open the downloaded file in a PDF reader and check it with your password before sharing. Send the password separately.</p>
          <Button asChild className="w-full gap-2"><a href={result.url} download={result.name}><Download size={18} />Download encrypted PDF</a></Button>
        </div>}
      </div>
      <ToolSEOContent toolName="Protect PDF" whatIs="Encrypt an existing PDF with AES-256 so a compatible PDF reader requires your password to open it. The encryption engine runs in a browser worker; the document and password are not sent to a server by this operation. Encryption strength also depends on your password and the security of your device." howToUse={['Select one valid, unencrypted PDF up to 25 MB.', 'Enter and confirm a long, unique password. Spaces count exactly.', 'Choose Encrypt PDF and then download the result.', 'Check the downloaded document in a PDF reader. Share the password separately.']} features={['AES-256 password encryption using qpdf.', 'Processing in a browser worker.', 'Download only after successful encryption.', 'Cancel processing at any time.']} safetyNote="Keep your original. Rewriting a digitally signed PDF can invalidate signatures. Already encrypted files are not supported. No recovery service is provided; save your password securely. Very complex documents may exceed your device’s memory or the processing time limit." faqs={[
        { question: 'Which files are supported?', answer: 'One valid, unencrypted PDF up to 25 MB. Corrupt, empty and already encrypted documents are rejected. A small but complex file may still exceed device resources.' },
        { question: 'Does this prevent copying after opening?', answer: 'No. The password controls opening the document; this tool does not impose printing or copying restrictions once it is opened.' },
        { question: 'Will every reader open it?', answer: 'Use a reader that supports AES-256 PDF encryption. Older readers may not. Check the output before sharing.' },
        { question: 'Are files uploaded for encryption?', answer: 'This operation processes PDF bytes and passwords locally. The browser downloads the engine assets; it does not upload the document for encryption.' }
      ]} />
    </ToolLayout>
  </>;
}
