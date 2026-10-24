import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled Application Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-slate-900/90 border border-rose-500/50 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl text-center space-y-6">
            <div className="inline-flex p-4 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <AlertOctagon className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-mono tracking-tight text-white">
                Command Center Recovered
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                A non-fatal rendering anomaly was intercepted by the GridSense Fault Tolerant Subsystem.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="p-3 bg-black/50 border border-white/5 rounded-xl text-left font-mono text-xs text-rose-300 max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all cursor-pointer"
              >
                Retry View
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
