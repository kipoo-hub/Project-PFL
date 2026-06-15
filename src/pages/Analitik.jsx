import React, { useState, useEffect } from 'react';
import { crmState } from '../lib/crmState';
import PageHeader from '../components/PageHeader';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, Users, DollarSign, Star } from 'lucide-react';
import { monthlyData, serviceData, topDokter } from '../data/analitik';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background:'white', border:'1px solid var(--border-color)', borderRadius:8, padding:'10px 14px', boxShadow:'var(--shadow-md)', fontSize:13 }}>
        <p style={{ fontWeight:600, marginBottom:4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color:p.color || p.fill }}>
            {p.dataKey==='pendapatan' ? `Rp ${p.value} Jt` : p.dataKey==='pasienBaru' ? `${p.value} pasien baru` : `${p.value} kunjungan`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Card = ({ children, style }) => (
  <div style={{ background:'white', borderRadius:12, border:'1px solid var(--border-color)', boxShadow:'var(--shadow-sm)', padding:'20px 22px', ...style }}>
    {children}
  </div>
);

const ChartTitle = ({ title, subtitle }) => (
  <div style={{ marginBottom:16 }}>
    <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>{title}</h3>
    {subtitle && <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{subtitle}</p>}
  </div>
);

const Analitik = () => {
  const [stats, setStats] = useState({ successRate: 84, avgTime: 4.2 });

  useEffect(() => {
    crmState.init();
    const s = crmState.getCRMStats();
    setStats({ successRate: s.successRate, avgTime: s.avgTime });

    const handleStorage = () => {
      const updatedStats = crmState.getCRMStats();
      setStats({ successRate: updatedStats.successRate, avgTime: updatedStats.avgTime });
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div style={{ flex:1, padding:24, background:'var(--bg-app)', overflowY:'auto' }}>
      <PageHeader title="Analitik" subtitle="Laporan dan statistik kinerja klinik hewan Anda." />

      {/* KPI Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[
          { icon:Users,        label:'Total Kunjungan',  value:'290',    sub:'5 bulan terakhir', color:'var(--accent-blue)',   bg:'var(--accent-blue-light)' },
          { icon:DollarSign,   label:'Total Pendapatan', value:'Rp 88 Jt',sub:'5 bulan terakhir',color:'var(--accent-teal)',   bg:'var(--accent-teal-light)' },
          { icon:TrendingUp,   label:'Rata-rata/Bulan',  value:'58 Kunjungan',sub:'Tren naik',    color:'var(--accent-orange)', bg:'var(--accent-orange-light)'},
          { icon:Star,         label:'Rating Kepuasan',  value:'4.8 ★',  sub:'Dari 240 ulasan', color:'var(--accent-purple)', bg:'var(--accent-purple-light)'},
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} style={{ background:'white', borderRadius:12, padding:'18px 20px', border:'1px solid var(--border-color)', boxShadow:'var(--shadow-sm)', display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:500, marginBottom:6 }}>{k.label}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)' }}>{k.value}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{k.sub}</div>
                </div>
                <div style={{ width:40, height:40, borderRadius:10, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={18} color={k.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CRM Follow-up Performance Card */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <Card>
          <ChartTitle title="Performa CRM & Follow-up Kunjungan" subtitle="Statistik keberhasilan dan efisiensi follow-up pasien klinik" />
          <div style={{ display:'flex', gap:24, alignItems:'center', padding:'10px 0' }}>
            <div style={{ textAlign:'center', flexShrink:0 }}>
              <div style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `conic-gradient(var(--accent-teal) ${stats.successRate * 3.6}deg, #f1f5f9 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                <div style={{ width: 78, height: 78, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-teal)' }}>{stats.successRate}%</span>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>BERHASIL</span>
                </div>
              </div>
            </div>
            <div style={{ flex:1 }}>
              <h4 style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>Tindak Lanjut & Kepuasan Klien</h4>
              <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.5 }}>
                Persentase kesuksesan follow-up diukur dari jumlah pasien yang dihubungi pasca kunjungan (1-3 hari) yang memberikan feedback positif atau konfirmasi jadwal kontrol kembali.
              </p>
              <div style={{ marginTop:12, display:'flex', gap:20 }}>
                <div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600 }}>RATA-RATA WAKTU RESPON</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>{stats.avgTime} Jam</div>
                </div>
                <div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600 }}>TARGET WAKTU</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'var(--accent-blue)' }}>&lt; 12 Jam</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <ChartTitle title="Efektivitas Saluran Follow-up" subtitle="Media komunikasi paling responsif untuk tindak lanjut klien" />
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:10 }}>
            {[
              { name: 'WhatsApp', pct: 74, color: '#25D366' },
              { name: 'Telepon Langsung', pct: 18, color: 'var(--accent-blue)' },
              { name: 'Email Klinik', pct: 8, color: 'var(--accent-orange)' }
            ].map(ch => (
              <div key={ch.name}>
                <div style={{ display:'flex', justifyItems:'center', justifyContent:'space-between', fontSize:11, fontWeight:600, color:'var(--text-secondary)', marginBottom:4 }}>
                  <span>{ch.name}</span>
                  <span>{ch.pct}% Respon</span>
                </div>
                <div style={{ height:6, background:'#f1f5f9', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${ch.pct}%`, background:ch.color, borderRadius:3 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <Card>
          <ChartTitle title="Kunjungan & Pendapatan per Bulan" subtitle="Perbandingan tren kunjungan dan pendapatan" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="bulan" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} width={30} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} width={40} tickFormatter={v=>`${v}Jt`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(59,91,219,0.04)' }} />
              <Bar yAxisId="left"  dataKey="kunjungan"  fill="#3b5bdb" radius={[4,4,0,0]} barSize={22} />
              <Bar yAxisId="right" dataKey="pendapatan" fill="#7048e8" radius={[4,4,0,0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle title="Pasien Baru per Bulan" subtitle="Pertumbuhan pasien baru" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ca678" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0ca678" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="bulan" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="pasienBaru" stroke="#0ca678" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ r:4, fill:'#0ca678', strokeWidth:0 }} activeDot={{ r:6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:16 }}>
        {/* Pie */}
        <Card>
          <ChartTitle title="Distribusi Layanan" subtitle="Dari total kunjungan" />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={serviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {serviceData.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
            {serviceData.map(s => (
              <div key={s.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:s.color }} />
                  <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{s.name}</span>
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)' }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Dokter */}
        <Card>
          <ChartTitle title="Performa Dokter" subtitle="Berdasarkan jumlah pasien yang ditangani" />
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {topDokter.map((d, i) => (
              <div key={d.nama}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:d.color+'22', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, color:d.color }}>
                      {d.nama.split(' ')[1][0]}{d.nama.split(' ')[2]?.[0]||''}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{d.nama}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{d.spesialis}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{d.pasien} pasien</div>
                    <div style={{ fontSize:11, color:'#f59e0b' }}>★ {d.rating}</div>
                  </div>
                </div>
                <div style={{ height:6, borderRadius:3, background:'#f0f0f0', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(d.pasien/100)*100}%`, borderRadius:3, background:d.color, transition:'width 1s' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analitik;
