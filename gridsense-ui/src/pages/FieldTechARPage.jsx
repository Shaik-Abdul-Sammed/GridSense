import { useState, Suspense, lazy } from 'react';
import { Camera, Eye } from 'lucide-react';

const FieldTechAR = lazy(() => import('../components/FieldTechAR'));

export default function FieldTechARPage() {
  const [isScannerActive, setIsScannerActive] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-600 to-blue-500 rounded-2xl shadow-xl shadow-cyan-500/20 text-white">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight font-mono uppercase">
                AR Field Tech Diagnostics
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                FLIR THERMAL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Augmented Reality inspection viewport with IEC 60076-7 transformer insulation diagnostics and thermal imaging.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isScannerActive && (
            <button
              type="button"
              onClick={() => setIsScannerActive(true)}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 cursor-pointer flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Launch AR Scan</span>
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl shadow-2xl overflow-hidden">
        <Suspense fallback={<div className="h-96 rounded-3xl bg-slate-900/60 animate-pulse border border-white/10" />}>
          <FieldTechAR isOpen={isScannerActive} onClose={() => setIsScannerActive(false)} embedded={true} />
        </Suspense>
        {!isScannerActive && (
          <div className="text-center py-20 space-y-4 bg-slate-900/50 border border-white/10 rounded-3xl backdrop-blur-xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Camera className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AR Diagnostic Session Inactive</h3>
              <p className="text-slate-400 text-xs mt-1">Activate the high-voltage spatial FLIR thermal scanner to inspect Transformer T-2.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsScannerActive(true)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-mono uppercase tracking-wide cursor-pointer shadow-lg shadow-cyan-500/30 border-none"
            >
              Engage AR Scanner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
