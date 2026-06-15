import { useState, useEffect } from 'react';
import {
  Bar, BarChart, Line, LineChart, Pie, PieChart, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Users, CalendarCheck, DollarSign, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import { crmState } from '../lib/crmState';

import PageHeader from '../components/PageHeader';
import KpiCard from '../components/DataDisplay/KpiCard';
import StatusBadge from '../components/DataDisplay/StatusBadge';
import { 
  monthlyAppointments, 
  revenueData, 
  speciesData, 
  recentAppointments 
} from '../data/dashboard';

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const [crmStats, setCrmStats] = useState({
    vaccinesExpiring: 0,
    pendingFollowups: 0,
    pipelineDistribution: []
  });

  useEffect(() => {
    crmState.init();
    setCrmStats(crmState.getCRMStats());

    const handleStorage = () => {
      setCrmStats(crmState.getCRMStats());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-50/50 gap-6">
      <PageHeader
        title="Dashboard PetCare Clinic"
        subtitle="Selamat datang kembali, Dr. Taufiq! Berikut ringkasan klinik hari ini."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Pasien" value="1.284" subtitle="Pasien terdaftar" icon={Users} trend="up" trendValue="+12%" />
        <KpiCard title="Kunjungan Hari Ini" value="18" subtitle="6 tersisa hari ini" icon={CalendarCheck} trend="up" trendValue="+8%" />
        <KpiCard title="Pendapatan Bulan Ini" value="Rp 31,2 Jt" subtitle="Target: Rp 35 Jt" icon={DollarSign} trend="up" trendValue="+20%" />
        <KpiCard title="Kasus Kritis" value="3" subtitle="Perlu penanganan segera" icon={AlertTriangle} trend="down" trendValue="-2" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart: Monthly Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div className="pb-2">
            <h3 className="text-base font-semibold text-slate-800">Kunjungan per Bulan</h3>
            <p className="text-xs text-slate-500">Tahun 2025</p>
          </div>
          <div className="flex-1 pb-2">
            <div className="h-[320px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyAppointments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} dy={10} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }} 
                    contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px', fontSize: '11px' }} 
                  />
                  <Bar dataKey="jumlah" fill="#3b5bdb" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Line Chart: Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div className="pb-2">
            <h3 className="text-base font-semibold text-slate-800">Tren Pendapatan</h3>
            <p className="text-xs text-slate-500">11 bulan terakhir</p>
          </div>
          <div className="flex-1 pb-2">
            <div className="h-[320px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="bulan" tickLine={false} axisLine={false} fontSize={11} dy={10} />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    fontSize={11} 
                    width={45}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}Jt`} 
                  />
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px', fontSize: '11px' }} 
                    formatter={(value) => [`Rp ${value.toLocaleString()}`, 'Pendapatan']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pendapatan" 
                    stroke="#0ca678" 
                    strokeWidth={2.5} 
                    dot={{ r: 4, fill: "#0ca678", strokeWidth: 2 }} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pie Chart: Species */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div className="pb-0">
            <h3 className="text-base font-semibold text-slate-800">Distribusi Spesies</h3>
            <p className="text-xs text-slate-500">Dari total pasien</p>
          </div>
          <div className="flex-1 flex flex-col justify-center pb-2 mt-4">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px', fontSize: '11px' }} 
                  />
                  <Pie
                    data={speciesData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                  >
                    {speciesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-y-3 gap-x-2 px-2">
              {speciesData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs font-medium text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distribusi Member per Pipeline Stage */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 w-full mb-4">
        <div className="pb-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Distribusi Member per Pipeline Stage
          </h3>
          <p className="text-xs text-slate-500">Jumlah pelanggan pada setiap tahap siklus hidup</p>
        </div>
        <div className="h-[200px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={crmStats.pipelineDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} axisLine={false} width={80} />
              <Tooltip 
                contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px', fontSize: '11px' }} 
              />
              <Bar dataKey="value" fill="#3b5bdb" radius={[0, 4, 4, 0]} barSize={16}>
                {crmStats.pipelineDistribution.map((entry, index) => {
                  const colors = ['#94a3b8', '#3b5bdb', '#0ca678', '#7048e8', '#e03131'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CRM Widgets Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        {/* Widget 1 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">CRM Operasional</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Vaksin Jatuh Tempo
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">
                  {crmStats.vaccinesExpiring} Hewan
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 whitespace-nowrap">
                  7 Hari
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Follow-up Pending
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">
                  {crmStats.pendingFollowups} Pasien
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 whitespace-nowrap">
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 2 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Campaigns & Leads</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Lead Baru Hari Ini
              </span>
              <span className="text-sm font-bold text-gray-800">
                {crmStats.newLeadsToday || 0} Prospek
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Blast Bulan Ini
              </span>
              <span className="text-sm font-bold text-gray-800">
                {crmStats.blastHistoryThisMonth || 0} Kiriman
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Top Segmen
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">
                  {crmStats.topSegmentName || 'Tidak ada'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                  {crmStats.topSegmentCount || 0} Member
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 3 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Service & Queue</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Tiket Baru
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">
                  {crmStats.ticketsNew || 0} Tiket
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                  Baru
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                SLA Compliance
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">
                  {crmStats.slaRate || 100}%
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${
                  (crmStats.slaRate || 100) >= 90
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {(crmStats.slaRate || 100) >= 90 ? 'Tinggi' : 'Rendah'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Antrian Aktif
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">
                  {crmStats.activeQueue || 'A-010'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
                  {crmStats.waitingQueue || 0} Antre
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table Wrapper */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden w-full">
        {/* Header flex-row agar berdampingan rapi tanpa memencet teks */}
        <div className="flex flex-row items-center justify-between p-6 border-b border-slate-100 space-y-0">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-800">
              Jadwal Kunjungan Hari Ini
            </h3>
            <p className="text-xs text-slate-500">
              {recentAppointments.length} kunjungan terjadwal
            </p>
          </div>
          <button className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer">
            Lihat Semua <ArrowUpRight size={15} strokeWidth={2.5} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50">
                {['ID', 'Pemilik', 'Hewan', 'Spesies', 'Jenis Layanan', 'Waktu', 'Status'].map(col => (
                  <th 
                    key={col} 
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">{apt.id}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-800">{apt.pemilik}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700">{apt.hewan}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{apt.spesies}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{apt.jenis}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-800">{apt.waktu} WIB</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={apt.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;