import React from 'react';
import {
  Bar, BarChart, Line, LineChart, Pie, PieChart, Cell,
  XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  Users, CalendarCheck, DollarSign, AlertTriangle, ArrowUpRight,
} from 'lucide-react';

// Import Shadcn UI Chart & Card Components
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import PageHeader from '../components/PageHeader';
import KpiCard from '../components/DataDisplay/KpiCard';
import StatusBadge from '../components/DataDisplay/StatusBadge';
import { 
  monthlyAppointments, 
  revenueData, 
  speciesData, 
  recentAppointments 
} from '../data/dashboard';

// ─── Chart Configs (Shadcn UI Standard) ──────────────────────────────────────

const appointmentConfig = {
  jumlah: {
    label: "Kunjungan",
    color: "hsl(226 70% 55%)",
  },
};

const revenueConfig = {
  pendapatan: {
    label: "Pendapatan",
    color: "hsl(162 86% 35%)",
  },
};

const speciesConfig = {
  Kucing: { label: "Kucing", color: "#3b5bdb" },
  Anjing: { label: "Anjing", color: "#0ca678" },
  Burung: { label: "Burung", color: "#f59f00" },
  Lainnya: { label: "Lainnya", color: "#748ffc" },
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard = () => {
  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-50/50 gap-6">
      {/* Menggunakan gap-6 sebagai ganti space-y-6 untuk jarak vertikal yang lebih solid */}
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
        <Card className="flex flex-col shadow-sm border-slate-200 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">Kunjungan per Bulan</CardTitle>
            <CardDescription className="text-xs text-slate-500">Tahun 2025</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-6">
            <ChartContainer config={appointmentConfig} className="h-[320px] w-full mt-4">
              <BarChart data={monthlyAppointments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} dy={10} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="jumlah" fill="var(--color-jumlah)" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Line Chart: Revenue */}
        <Card className="flex flex-col shadow-sm border-slate-200 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">Tren Pendapatan</CardTitle>
            <CardDescription className="text-xs text-slate-500">11 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-6">
            <ChartContainer config={revenueConfig} className="h-[320px] w-full mt-4">
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
                <ChartTooltip content={<ChartTooltipContent indicator="line" labelFormatter={(v) => `Bulan ${v}`} />} />
                <Line 
                  type="monotone" 
                  dataKey="pendapatan" 
                  stroke="var(--color-pendapatan)" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: "var(--color-pendapatan)", strokeWidth: 2 }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart: Species */}
        <Card className="flex flex-col shadow-sm border-slate-200 overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold text-slate-800">Distribusi Spesies</CardTitle>
            <CardDescription className="text-xs text-slate-500">Dari total pasien</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center pb-6 mt-4">
            <ChartContainer config={speciesConfig} className="h-[220px] w-full">
              <PieChart margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
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
            </ChartContainer>
            <div className="mt-8 grid grid-cols-2 gap-y-3 gap-x-2 px-2">
              {speciesData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs font-medium text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Table Wrapper */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        {/* Header flex-row agar berdampingan rapi tanpa memencet teks */}
        <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-100 space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-slate-800">
              Jadwal Kunjungan Hari Ini
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {recentAppointments.length} kunjungan terjadwal
            </CardDescription>
          </div>
          <button className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-colors">
            Lihat Semua <ArrowUpRight size={15} strokeWidth={2.5} />
          </button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/50">
                  {['ID', 'Pemilik', 'Hewan', 'Spesies', 'Jenis Layanan', 'Waktu', 'Status'].map(col => (
                    <th 
                      key={col} 
                      className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;