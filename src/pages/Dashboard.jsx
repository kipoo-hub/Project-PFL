import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Users, CalendarCheck, DollarSign, AlertTriangle,
  TrendingUp, TrendingDown, Clock, CheckCircle2,
  XCircle, ArrowUpRight,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { monthlyAppointments, revenueData, speciesData, recentAppointments } from '../data/dashboard';
import { dashboardService } from '../lib/supabaseService';
import { supabase } from '../lib/supabase';

// ─── Sub-components ───────────────────────────────────────────────────────────
const KpiCard = ({ title, value, subtitle, icon: Icon, iconBg, iconColor, trend, trendValue }) => (
  <div style={{
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    padding: '20px 22px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    transition: 'box-shadow 0.2s, transform 0.2s',
    cursor: 'default',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 6 }}>
          {title}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</div>
        )}
      </div>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={iconColor} />
      </div>
    </div>
    {trendValue !== undefined && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          padding: '2px 8px',
          borderRadius: 20,
          background: trend === 'up' ? 'var(--accent-teal-light)' : 'var(--accent-red-light)',
          color: trend === 'up' ? 'var(--accent-teal)' : 'var(--accent-red)',
          fontSize: 12,
          fontWeight: 600,
        }}>
          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trendValue}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>vs bulan lalu</span>
      </div>
    )}
  </div>
);

const StatusBadge = ({ status }) => {
  const config = {
    'Selesai':           { bg: '#e6fcf5', color: '#0ca678', icon: CheckCircle2 },
    'Sedang Berjalan':   { bg: '#eef2ff', color: '#3b5bdb', icon: Clock },
    'Menunggu':          { bg: '#fff4e6', color: '#f76707', icon: Clock },
    'Dibatalkan':        { bg: '#fff5f5', color: '#e03131', icon: XCircle },
  };
  const c = config[status] || { bg: '#f3f4f6', color: '#6b7280', icon: Clock };
  const Icon = c.icon;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 20,
      background: c.bg,
      color: c.color,
      fontSize: 11,
      fontWeight: 600,
    }}>
      <Icon size={11} />
      {status}
    </span>
  );
};

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const ActorBadge = ({ type }) => {
  const config = {
    'admin': { bg: '#fff5f5', color: '#e03131', label: 'Admin' },
    'member': { bg: '#e6fcf5', color: '#0ca678', label: 'Member' },
    'guest': { bg: '#e8f7ff', color: '#1971c2', label: 'Guest' },
  };
  const c = config[type] || config.guest;
  return (
    <span style={{
      padding: '2px 6px',
      borderRadius: 4,
      background: c.bg,
      color: c.color,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
    }}>
      {c.label}
    </span>
  );
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m yang lalu`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}j yang lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: 'var(--shadow-md)',
        fontSize: 13,
      }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name === 'pendapatan' ? formatRupiah(p.value) : `${p.value} kunjungan`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      const { data: logsData, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (!logsData) return;

      const actorIds = [...new Set(logsData.map(l => l.actor_id).filter(Boolean))];
      if (actorIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, name')
          .in('user_id', actorIds);

        const profileMap = {};
        profilesData?.forEach(p => {
          profileMap[p.user_id] = p.name;
        });

        const enriched = logsData.map(log => ({
          ...log,
          actor_name: log.actor_id ? (profileMap[log.actor_id] || 'Member') : 'Guest'
        }));
        setLogs(enriched);
      } else {
        const enriched = logsData.map(log => ({
          ...log,
          actor_name: 'Guest'
        }));
        setLogs(enriched);
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getStats();
        setStats(data);
        await fetchLogs();
      } catch (err) {
        console.error('Gagal memuat statistik dashboard:', err);
        setError('Gagal memuat data dashboard.');
      } finally {
        setLoading(false);
      }
    };

    initDashboard();

    // Subscribe to real-time activity logs
    const logsSubscription = supabase
      .channel('activity_logs_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(logsSubscription);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Memuat data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ color: 'var(--accent-red)', fontSize: 14 }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: 24,
      overflowY: 'auto',
      background: 'var(--bg-app)',
    }}>
      <PageHeader
        title="Dashboard Veterinario"
        subtitle="Selamat datang kembali, Dr. Rizal! Berikut ringkasan klinik hari ini."
      />

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <KpiCard
          title="Total Pasien"
          value={stats?.totalPasien ?? '-'}
          subtitle="Pasien terdaftar"
          icon={Users}
          iconBg="var(--accent-blue-light)"
          iconColor="var(--accent-blue)"
          trend="up"
          trendValue="+12%"
        />
        <KpiCard
          title="Kunjungan Hari Ini"
          value={stats?.kunjunganHariIni ?? '-'}
          subtitle={stats?.sisaHariIni != null ? `${stats.sisaHariIni} tersisa hari ini` : ''}
          icon={CalendarCheck}
          iconBg="var(--accent-teal-light)"
          iconColor="var(--accent-teal)"
          trend="up"
          trendValue="+8%"
        />
        <KpiCard
          title="Pendapatan Bulan Ini"
          value={stats?.pendapatanBulanIni != null ? formatRupiah(stats.pendapatanBulanIni) : '-'}
          subtitle={stats?.targetPendapatan != null ? `Target: ${formatRupiah(stats.targetPendapatan)}` : ''}
          icon={DollarSign}
          iconBg="var(--accent-orange-light)"
          iconColor="var(--accent-orange)"
          trend="up"
          trendValue="+20%"
        />
        <KpiCard
          title="Kasus Kritis"
          value={stats?.kasusKritis ?? '-'}
          subtitle="Perlu penanganan segera"
          icon={AlertTriangle}
          iconBg="var(--accent-red-light)"
          iconColor="var(--accent-red)"
          trend="down"
          trendValue="-2"
        />
      </div>

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 340px',
        gap: 16,
        marginBottom: 24,
      }}>
        {/* Bar Chart: Monthly Appointments */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 22px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Kunjungan per Bulan
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Tahun 2025
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyAppointments} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,91,219,0.05)' }} />
              <Bar dataKey="jumlah" fill="#3b5bdb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart: Revenue */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 22px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Tren Pendapatan
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              11 bulan terakhir
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={50}
                tickFormatter={v => `${(v / 1000000).toFixed(0)}Jt`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="pendapatan"
                stroke="#0ca678"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0ca678', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Species */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 22px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Distribusi Spesies
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Dari total pasien
            </p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={speciesData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {speciesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {speciesData.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid for Appointments & Logs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 16,
        alignItems: 'start',
      }}>
        {/* Appointments Table Card */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          minHeight: 400,
        }}>
          {/* Table Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Jadwal Kunjungan Hari Ini
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {recentAppointments.length} kunjungan terjadwal
              </p>
            </div>
            <button
              id="dashboard-see-all-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: 'var(--accent-blue-light)',
                color: 'var(--accent-blue)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#dde4ff'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-blue-light)'}
            >
              Lihat Semua
              <ArrowUpRight size={13} />
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  {['ID', 'Pemilik', 'Hewan', 'Spesies', 'Jenis Layanan', 'Waktu', 'Status'].map(col => (
                    <th key={col} style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '1px solid var(--border-color)',
                      whiteSpace: 'nowrap',
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((apt, i) => (
                  <tr
                    key={apt.id}
                    style={{
                      borderBottom: i < recentAppointments.length - 1 ? '1px solid var(--border-color)' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {apt.id}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {apt.pemilik}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                      {apt.hewan}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                      {apt.spesies}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                      {apt.jenis}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {apt.waktu} WIB
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={apt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Logs Card */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
          padding: '20px 22px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 400,
          boxSizing: 'border-box',
        }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Log Aktivitas Terbaru
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Aktivitas guest & member real-time
            </p>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            overflowY: 'auto',
            maxHeight: 340,
            paddingRight: 4,
          }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #f1f5f9',
                  background: '#fafbfc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.actor_name}</span>
                    <ActorBadge type={log.actor_type} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTimeAgo(log.created_at)}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {log.action}
                </div>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div style={{ fontSize: 11, color: '#64748b', background: '#f8fafc', padding: '4px 8px', borderRadius: 4, marginTop: 2, fontFamily: 'monospace' }}>
                    {Object.entries(log.metadata).map(([key, val]) => `${key}: ${val}`).join(', ')}
                  </div>
                )}
              </div>
            ))}
            {logs.length === 0 && (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Belum ada aktivitas tercatat.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;