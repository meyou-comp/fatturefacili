'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InviteClientPage({ token, orgId }: { token: string; orgId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAccept = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Errore durante l'accettazione dell'invito");
      }

      // Success! Redirect to the organization dashboard
      router.push('/organizzazione');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600 font-semibold">
          {error}
        </div>
      )}

      <button
        onClick={handleAccept}
        disabled={loading}
        className={cn(
          "w-full h-12 rounded-lg bg-[#ABF88D] text-black font-bold text-lg flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50",
          loading && "opacity-70 cursor-not-allowed"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Accettazione...
          </>
        ) : (
          "Accetta l'invito"
        )}
      </button>
    </div>
  );
}
