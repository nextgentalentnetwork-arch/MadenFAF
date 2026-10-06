import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl font-black mb-4">
        FAF
      </div>
      <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
        404 — Page Not Found
      </h2>
      <p className="text-slate-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
        The requested football academy module or page could not be located. Return to the MADEN FAF portal.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
      >
        Return to Academy Home
      </Link>
    </div>
  );
}
