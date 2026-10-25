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
  const handleExitTour = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('gridsense:close-tour'));
    if (closeProps?.onClick) {
      try {
        closeProps.onClick(e);
      } catch {
        // Safe fallback
      }
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLastStep) {
      window.dispatchEvent(new CustomEvent('gridsense:close-tour'));
    }
    if (primaryProps?.onClick) {
      try {
        primaryProps.onClick(e);
      } catch {
        // Safe fallback
      }
    }
  };

  const handleSkipTour = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('gridsense:close-tour'));
    if (skipProps?.onClick) {
      try {
        skipProps.onClick(e);
      } catch {
        // Safe fallback
      }
    }
  };

  const handleBackStep = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (backProps?.onClick) {
      try {
        backProps.onClick(e);
      } catch {
        // Safe fallback
      }
    }
  };

  return (
    <div
      {...tooltipProps}
      className="relative z-[10000] w-[360px] sm:w-[440px] max-w-[92vw] rounded-2xl bg-slate-950/98 border border-cyan-500/70 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.95),0_0_35px_rgba(6,182,212,0.35)] p-5 text-left text-white font-sans"
    >
      {/* Header with Step Counter and Explicit Close Button */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Step {index + 1} of {size}
          </span>
          {step.badge && (
            <span className="text-[10px] font-mono text-slate-300 font-semibold px-2 py-0.5 rounded bg-slate-900 border border-white/10">
              {step.badge}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleExitTour}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer select-none"
          title="Close Tour"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Step Body with Clear Typography */}
      <div className="py-4 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
        {step.content}
      </div>

      {/* Footer Controls with Glowing Vibrant Gradient Button */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={handleSkipTour}
          className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-white/5 select-none"
        >
          Skip Tour
        </button>

        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              type="button"
              onClick={handleBackStep}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-white/10 transition-colors cursor-pointer select-none"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleNextStep}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black tracking-wide text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-400/60 transition-all cursor-pointer border-none select-none"
          >
            <span>{isLastStep ? 'Finish Tour' : 'Next Step'}</span>
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
  backProps: PropTypes.object,
  closeProps: PropTypes.object,
  primaryProps: PropTypes.object,
  skipProps: PropTypes.object,
  tooltipProps: PropTypes.object,
};
