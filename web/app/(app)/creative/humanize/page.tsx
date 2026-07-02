'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAction } from '@/lib/hooks';
import {
  Alert,
  Button,
  Card,
  CopyButton,
  Field,
  PageHeader,
  Textarea,
} from '@/components/ui/primitives';

export default function HumanizePage() {
  const { busy, error, run } = useAction();
  const [text, setText] = useState('');
  const [result, setResult] = useState<string | null>(null);

  async function humanize(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    await run(async () => {
      const res = await api<{ text: string }>('/creative/humanize', {
        method: 'POST',
        body: { text },
      });
      setResult(res.text);
    });
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <PageHeader section="Creative" title="Humanize" />

      <Card className="mb-6">
        <form onSubmit={humanize} className="space-y-4">
          <Field label="Teks untuk di-humanize">
            <Textarea required value={text} onChange={(e) => setText(e.target.value)} className="min-h-[160px]" />
          </Field>
          <Button type="submit" disabled={busy}>{busy ? 'Memproses…' : 'Humanize'}</Button>
        </form>
        {error && <div className="mt-3"><Alert kind="error">{error}</Alert></div>}
      </Card>

      {result && (
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-wider text-flash">Hasil</p>
            <CopyButton text={result} />
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm text-paper-dim">{result}</pre>
        </Card>
      )}
    </div>
  );
}
