import React, { useState } from 'react';
import {
  Megaphone, Zap, BarChart2, Plus, Play, Pause, CheckCircle,
  Clock, Send, Mail, MessageSquare, Smartphone, Target,
  TrendingUp, Eye, MousePointer, ChevronRight, Edit2, Trash2,
  PawPrint, Calendar, DollarSign, Users,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { campaigns, triggerRules, performanceData } from '../data/marketing';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// ─── Shared Styles ─────────────────────────────────────────────────────────────
const card = {
  background: 'var(--bg-card)',
  borderRadius: 'var(--radius-md)',
  padding: '20px 22px',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--border-color)',
};

const badge = (color, bg) => ({
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '3px 10px', borderRadius: 20, fontSize: 11,
  fontWeight: 600, color, background: bg,
});

const statusMap = {
  Aktif:   { color: '#0ca678', bg: '#e6fcf5' },
  Selesai: { color: '#3b5bdb', bg: '#eef2ff' },
  Draft:   { color: '#94a3b8', bg: '#f1f5f9' },
  Dijeda:  { color: '#f76707', bg: '#fff4e6' },
  Nonaktif: { color: '#94a3b8', bg: '#f1f5f9' },
};

const channelIcon = { Email: Mail, WhatsApp: MessageSquare, SMS: Smartphone };
const channelColor = { Email: '#3b5bdb', WhatsApp: '#25D366', SMS: '#f76707' };

const formatRp = (v) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

// ─── Tab: Campaign Management ──────────────────────────────────────────────────
const CampaignTab = () => {
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Semua');

  const filtered = filterStatus === 'Semua'
    ? campaigns
    : campaigns.filter(c => c.status === filterStatus);

  return (
    <div style={{ display: 'flex', gap: 20, height: '100%' }}>
      {/* List */}
      <div style={{ flex: 1 }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button id="btn-new-campaign" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: '#1e293b', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={15} /> Kampanye Baru
          </button>
          <div style={{ flex: 1 }} />
          {['Semua', 'Aktif', 'Draft', 'Dijeda', 'Selesai'].map(s => (
            <button
              key={s}
              id={`filter-campaign-${s.toLowerCase()}`}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600,
                background: filterStatus === s ? '#1e293b' : '#f1f5f9',
                color: filterStatus === s ? '#fff' : '#64748b',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Campaign Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(c => {
            const ChannelIcon = channelIcon[c.tipe] || Mail;
            const st = statusMap[c.status] || statusMap.Draft;
            const openRate = c.terkirim > 0 ? Math.round((c.dibuka / c.terkirim) * 100) : 0;
            const konversiRate = c.dibuka > 0 ? Math.round((c.konversi / c.dibuka) * 100) : 0;
            const isSelected = selected?.id === c.id;

            return (
              <div
                key={c.id}
                id={`campaign-card-${c.id.toLowerCase()}`}
                onClick={() => setSelected(isSelected ? null : c)}
                style={{
                  ...card,
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid #3b5bdb' : '1px solid var(--border-color)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: channelColor[c.tipe] + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ChannelIcon size={18} color={channelColor[c.tipe]} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{c.nama}</span>
                      <span style={badge(st.color, st.bg)}>{c.status}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {c.tanggalMulai} — {c.tanggalAkhir}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>{c.deskripsi}</p>
                    <div style={{ display: 'flex', gap: 24 }}>
                      {[
                        { label: 'Target', val: c.target, icon: Target },
                        { label: 'Terkirim', val: c.terkirim, icon: Send },
                        { label: 'Open Rate', val: `${openRate}%`, icon: Eye },
                        { label: 'Konversi', val: `${konversiRate}%`, icon: MousePointer },
                        { label: 'Anggaran', val: formatRp(c.anggaran), icon: DollarSign },
                      ].map(m => (
                        <div key={m.label}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{m.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}><Edit2 size={14} /></button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}><Trash2 size={14} /></button>
                  </div>
                </div>
                {/* Progress Bar */}
                {c.terkirim > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                      <span>Progress Pengiriman</span>
                      <span>{Math.round((c.terkirim / c.target) * 100)}%</span>
                    </div>
                    <div style={{ height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (c.terkirim / c.target) * 100)}%`, background: channelColor[c.tipe], borderRadius: 4, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Tab: Trigger Rules ────────────────────────────────────────────────────────
const TriggerTab = () => {
  const [rules, setRules] = useState(triggerRules);

  const toggleStatus = (id) => {
    setRules(prev => prev.map(r =>
      r.id === id ? { ...r, status: r.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : r
    ));
  };

  const eventIcons = {
    'Jatuh Tempo Vaksin': '💉',
    'Ulang Tahun Hewan': '🎂',
    'Selesai Operasi': '🏥',
    'Tidak Ada Kunjungan': '📅',
    'Jadwal Kontrol': '🔔',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Atur trigger otomatis untuk kampanye berbasis event. Setiap trigger berjalan otomatis tanpa intervensi manual.
        </p>
        <button id="btn-new-trigger" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: '#1e293b', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <Plus size={15} /> Trigger Baru
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {rules.map(r => (
          <div key={r.id} style={{ ...card, opacity: r.status === 'Nonaktif' ? 0.65 : 1, transition: 'opacity 0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{eventIcons[r.event] || '⚡'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{r.nama}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Event: {r.event}</div>
                </div>
              </div>
              {/* Toggle Switch */}
              <div
                id={`toggle-trigger-${r.id.toLowerCase()}`}
                onClick={() => toggleStatus(r.id)}
                style={{
                  width: 42, height: 22, borderRadius: 11,
                  background: r.status === 'Aktif' ? '#0ca678' : '#e2e8f0',
                  cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: r.status === 'Aktif' ? 22 : 3,
                  width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.3s',
                }} />
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Kondisi</div>
              <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{r.kondisi}</div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Aksi → {r.aksi}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                "{r.template.substring(0, 90)}..."
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Terpicu</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{r.terpicu}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Konversi</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0ca678' }}>{r.konversi}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Terakhir</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{r.terakhirTerpicu}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Tab: Marketing Performance ────────────────────────────────────────────────
const PerformanceTab = () => {
  const { monthlySummary, channelBreakdown, kpi } = performanceData;

  const kpiCards = [
    { label: 'Total Pesan Terkirim', val: kpi.totalTerkirim.toLocaleString('id-ID'), icon: Send, color: '#3b5bdb', bg: '#eef2ff' },
    { label: 'Rata-rata Open Rate', val: `${kpi.rataOpenRate}%`, icon: Eye, color: '#0ca678', bg: '#e6fcf5' },
    { label: 'Rata-rata Konversi', val: `${kpi.rataKonversi}%`, icon: MousePointer, color: '#f76707', bg: '#fff4e6' },
    { label: 'Rata-rata ROI', val: `${kpi.totalROI}%`, icon: TrendingUp, color: '#7048e8', bg: '#f3f0ff' },
  ];

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {kpiCards.map(k => (
          <div key={k.label} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={20} color={k.color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{k.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        {/* Bar Chart */}
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Tren Kampanye Bulanan</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Perbandingan terkirim, dibuka, dan konversi</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySummary} barGap={4} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip />
              <Bar dataKey="terkirim" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Terkirim" />
              <Bar dataKey="dibuka" fill="#3b5bdb" radius={[4, 4, 0, 0]} name="Dibuka" />
              <Bar dataKey="konversi" fill="#0ca678" radius={[4, 4, 0, 0]} name="Konversi" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center' }}>
            {[['#e2e8f0', 'Terkirim'], ['#3b5bdb', 'Dibuka'], ['#0ca678', 'Konversi']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} /> {l}
              </div>
            ))}
          </div>
        </div>

        {/* Channel Breakdown */}
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Distribusi Channel</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Proporsi penggunaan per channel</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={channelBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                paddingAngle={4} dataKey="persentase">
                {channelBreakdown.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {channelBreakdown.map(c => (
              <div key={c.channel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c.color }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.channel}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{c.persentase}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Marketing Page ────────────────────────────────────────────────────────
const tabs = [
  { id: 'kampanye', label: 'Campaign Management', icon: Megaphone },
  { id: 'trigger', label: 'Event Trigger', icon: Zap },
  { id: 'performa', label: 'Marketing Optimization', icon: BarChart2 },
];

const Marketing = () => {
  const [activeTab, setActiveTab] = useState('kampanye');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24, overflowY: 'auto', background: 'var(--bg-app)' }}>
      <PageHeader
        title="Marketing Automation"
        subtitle="Kelola kampanye, trigger otomatis, dan pantau performa marketing klinik hewan Anda."
        actions={[
          { label: 'Export Laporan', variant: 'secondary' },
        ]}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              id={`tab-marketing-${t.id}`}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 7, border: 'none',
                background: isActive ? '#fff' : 'transparent',
                color: isActive ? '#1e293b' : '#64748b',
                fontWeight: isActive ? 600 : 500, fontSize: 13,
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'kampanye' && <CampaignTab />}
      {activeTab === 'trigger' && <TriggerTab />}
      {activeTab === 'performa' && <PerformanceTab />}
    </div>
  );
};

export default Marketing;
