export function protectPdf(bytes: Uint8Array, password: string, signal: AbortSignal): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new Error('Protection cancelled.'));
    const worker = new Worker(new URL('./protect.worker.ts', import.meta.url), { type: 'module' });
    const finish = () => { clearTimeout(timer); signal.removeEventListener('abort', cancel); worker.terminate(); };
    const cancel = () => { finish(); reject(new Error('Protection cancelled.')); };
    const timer = setTimeout(() => { finish(); reject(new Error('Processing timed out. Try a smaller PDF.')); }, 120_000);
    signal.addEventListener('abort', cancel, { once: true });
    worker.onmessage = ({ data }) => { finish(); data.error ? reject(new Error(data.error)) : resolve(data.bytes); };
    worker.onerror = () => { finish(); reject(new Error('PDF engine could not load. Please retry online.')); };
    worker.postMessage({ bytes, password }, [bytes.buffer]);
  });
}
