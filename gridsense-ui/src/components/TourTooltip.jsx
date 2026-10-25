import PropTypes from 'prop-types';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

export default function TourTooltip({
  index,
  size,
  step,
  isLastStep,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
}) {
  return (
    <div
      {...tooltipProps}
      className="relative z-[10000] w-[360px] sm:w-[420px] max-w-[92vw] rounded-2xl bg-slate-950/95 border border-cyan-500/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(6,182,212,0.35)] backdrop-blur-2xl p-5 text-left text-white font-sans"
    >
      {/* Header with Step Counter and Close Button */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Step {index + 1} of {size}
          </span>
          {step.badge && (
            <span className="text-[10px] font-mono text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-900 border border-white/10">
              {step.badge}
            </span>
          )}
        </div>

        <button
          {...closeProps}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Close Tour"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Step Body */}
      <div className="py-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
        {step.content}
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <button
          {...skipProps}
          type="button"
          className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-white/5"
        >
          Skip Tour
        </button>

        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              {...backProps}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-white/10 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            {...primaryProps}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:brightness-110 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
          >
            <span>{isLastStep ? 'Finish Tour' : 'Next'}</span>
            {isLastStep ? (
              <Sparkles className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

TourTooltip.propTypes = {
  index: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  step: PropTypes.shape({
    badge: PropTypes.string,
    content: PropTypes.node.isRequired,
  }).isRequired,
  isLastStep: PropTypes.bool.isRequired,
  backProps: PropTypes.object.isRequired,
  closeProps: PropTypes.object.isRequired,
  primaryProps: PropTypes.object.isRequired,
  skipProps: PropTypes.object.isRequired,
  tooltipProps: PropTypes.object.isRequired,
};
