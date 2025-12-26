"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Dashboard() {
  // State for Chart Data
  const [data, setData] = useState([
    { time: '10:00', allowed: 400, denied: 20 },
    { time: '11:00', allowed: 300, denied: 10 },
    { time: '12:00', allowed: 550, denied: 40 },
    { time: '13:00', allowed: 450, denied: 30 },
    { time: '14:00', allowed: 600, denied: 50 },
    { time: 'Now', allowed: 500, denied: 20 },
  ]);

  // State for Metrics
  const [metrics, setMetrics] = useState({
    total: 1200000,
    passRate: 98.2,
    blockRate: 1.8,
    latency: 0.4
  });

  const [isAttacking, setIsAttacking] = useState(false);

  // Simulate Attack Function
  const launchAttack = async () => {
    setIsAttacking(true);
    let successCount = 0;
    let blockedCount = 0;
    const batchSize = 50;

    // Fire requests
    const requests = Array.from({ length: batchSize }, () =>
      axios.get(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/test')
        .then(() => { successCount++; return 'success'; })
        .catch((err) => {
          if (err.response && err.response.status === 429) {
            blockedCount++;
            return 'blocked';
          }
          return 'error';
        })
    );

    await Promise.all(requests);

    // Update Chart Data with new "spike"
    const now = new Date();
    const timeLabel = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    setData(prev => {
      const newData = [...prev.slice(1), {
        time: timeLabel,
        allowed: successCount * 10 + 200, // Scale for visual
        denied: blockedCount * 10 + 20
      }];
      return newData;
    });

    // Update Metrics
    setMetrics(prev => ({
      ...prev,
      total: prev.total + batchSize,
      blockRate: ((blockedCount / batchSize) * 100).toFixed(1),
      passRate: ((successCount / batchSize) * 100).toFixed(1)
    }));

    setIsAttacking(false);
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col group/design-root bg-background text-text-main dark:bg-dark-background dark:text-dark-text-main overflow-x-hidden font-display transition-colors duration-300">

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between border-b border-solid border-border bg-surface dark:border-dark-border dark:bg-dark-background px-4 py-3 lg:px-10 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center size-8 bg-primary/10 rounded-lg text-primary">
            <span className="material-symbols-outlined">shield</span>
          </div>
          <h2 className="text-text-main dark:text-dark-text-main text-lg font-bold leading-tight tracking-[-0.015em]">LimitGuard</h2>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <a className="text-text-main dark:text-dark-text-main text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Dashboard</a>
          <a className="text-text-secondary dark:text-dark-text-secondary text-sm font-medium leading-normal hover:text-text-main dark:hover:text-white transition-colors" href="#">Rules</a>
          <a className="text-text-secondary dark:text-dark-text-secondary text-sm font-medium leading-normal hover:text-text-main dark:hover:text-white transition-colors" href="#">Analytics</a>
        </div>

        {/* Controls (Visible on Mobile) */}
        <div className="flex items-center gap-3 ml-auto md:ml-0">
          {/* SIMULATE ATTACK BUTTON */}
          <button
            onClick={launchAttack}
            disabled={isAttacking}
            className={clsx(
              "flex items-center justify-center gap-2 h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-lg whitespace-nowrap",
              isAttacking
                ? "bg-red-500/20 text-red-500 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
            )}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">{isAttacking ? 'autorenew' : 'warning'}</span>
            {isAttacking ? 'Attacking...' : 'Simulate Attack'}
          </button>

          <button className="hidden sm:flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary-dark transition-colors shadow-lg shadow-blue-500/20">
            <span className="truncate">Production - US-East</span>
            <span className="material-symbols-outlined ml-2 text-[18px]">expand_more</span>
          </button>
          <div className="hidden sm:block bg-center bg-no-repeat bg-cover rounded-full size-9 border border-border dark:border-dark-border bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </header>

      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-6 px-4 lg:px-10">
          <div className="layout-content-container flex flex-col max-w-[1280px] flex-1 gap-6">

            {/* KPI Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat Card 1 */}
              <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <p className="text-text-secondary dark:text-dark-text-secondary text-sm font-medium leading-normal">Total Requests</p>
                  <span className="material-symbols-outlined text-text-secondary dark:text-dark-text-secondary text-[20px]">bar_chart</span>
                </div>
                <div className="flex items-end gap-3 mt-1">
                  <p className="text-text-main dark:text-dark-text-main tracking-tight text-2xl font-bold leading-tight">{(metrics.total / 1000).toFixed(1)}k</p>
                  <span className="flex items-center text-emerald-600 dark:text-emerald-500 text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded mb-1">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>
                    5%
                  </span>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <p className="text-text-secondary dark:text-dark-text-secondary text-sm font-medium leading-normal">Pass Rate</p>
                  <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
                </div>
                <div className="flex items-end gap-3 mt-1">
                  <p className="text-text-main dark:text-dark-text-main tracking-tight text-2xl font-bold leading-tight">{metrics.passRate}%</p>
                  <span className="flex items-center text-emerald-600 dark:text-emerald-500 text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded mb-1">
                    Atomic
                  </span>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <p className="text-text-secondary dark:text-dark-text-secondary text-sm font-medium leading-normal">Block Rate</p>
                  <span className="material-symbols-outlined text-orange-500 text-[20px]">block</span>
                </div>
                <div className="flex items-end gap-3 mt-1">
                  <p className="text-text-main dark:text-dark-text-main tracking-tight text-2xl font-bold leading-tight">{metrics.blockRate}%</p>
                  <span className="flex items-center text-orange-600 dark:text-orange-500 text-xs font-medium bg-orange-100 dark:bg-orange-500/10 px-1.5 py-0.5 rounded mb-1">
                    Throttled
                  </span>
                </div>
              </div>

              {/* Stat Card 4 */}
              <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <p className="text-text-secondary dark:text-dark-text-secondary text-sm font-medium leading-normal">Redis Latency</p>
                  <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                </div>
                <div className="flex items-end gap-3 mt-1">
                  <p className="text-text-main dark:text-dark-text-main tracking-tight text-2xl font-bold leading-tight">{metrics.latency}ms</p>
                  <p className="text-text-secondary dark:text-dark-text-secondary text-xs font-medium mb-1">Local Network</p>
                </div>
              </div>
            </div>

            {/* Main Chart Section */}
            <div className="rounded-xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border p-6 shadow-sm min-h-[350px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-text-main dark:text-dark-text-main text-lg font-bold leading-tight">Traffic Volume</h2>
                  <p className="text-text-secondary dark:text-dark-text-secondary text-sm mt-1">Allowed vs Denied Requests • Live Stream</p>
                </div>
                {/* Segmented Control */}
                <div className="flex h-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#111a22] p-1 self-start sm:self-auto">
                  <span className="px-3 text-xs font-bold text-text-main dark:text-white bg-white dark:bg-surface-dark rounded shadow-sm py-1">Live</span>
                  <span className="px-3 text-xs font-bold text-text-secondary dark:text-dark-text-secondary cursor-pointer py-1">1H</span>
                  <span className="px-3 text-xs font-bold text-text-secondary dark:text-dark-text-secondary cursor-pointer py-1">24H</span>
                </div>
              </div>

              {/* Chart Visualization */}
              <div className="w-full h-[200px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorAllowed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#137fec" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#137fec" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDenied" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fa6238" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#fa6238" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px' }}
                      itemStyle={{ color: '#0f172a' }}
                    />
                    <Area type="monotone" dataKey="allowed" stroke="#137fec" fillOpacity={1} fill="url(#colorAllowed)" strokeWidth={2} />
                    <Area type="monotone" dataKey="denied" stroke="#fa6238" fillOpacity={1} fill="url(#colorDenied)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Section: Active Limits & Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column: Active Limits Table */}
              <div className="lg:col-span-2 flex flex-col rounded-xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-border dark:border-dark-border">
                  <h3 className="text-text-main dark:text-dark-text-main font-bold text-lg">Active Rate Limits</h3>
                  <button className="text-primary text-sm font-bold hover:text-blue-600">Manage Rules</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#1c2b3a] text-xs uppercase text-text-secondary dark:text-dark-text-secondary font-semibold border-b border-border dark:border-dark-border">
                        <th className="px-5 py-3 rounded-tl-lg text-nowrap">Rule Name</th>
                        <th className="px-5 py-3 text-nowrap">Capacity</th>
                        <th className="px-5 py-3 w-1/3 text-nowrap">Current Usage</th>
                        <th className="px-5 py-3 text-right rounded-tr-lg text-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-dark-border">
                      {/* Row 1 */}
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="text-text-main dark:text-dark-text-main font-medium text-sm">POST /api/test</span>
                            <span className="text-text-secondary dark:text-dark-text-secondary text-xs">Standard Limit</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-text-main dark:text-dark-text-main text-sm font-mono">10/60s</td>
                        <td className="px-5 py-4">
                          <div className="w-full bg-slate-100 dark:bg-[#111a22] rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full relative" style={{ width: isAttacking ? '100%' : '15%' }}>
                              {isAttacking && <div className="absolute right-0 -top-1 size-4 bg-primary/30 rounded-full animate-pulse"></div>}
                            </div>
                          </div>
                          <div className="flex justify-between mt-1.5">
                            <span className="text-xs text-text-secondary dark:text-dark-text-secondary font-mono">{isAttacking ? '50 req/s' : '0 req/s'}</span>
                            <span className="text-xs text-primary font-bold">{isAttacking ? '500%' : '0%'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {isAttacking ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-200 dark:border-orange-500/20">
                              <span className="size-1.5 rounded-full bg-orange-500"></span>
                              Throttling
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-500/20">
                              <span className="size-1.5 rounded-full bg-emerald-500"></span>
                              Healthy
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: System Health & Alerts */}
              <div className="flex flex-col gap-6">
                {/* System Status */}
                <div className="rounded-xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border p-5 shadow-sm">
                  <h3 className="text-text-main dark:text-dark-text-main font-bold text-lg mb-4">System Status</h3>
                  <div className="flex flex-col gap-4">
                    {/* Status Item 1 */}
                    <div className="flex items-center gap-3 pb-3 border-b border-border dark:border-dark-border">
                      <div className="flex items-center justify-center size-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500">
                        <span className="material-symbols-outlined text-[18px]">dns</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-text-main dark:text-dark-text-main font-medium text-sm">Redis Cluster</p>
                          <span className="text-emerald-600 dark:text-emerald-500 text-xs font-bold">Operational</span>
                        </div>
                        <p className="text-text-secondary dark:text-dark-text-secondary text-xs mt-0.5">Primary • US-East-1a</p>
                      </div>
                    </div>
                    {/* Status Item 2 */}
                    <div className="flex items-center gap-3 pb-3 border-b border-border dark:border-dark-border">
                      <div className="flex items-center justify-center size-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500">
                        <span className="material-symbols-outlined text-[18px]">hub</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-text-main dark:text-dark-text-main font-medium text-sm">Control Plane</p>
                          <span className="text-emerald-600 dark:text-emerald-500 text-xs font-bold">Operational</span>
                        </div>
                        <p className="text-text-secondary dark:text-dark-text-secondary text-xs mt-0.5">Fail-Open Strategy: Enabled</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Alerts */}
                <div className="rounded-xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border p-5 shadow-sm flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-text-main dark:text-dark-text-main font-bold text-lg">Live Alerts</h3>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {isAttacking && (
                      <div className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#111a22] border-l-2 border-orange-500 animate-pulse">
                        <span className="material-symbols-outlined text-orange-500 text-[20px] mt-0.5">warning</span>
                        <div>
                          <p className="text-text-main dark:text-dark-text-main text-sm font-medium">Traffic Spike Detected</p>
                          <p className="text-text-secondary dark:text-dark-text-secondary text-xs mt-1">Rule "POST /api/test" exceeded capacity.</p>
                          <p className="text-[10px] text-text-secondary/80 dark:text-text-secondary/60 mt-2">Just now</p>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#111a22] border-l-2 border-primary">
                      <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
                      <div>
                        <p className="text-text-main dark:text-dark-text-main text-sm font-medium">System Started</p>
                        <p className="text-text-secondary dark:text-dark-text-secondary text-xs mt-1">LimitGuard Daemon initialized.</p>
                        <p className="text-[10px] text-text-secondary/80 dark:text-text-secondary/60 mt-2">2 mins ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
