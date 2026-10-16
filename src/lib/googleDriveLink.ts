export function extractGoogleFileId(input: string): string | null {
  const value = input.trim();
  if (/^[a-zA-Z0-9_-]{25,}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['drive.google.com', 'docs.google.com'].includes(url.hostname)) return null;
    const id = url.pathname.match(/\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/)?.[1] || url.searchParams.get('id');
    return id && /^[a-zA-Z0-9_-]+$/.test(id) ? id : null;
  } catch { return null; }
}
