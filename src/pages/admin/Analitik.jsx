import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Analitik() {
  const [stats, setStats] = useState({ totalRevenue: 0, pendingRevenue: 0, totalPatients: 0, totalAppointments: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch some counts from database
      const { count: patientCount } = await supabase.from('pasien').select('*', { count: 'exact', head: true });
      const { count: aptCount } = await supabase.from('jadwal_temu').select('*', { count: 'exact', head: true });
      const { data: bills } = await supabase.from('bills').select('amount, status');

      let lunas = 0;
      let pending = 0;
      if (bills) {
        bills.forEach(b => {
          if (b.status === 'Lunas') lunas += parseFloat(b.amount || 0);
          else pending += parseFloat(b.amount || 0);
        });
      }

      setStats({
        totalRevenue: lunas,
        pendingRevenue: pending,
        totalPatients: patientCount || 0,
        totalAppointments: aptCount || 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Jan', Pendapatan: 4000000, Kunjungan: 24 },
    { name: 'Feb', Pendapatan: 5500000, Kunjungan: 30 },
    { name: 'Mar', Pendapatan: 4800000, Kunjungan: 28 },
    { name: 'Apr', Pendapatan: 7000000, Kunjungan: 35 },
    { name: 'May', Pendapatan: 8500000, Kunjungan: 45 },
    { name: 'Jun', Pendapatan: 9000000, Kunjungan: 52 },
  ];

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#F7F8FC' }}>
      <PageHeader title="Analitik & Laporan" subtitle="Laporan visual mengenai performa bisnis, kunjungan medis, dan keuangan klinik." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Pendapatan', value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.totalRevenue), color: '#10B981', icon: DollarSign },
          { label: 'Tagihan Tertunda', value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.pendingRevenue), color: '#F59E0B', icon: DollarSign },
          { label: 'Total Pasien Terdaftar', value: `${stats.totalPatients} Ekor`, color: '#3B82F6', icon: BarChart3 },
          { label: 'Jadwal Temu Sukses', value: `${stats.totalAppointments} Janji`, color: '#8B5CF6', icon: Calendar },
        ].map((card, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{card.label}</span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: 22, fontWeight: 800, color: card.color }}>{card.value}</h3>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
              <card.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Revenue Graph */}
        <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Pendapatan Bulanan (Rupiah)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Pendapatan" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visit Volume Graph */}
        <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Volume Kunjungan Medis</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Kunjungan" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
