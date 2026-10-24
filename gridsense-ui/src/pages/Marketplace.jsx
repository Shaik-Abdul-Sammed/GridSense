import { useState, useEffect, useRef } from 'react';
import {
  Coins,
  ArrowRightLeft,
  ShieldCheck,
  TrendingUp,
  Zap,
  Building2,
  Home,
  CheckCircle2,
  Filter,
} from 'lucide-react';

const INITIAL_TRANSACTIONS = [
  {
    id: 'TX-8941',
    hash: '0x3f7b...e109',
    seller: 'House #04 (Rooftop Solar 9.2kW)',
    buyer: 'Artisan Bakery',
    amountKw: 4.8,
    pricePerKwh: 0.12,
    totalValue: 0.58,
    timestamp: '19:12:04',
    status: 'VERIFIED_ON_CHAIN',
  },
  {
    id: 'TX-8940',
    hash: '0x8a2c...d451',
    seller: 'Community Solar Canopy #1',
    buyer: 'EV Fast-Charge Station Beta',
    amountKw: 14.5,
    pricePerKwh: 0.11,
    totalValue: 1.6,
    timestamp: '19:11:48',
    status: 'VERIFIED_ON_CHAIN',
  },
  {
    id: 'TX-8939',
    hash: '0x19fe...b772',
    seller: 'House #12 (Solar + BESS)',
    buyer: 'House #02 (High HVAC Load)',
    amountKw: 3.2,
    pricePerKwh: 0.13,
    totalValue: 0.42,
    timestamp: '19:11:30',
    status: 'VERIFIED_ON_CHAIN',
  },
  {
    id: 'TX-8938',
    hash: '0x62cc...99a0',
    seller: 'Substation Micro-Hydro Unit',
    buyer: 'Cold Storage Warehouse',
    amountKw: 22.0,
    pricePerKwh: 0.1,
    totalValue: 2.2,
    timestamp: '19:11:05',
    status: 'VERIFIED_ON_CHAIN',
  },
];

const PROSUMER_POOL = [
  'House #01 (Solar 6.5kW)',
  'House #07 (Solar 8.0kW)',
  'House #14 (Rooftop PV 10kW)',
  'Green Valley High School Solar',
  'Commercial Plaza Canopy',
  'Eco Farm Solar Array',
  'House #21 (Bi-directional EV)',
];

const CONSUMER_POOL = [
  'Downtown Medical Clinic',
  'House #03 (Heat Pump Load)',
  'Metro Water Pump Station',
  'EV Fleet Depot #4',
  'Smart Greenhouse Alpha',
  'Data Center Edge Node 3',
];

export default function Marketplace() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [totalRevenue, setTotalRevenue] = useState(482.75);
  const [totalKwhTraded, setTotalKwhTraded] = useState(3840);
  const [isLiveTrading, setIsLiveTrading] = useState(true);
  const [filterText, setFilterText] = useState('');

  const nextTxIdRef = useRef(8942);

  // Live real-time transaction streaming using setInterval
  useEffect(() => {
    if (!isLiveTrading) return;

    const interval = setInterval(() => {
      const seller = PROSUMER_POOL[Math.floor(Math.random() * PROSUMER_POOL.length)];
      const buyer = CONSUMER_POOL[Math.floor(Math.random() * CONSUMER_POOL.length)];
      const amountKw = Number((2 + Math.random() * 8).toFixed(1));
      const pricePerKwh = Number((0.10 + Math.random() * 0.05).toFixed(2));
      const totalValue = Number((amountKw * pricePerKwh).toFixed(2));
      const hash = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;
      const now = new Date();
      const timestamp = now.toTimeString().split(' ')[0];

      const newTx = {
        id: `TX-${nextTxIdRef.current++}`,
        hash,
        seller,
        buyer,
        amountKw,
        pricePerKwh,
        totalValue,
        timestamp,
        status: 'VERIFIED_ON_CHAIN',
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 39)]); // Keep latest 40 trades
      setTotalRevenue((prev) => Number((prev + totalValue).toFixed(2)));
      setTotalKwhTraded((prev) => Number((prev + amountKw).toFixed(1)));
    }, 2200);

    return () => clearInterval(interval);
  }, [isLiveTrading]);

  const filteredTx = transactions.filter(
    (tx) =>
      tx.seller.toLowerCase().includes(filterText.toLowerCase()) ||
      tx.buyer.toLowerCase().includes(filterText.toLowerCase()) ||
      tx.id.toLowerCase().includes(filterText.toLowerCase()) ||
      tx.hash.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Coins className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              P2P Energy Marketplace Ledger
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
              SOLAR LEDGER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous peer-to-peer microgrid settlement protocol for surplus rooftop solar trading.
          </p>
        </div>

        {/* Live Ledger Status & Pause Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsLiveTrading((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isLiveTrading
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveTrading ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>{isLiveTrading ? 'Smart Contracts: ACTIVE' : 'Ledger Paused'}</span>
          </button>
        </div>
      </div>

      {/* Top Marketplace Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Microgrid Revenue */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Cumulative Market Volume</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-300 font-mono">
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Settled via Smart Contracts</p>
          </div>
        </div>

        {/* Total Clean Energy Traded */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Clean Energy Exchanged</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-cyan-300 font-mono">
              {totalKwhTraded.toLocaleString()} kWh
            </span>
            <p className="text-[11px] text-slate-400 mt-1">100% Rooftop Solar &amp; BESS</p>
          </div>
        </div>

        {/* Average Clearing Tariff */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Market Clearing Price</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-300 font-mono">
              $0.12 <span className="text-xs font-normal text-slate-400">/ kWh</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Utility avoided peak rate: $0.28</p>
          </div>
        </div>

        {/* Active Market Prosumers */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Participating Prosumers</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-purple-300 font-mono">24 Nodes</span>
            <p className="text-[11px] text-slate-400 mt-1">Decentralized P2P Consensus</p>
          </div>
        </div>
      </div>

      {/* Main Real-Time Scrolling Blockchain Ledger Feed */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Real-Time Immutable Transaction Ledger
            </h3>
          </div>

          {/* Filter Input */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Search house, buyer, or hash..."
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-hidden focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Transaction Table / Feed */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Tx ID &amp; Hash</th>
                <th className="py-2.5 px-3">Energy Seller (Prosumer)</th>
                <th className="py-2.5 px-3">Energy Buyer</th>
                <th className="py-2.5 px-3 text-right">Volume (kW)</th>
                <th className="py-2.5 px-3 text-right">Settlement Rate</th>
                <th className="py-2.5 px-3 text-right">Total Trade</th>
                <th className="py-2.5 px-3 text-center">Consensus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredTx.map((tx, idx) => (
                <tr
                  key={tx.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    idx === 0 ? 'bg-cyan-950/20 animate-fadeIn' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-semibold text-white">
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-300">{tx.id}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({tx.hash})</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">{tx.timestamp}</span>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <Home className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate max-w-[180px]">{tx.seller}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate max-w-[180px]">{tx.buyer}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-cyan-300">
                    {tx.amountKw.toFixed(1)} kW
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">
                    ${tx.pricePerKwh.toFixed(2)} / kWh
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-300">
                    ${tx.totalValue.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>VALIDATED</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
