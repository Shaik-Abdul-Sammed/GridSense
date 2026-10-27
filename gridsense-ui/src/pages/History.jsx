import { useState, useMemo } from 'react';
import Papa from 'papaparse';
import {
  Clock,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Zap,
  FileText,
  CheckCircle2,
  Calendar,
  User,
  ShieldAlert,
  Layers,
  Eye,
  FileCheck,
  X,
} from 'lucide-react';

const INITIAL_EVENT_LOGS = [
  {
    id: 1,
    timestamp: '2026-10-24 23:00:00',
    demand: 168.4,
    mode: 'RENEWABLE_STORAGE_MODE',
    severity: 'WARNING',
    alert: 'NONE',
    action: 'BESS Battery Discharge (42 kW offset maintained)',
    shift: 'Night Watch',
  },
  {
    id: 2,
    timestamp: '2026-10-24 22:00:00',
    demand: 172.5,
    mode: 'RENEWABLE_STORAGE_MODE',
    severity: 'WARNING',
    alert: 'NONE',
    action: 'BESS Battery Discharge (48 kW offset)',
    shift: 'Night Watch',
  },
  {
    id: 3,
    timestamp: '2026-10-24 21:00:00',
    demand: 206.8,
    mode: 'RENEWABLE_STORAGE_MODE',
    severity: 'CRITICAL',
    alert: 'CRITICAL_OVERLOAD',
    action: 'Automated Peak Shaving + Curtailment Alert Issued',
    shift: 'Evening Peak',
  },
  {
    id: 4,
    timestamp: '2026-10-24 20:00:00',
    demand: 215.4,
    mode: 'RENEWABLE_STORAGE_MODE',
    severity: 'CRITICAL',
    alert: 'CRITICAL_OVERLOAD',
    action: 'Critical Load Shedding Engaged & 100% Battery Dispatched',
    shift: 'Evening Peak',
  },
  {
    id: 5,
    timestamp: '2026-10-24 19:00:00',
    demand: 198.2,
    mode: 'RENEWABLE_STORAGE_MODE',
    severity: 'WARNING',
    alert: 'NONE',
    action: 'Peak Window Switch to Storage Active',
    shift: 'Evening Peak',
  },
  {
    id: 6,
    timestamp: '2026-10-24 18:00:00',
    demand: 185.0,
    mode: 'RENEWABLE_STORAGE_MODE',
    severity: 'NORMAL',
    alert: 'NONE',
    action: 'Peak Window Commenced (Storage Mode Engaged)',
    shift: 'Evening Peak',
  },
  {
    id: 7,
    timestamp: '2026-10-24 17:00:00',
    demand: 154.2,
    mode: 'MAIN_GRID_MODE',
    severity: 'NORMAL',
    alert: 'NONE',
    action: 'Base-load utility dispatch',
    shift: 'Day Shift',
  },
  {
    id: 8,
    timestamp: '2026-10-24 16:00:00',
    demand: 148.9,
    mode: 'MAIN_GRID_MODE',
    severity: 'NORMAL',
    alert: 'NONE',
    action: 'Normal transmission operation',
    shift: 'Day Shift',
  },
  {
    id: 9,
    timestamp: '2026-10-24 15:00:00',
    demand: 162.1,
    mode: 'RENEWABLE_STORAGE_MODE',
    severity: 'NORMAL',
    alert: 'NONE',
    action: 'Solar PV Excess Absorption to BESS',
    shift: 'Day Shift',
  },
  {
    id: 10,
    timestamp: '2026-10-24 14:00:00',
    demand: 165.7,
    mode: 'RENEWABLE_STORAGE_MODE',
    severity: 'NORMAL',
    alert: 'NONE',
    action: 'Solar peak generation offset active',
    shift: 'Day Shift',
  },
  {
    id: 11,
    timestamp: '2026-10-24 13:00:00',
    demand: 158.3,
    mode: 'RENEWABLE_STORAGE_MODE',
    severity: 'NORMAL',
    alert: 'NONE',
    action: 'Clean energy dispatch active',
    shift: 'Day Shift',
  },
  {
    id: 12,
    timestamp: '2026-10-24 12:00:00',
    demand: 142.0,
    mode: 'MAIN_GRID_MODE',
    severity: 'NORMAL',
    alert: 'NONE',
    action: 'Main grid balance restored',
    shift: 'Day Shift',
  },
  {
    id: 13,
    timestamp: '2026-10-24 11:00:00',
    demand: 135.5,
    mode: 'MAIN_GRID_MODE',
    severity: 'NORMAL',
    alert: 'NONE',
    action: 'Normal baseline distribution',
    shift: 'Day Shift',
  },
  {
    id: 14,
    timestamp: '2026-10-24 10:00:00',
    demand: 128.0,
    mode: 'MAIN_GRID_MODE',
    severity: 'NORMAL',
    alert: 'NONE',
    action: 'Substation automated feeder sync',
    shift: 'Morning Dispatch',
  },
];

const HISTORICAL_SHIFT_REPORTS = [
  {
    id: 'REP-20261024-S3',
    date: '2026-10-24',
    shiftName: 'Night Watch (22:00 - 06:00)',
    operator: 'Samm - Lead Grid Architect',
    peakDemandKw: 172.5,
    avgDemandKw: 148.2,
    solarGeneratedKwh: 0,
    batteryDischargedKwh: 96.4,
    incidentsCount: 0,
    status: 'Certified & Signed',
    statusColor: 'emerald',
    notes: 'Smooth nighttime load shaving. BESS SoC stabilized at 48% reserve.',
  },
  {
    id: 'REP-20261024-S2',
    date: '2026-10-24',
    shiftName: 'Evening Peak (14:00 - 22:00)',
    operator: 'Alex Rivera - SCADA Lead',
    peakDemandKw: 215.4,
    avgDemandKw: 189.6,
    solarGeneratedKwh: 340.5,
    batteryDischargedKwh: 310.2,
    incidentsCount: 2,
    status: 'Certified & Signed',
    statusColor: 'emerald',
    notes: '2 Critical overloads intercepted at 20:00 and 21:00. Peak shaving successfully prevented feeder brownout.',
  },
  {
    id: 'REP-20261024-S1',
    date: '2026-10-24',
    shiftName: 'Day Shift (06:00 - 14:00)',
    operator: 'Elena Rostova - Grid Operator',
    peakDemandKw: 165.7,
    avgDemandKw: 138.4,
    solarGeneratedKwh: 890.0,
    batteryDischargedKwh: 0,
    incidentsCount: 0,
    status: 'Audited - Compliant',
    statusColor: 'cyan',
    notes: 'Optimal solar surplus conditions. Battery storage fully charged to 100% by 13:00.',
  },
  {
    id: 'REP-20261023-S3',
    date: '2026-10-23',
    shiftName: 'Night Watch (22:00 - 06:00)',
    operator: 'Dr. Chen - Reliability Engineer',
    peakDemandKw: 162.0,
    avgDemandKw: 135.0,
    solarGeneratedKwh: 0,
    batteryDischargedKwh: 84.0,
    incidentsCount: 0,
    status: 'System Auto-Archived',
    statusColor: 'slate',
    notes: 'Routine baseline distribution across industrial feeders.',
  },
  {
    id: 'REP-20261023-S2',
    date: '2026-10-23',
    shiftName: 'Evening Peak (14:00 - 22:00)',
    operator: 'Alex Rivera - SCADA Lead',
    peakDemandKw: 208.1,
    avgDemandKw: 179.3,
    solarGeneratedKwh: 295.0,
    batteryDischargedKwh: 260.0,
    incidentsCount: 1,
    status: 'Certified & Signed',
    statusColor: 'emerald',
    notes: 'Single overload handled via automated industrial demand curtailment at 19:30.',
  },
  {
    id: 'REP-20261022-S2',
    date: '2026-10-22',
    shiftName: 'Evening Peak (14:00 - 22:00)',
    operator: 'Samm - Lead Grid Architect',
    peakDemandKw: 224.8,
    avgDemandKw: 194.2,
    solarGeneratedKwh: 310.0,
    batteryDischargedKwh: 340.0,
    incidentsCount: 3,
    status: 'Audited - Compliant',
    statusColor: 'cyan',
    notes: 'Heatwave surge stress test. Transformer health reached 58% but remained within safe bounds.',
  },
];

const INCIDENT_LOGS = [
  {
    id: 'INC-901',
    timestamp: '2026-10-24 20:15:00',
    type: 'Critical Overload Spike',
    component: 'Feeder Substation Alpha (250 kVA)',
    severity: 'CRITICAL',
    action: 'Automated 45 kW BESS discharge + industrial HVAC shedding',
    resolvedBy: 'AI Autonomous Dispatch',
    durationMinutes: 42,
  },
  {
    id: 'INC-899',
    timestamp: '2026-10-24 16:30:00',
    type: 'Thermal Hotspot Excursion',
    component: 'Transformer TX-02 Primary Winding',
    severity: 'WARNING',
    action: 'FLIR Drone Sentinel-1 dispatched. Core cooling fans engaged at 100%',
    resolvedBy: 'Alex Rivera',
    durationMinutes: 18,
  },
  {
    id: 'INC-895',
    timestamp: '2026-10-23 19:40:00',
    type: 'Grid Frequency Dip (49.82 Hz)',
    component: 'Microgrid Inverter Intertie',
    severity: 'WARNING',
    action: 'Fast frequency response initiated from Lithium-Iron BESS',
    resolvedBy: 'AI Autonomous Dispatch',
    durationMinutes: 4,
  },
  {
    id: 'INC-890',
    timestamp: '2026-10-22 18:20:00',
    type: 'Adversarial Telemetry Inconsistency',
    component: 'Modbus Gateway Sensor #14',
    severity: 'CRITICAL',
    action: 'Isolated rogue packet stream. Fallback to Kalman filter estimate',
    resolvedBy: 'Samm - Grid Admin',
    durationMinutes: 12,
  },
];

export default function History() {
  const [activeTab, setActiveTab] = useState('LOGS'); // 'LOGS', 'REPORTS', 'INCIDENTS'

  // Event Logs Filters
  const [filterMode, setFilterMode] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterShift, setFilterShift] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Past Reports Filters
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('ALL');
  const [selectedReportModal, setSelectedReportModal] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportNotice, setExportNotice] = useState(null);

  // Incident Filters
  const [incidentTypeFilter, setIncidentTypeFilter] = useState('ALL');

  // Filtered Event Logs
  const filteredLogs = useMemo(() => {
    try {
      return INITIAL_EVENT_LOGS.filter((log) => {
        if (!log) return false;

        if (filterMode === 'OVERLOAD' && log.alert !== 'CRITICAL_OVERLOAD') return false;
        if (filterMode === 'RENEWABLE' && log.mode !== 'RENEWABLE_STORAGE_MODE') return false;
        if (filterMode === 'MAINGRID' && log.mode !== 'MAIN_GRID_MODE') return false;

        if (filterSeverity !== 'ALL' && log.severity !== filterSeverity) return false;
        if (filterShift !== 'ALL' && log.shift !== filterShift) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTs = String(log.timestamp || '').toLowerCase().includes(q);
          const matchesAct = String(log.action || '').toLowerCase().includes(q);
          const matchesMod = String(log.mode || '').toLowerCase().includes(q);
          if (!matchesTs && !matchesAct && !matchesMod) return false;
        }

        return true;
      });
    } catch (err) {
      console.error('Error filtering logs:', err);
      return INITIAL_EVENT_LOGS;
    }
  }, [filterMode, filterSeverity, filterShift, searchQuery]);

  // Filtered Past Reports
  const filteredReports = useMemo(() => {
    try {
      return HISTORICAL_SHIFT_REPORTS.filter((rep) => {
        if (!rep) return false;

        if (reportStatusFilter !== 'ALL' && rep.status !== reportStatusFilter) return false;

        if (reportSearchQuery.trim()) {
          const q = reportSearchQuery.toLowerCase().trim();
          const matchesId = String(rep.id || '').toLowerCase().includes(q);
          const matchesOp = String(rep.operator || '').toLowerCase().includes(q);
          const matchesShift = String(rep.shiftName || '').toLowerCase().includes(q);
          const matchesNotes = String(rep.notes || '').toLowerCase().includes(q);
          if (!matchesId && !matchesOp && !matchesShift && !matchesNotes) return false;
        }

        return true;
      });
    } catch (err) {
      console.error('Error filtering reports:', err);
      return HISTORICAL_SHIFT_REPORTS;
    }
  }, [reportStatusFilter, reportSearchQuery]);

  // Filtered Incidents
  const filteredIncidents = useMemo(() => {
    try {
      return INCIDENT_LOGS.filter((inc) => {
        if (!inc) return false;
        if (incidentTypeFilter !== 'ALL') {
          if (incidentTypeFilter === 'CRITICAL' && inc.severity !== 'CRITICAL') return false;
          if (incidentTypeFilter === 'WARNING' && inc.severity !== 'WARNING') return false;
        }
        return true;
      });
    } catch (err) {
      console.error('Error filtering incidents:', err);
      return INCIDENT_LOGS;
    }
  }, [incidentTypeFilter]);

  // CSV Export with try/catch
  const handleExportHistory = () => {
    try {
      const csv = Papa.unparse(filteredLogs);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gridsense_event_history_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportNotice('Event history CSV exported successfully.');
      setTimeout(() => setExportNotice(null), 3000);
    } catch (err) {
      console.error('Failed to export history CSV:', err);
      setExportNotice('Failed to export CSV: ' + err.message);
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  // PDF Export of Shift Report with dynamic import and try/catch
  const handleDownloadReportPDF = async (report) => {
    if (!report) return;
    setIsExportingPdf(true);

    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 30, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(6, 182, 212);
      doc.text('GridSense Autonomous System', 14, 14);

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text('Certified Shift Handover & Microgrid Compliance Report', 14, 22);

      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      doc.text(`Report ID: ${report.id}`, pageWidth - 14, 14, { align: 'right' });
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 22, { align: 'right' });

      // Body Content
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Operational Overview', 14, 42);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Date: ${report.date}`, 14, 50);
      doc.text(`Shift: ${report.shiftName}`, 14, 56);
      doc.text(`Supervising Operator: ${report.operator}`, 14, 62);
      doc.text(`Compliance Status: ${report.status}`, 14, 68);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('2. Telemetry & Load Metrics', 14, 80);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Peak Demand: ${report.peakDemandKw} kW`, 14, 88);
      doc.text(`Average Demand: ${report.avgDemandKw} kW`, 14, 94);
      doc.text(`Solar Energy Generated: ${report.solarGeneratedKwh} kWh`, 14, 100);
      doc.text(`Battery Energy Discharged: ${report.batteryDischargedKwh} kWh`, 14, 106);
      doc.text(`Critical Overload Incidents: ${report.incidentsCount}`, 14, 112);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('3. Shift Engineering Log & Observations', 14, 126);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text(`"${report.notes}"`, 14, 134, { maxWidth: pageWidth - 28 });

      // Verification Line
      doc.setDrawColor(203, 213, 225);
      doc.line(14, 160, pageWidth - 14, 160);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('OPERATOR DIGITAL CERTIFICATION:', 14, 170);

      doc.setFont('courier', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`[SIGNED: ${report.operator} | HASH: 0x9f4a...e82c]`, 14, 178);

      doc.save(`${report.id}_Handover_Report.pdf`);
      setExportNotice(`Report ${report.id} PDF downloaded successfully.`);
      setTimeout(() => setExportNotice(null), 3000);
    } catch (err) {
      console.error('PDF generation error:', err);
      setExportNotice('Failed to generate report PDF: ' + err.message);
      setTimeout(() => setExportNotice(null), 4000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {exportNotice && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-cyan-950/95 border border-cyan-500 text-cyan-200 text-xs shadow-2xl backdrop-blur-xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              History & Compliance Records
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Audit logs, certified shift handover reports, and historical transformer incident archives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportHistory}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-white/10 transition-colors cursor-pointer select-none"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV Audit</span>
          </button>
        </div>
      </div>

      {/* Main Section Navigation Tabs (Arranged without horizontal overflow) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('LOGS')}
          className={`flex-1 sm:flex-initial min-h-[42px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'LOGS'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>Operational Audit Trail ({filteredLogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REPORTS')}
          className={`flex-1 sm:flex-initial min-h-[42px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'REPORTS'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileCheck className="w-4 h-4 shrink-0" />
          <span>Past Shift Reports ({filteredReports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('INCIDENTS')}
          className={`flex-1 sm:flex-initial min-h-[42px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'INCIDENTS'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Transformer &amp; Incident Log ({filteredIncidents.length})</span>
        </button>
      </div>

      {/* TAB 1: OPERATIONAL AUDIT TRAIL */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by timestamp, mode, or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-hidden transition-colors"
              />
            </div>

            {/* Filter Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1 shrink-0">
                  <Filter className="w-3.5 h-3.5 text-cyan-400" />
                  Mode:
                </span>
                {[
                  { id: 'ALL', label: 'All Modes' },
                  { id: 'OVERLOAD', label: '🚨 Overloads Only' },
                  { id: 'RENEWABLE', label: 'Renewable Storage' },
                  { id: 'MAINGRID', label: 'Main Grid' },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setFilterMode(btn.id)}
                    className={`flex-1 sm:flex-initial min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap text-center ${
                      filterMode === btn.id
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Severity Dropdown */}
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:border-cyan-500 outline-hidden cursor-pointer"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical Only</option>
                <option value="WARNING">Warning Only</option>
                <option value="NORMAL">Normal Only</option>
              </select>

              {/* Shift Dropdown */}
              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:border-cyan-500 outline-hidden cursor-pointer"
              >
                <option value="ALL">All Shifts</option>
                <option value="Day Shift">Day Shift</option>
                <option value="Evening Peak">Evening Peak</option>
                <option value="Night Watch">Night Watch</option>
              </select>
            </div>
          </div>

          {/* Event Logs Table */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Shift</th>
                    <th className="py-3.5 px-4 text-right">Predicted Demand</th>
                    <th className="py-3.5 px-4 text-center">Grid Mode</th>
                    <th className="py-3.5 px-4 text-center">Severity</th>
                    <th className="py-3.5 px-4 text-center">Alert Status</th>
                    <th className="py-3.5 px-4">Action Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredLogs.map((log) => {
                    const isOverload = log.alert === 'CRITICAL_OVERLOAD';

                    return (
                      <tr
                        key={log.id}
                        className={`transition-colors ${
                          isOverload
                            ? 'bg-red-950/30 hover:bg-red-950/40 border-l-4 border-red-500'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-white whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {log.shift}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                            isOverload ? 'text-red-400 text-sm' : 'text-cyan-300'
                          }`}
                        >
                          {log.demand.toFixed(1)} kW
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              log.mode === 'RENEWABLE_STORAGE_MODE'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                            }`}
                          >
                            <Zap className="w-3 h-3" />
                            {log.mode === 'RENEWABLE_STORAGE_MODE' ? 'RENEWABLE STORAGE' : 'MAIN GRID'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.severity === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : log.severity === 'WARNING'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {log.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {isOverload ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-600/30 text-red-300 border border-red-500 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                              CRITICAL_OVERLOAD
                            </span>
                          ) : (
                            <span className="text-slate-500 font-mono text-[11px]">NONE</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <span className={isOverload ? 'font-bold text-red-200' : ''}>
                            {log.action}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredLogs.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No events match the selected filter criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PAST SHIFT HANDOVER REPORTS */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-4">
          {/* Report Filters */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search reports by ID, operator, shift, or notes..."
                value={reportSearchQuery}
                onChange={(e) => setReportSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-hidden transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                Status:
              </span>
              {[
                { id: 'ALL', label: 'All Reports' },
                { id: 'Certified & Signed', label: 'Certified' },
                { id: 'Audited - Compliant', label: 'Audited' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setReportStatusFilter(btn.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    reportStatusFilter === btn.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shift Report Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-[11px] font-mono font-bold text-cyan-400">
                      {report.id}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {report.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{report.shiftName}</span>
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{report.operator}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-white/5 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Peak Load</span>
                      <span className="font-bold text-amber-300">{report.peakDemandKw} kW</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Avg Load</span>
                      <span className="font-bold text-cyan-300">{report.avgDemandKw} kW</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Solar Yield</span>
                      <span className="font-bold text-emerald-400">{report.solarGeneratedKwh} kWh</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">BESS Offset</span>
                      <span className="font-bold text-blue-300">{report.batteryDischargedKwh} kWh</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic mt-3 line-clamp-2">
                    &ldquo;{report.notes}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setSelectedReportModal(report)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-white/10 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View Handover</span>
                  </button>

                  <button
                    type="button"
                    disabled={isExportingPdf}
                    onClick={() => handleDownloadReportPDF(report)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="p-8 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-white/5">
              No shift handover reports match the query.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TRANSFORMER HEALTH & INCIDENT LOG */}
      {activeTab === 'INCIDENTS' && (
        <div className="space-y-4">
          {/* Incident Filter */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                Filter Incidents:
              </span>
              {[
                { id: 'ALL', label: 'All Incidents' },
                { id: 'CRITICAL', label: '🚨 Critical Overloads' },
                { id: 'WARNING', label: '⚠️ Thermal Warnings' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setIncidentTypeFilter(btn.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    incidentTypeFilter === btn.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Table */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Incident ID</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Event Description</th>
                    <th className="py-3.5 px-4">Impacted Subsystem</th>
                    <th className="py-3.5 px-4 text-center">Severity</th>
                    <th className="py-3.5 px-4">Automated / Manual Response</th>
                    <th className="py-3.5 px-4">Resolved By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredIncidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                        {inc.id}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {inc.timestamp}
                      </td>
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                        {inc.type}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {inc.component}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inc.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {inc.action}
                      </td>
                      <td className="py-3 px-4 font-semibold text-cyan-300 whitespace-nowrap">
                        {inc.resolvedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Full Shift Report Details */}
      {selectedReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/20 rounded-3xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Shift Handover Report #{selectedReportModal.id}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedReportModal.shiftName} &bull; {selectedReportModal.date}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReportModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase">Peak Load</span>
                <span className="text-lg font-bold text-amber-300">
                  {selectedReportModal.peakDemandKw} kW
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase">Avg Load</span>
                <span className="text-lg font-bold text-cyan-300">
                  {selectedReportModal.avgDemandKw} kW
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase">Solar Yield</span>
                <span className="text-lg font-bold text-emerald-400">
                  {selectedReportModal.solarGeneratedKwh} kWh
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase">BESS Offset</span>
                <span className="text-lg font-bold text-blue-400">
                  {selectedReportModal.batteryDischargedKwh} kWh
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Shift Supervisor Observations:
              </h4>
              <p className="text-sm text-slate-200 bg-slate-950/80 p-3.5 rounded-xl border border-white/5 leading-relaxed">
                {selectedReportModal.notes}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-200">
                  Operator Signature Certified: {selectedReportModal.operator}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {selectedReportModal.status}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReportModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReportPDF(selectedReportModal)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Certified PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
