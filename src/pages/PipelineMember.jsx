import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { crmState } from '../lib/crmState';
import { 
  Users, UserPlus, CheckCircle2, Star, 
  AlertTriangle, Send, Eye, ShieldAlert, ArrowRightLeft,
  Search, RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

const cardStyle = {
  background: 'white',
  borderRadius: 12,
  border: '1px solid var(--border-color)',
  boxShadow: 'var(--shadow-sm)',
  padding: '20px 22px',
};

const badgeStyle = (color, bg) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 8px',
  borderRadius: 12,
  fontSize: 10,
  fontWeight: 600,
  color,
  background: bg,
});

const stageCfg = {
  GUEST: { label: 'Guest', color: '#94a3b8', bg: '#f8fafc', icon: Users, desc: 'Pengunjung /guest' },
  BARU: { label: 'Baru', color: '#3b5bdb', bg: '#eef2ff', icon: UserPlus, desc: 'Baru daftar, 0 kunjungan' },
  AKTIF: { label: 'Aktif', color: '#0ca678', bg: '#e6fcf5', icon: CheckCircle2, desc: 'Pernah kunjungan 1-2x' },
  SETIA: { label: 'Setia', color: '#7048e8', bg: '#f3f0ff', icon: Star, desc: '3+ kunjungan (6 bln)' },
  TIDAK_AKTIF: { label: 'Tidak Aktif', color: '#e03131', bg: '#fff5f5', icon: AlertTriangle, desc: '>3 bln tanpa kunjungan' }
};

// Trend data for chart
const trendData = [
  { bulan: 'Jan', Guest: 80, Baru: 12, Aktif: 25, Setia: 8, TidakAktif: 4 },
  { bulan: 'Feb', Guest: 95, Baru: 18, Aktif: 28, Setia: 11, TidakAktif: 3 },
  { bulan: 'Mar', Guest: 110, Baru: 15, Aktif: 32, Setia: 14, TidakAktif: 5 },
  { bulan: 'Apr', Guest: 125, Baru: 22, Aktif: 30, Setia: 17, TidakAktif: 6 },
  { bulan: 'Mei', Guest: 140, Baru: 28, Aktif: 36, Setia: 20, TidakAktif: 8 },
  { bulan: 'Jun', Guest: 145, Baru: 32, Aktif: 40, Setia: 24, TidakAktif: 10 }
];

export default function PipelineMember() {
  const [pipeline, setPipeline] = useState({ GUEST: [], BARU: [], AKTIF: [], SETIA: [], TIDAK_AKTIF: [] });
  const [selectedMember, setSelectedMember] = useState(null);
  const [successToast, setSuccessToast] = useState('');
  const [activeTab, setActiveTab] = useState('board'); // 'board' or 'chart'

  useEffect(() => {
    crmState.init();
    setPipeline(crmState.getPipelineData());
  }, []);

  const handleMoveStage = (member, newStage) => {
    // Stage in state is capitalized, mapping 'Tidak Aktif' or 'TIDAK_AKTIF'
    const dbStage = newStage === 'TIDAK_AKTIF' ? 'TIDAK AKTIF' : newStage;
    const updated = crmState.moveMemberStage(member.id, dbStage);
    setPipeline(updated);
    
    // Update selected member view
    setSelectedMember({ ...member, stage: dbStage });
    setSuccessToast(`${member.name} berhasil dipindahkan ke tahap ${stageCfg[newStage].label}!`);
    
    // Notify other components/tabs
    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      setSuccessToast('');
    }, 3000);
  };

  const handleSendReminder = (member) => {
    setSuccessToast(`Reminder berhasil dikirim ke WhatsApp/Email ${member.name}!`);
    setTimeout(() => {
      setSuccessToast('');
    }, 3000);
  };

  return (
    <div style={{ flex: 1, padding: 24, background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
      <PageHeader 
        title="Pipeline Pelanggan" 
        subtitle="Visualisasi siklus hidup pelanggan (customer life-cycle stages) dari Guest hingga Member Setia." 
      />

      {/* Success Toast */}
      {successToast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: '#0ca678',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 8,
          boxShadow: 'var(--shadow-lg)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600,
          animation: 'slideIn 0.3s ease'
        }}>
          <CheckCircle2 size={18} />
          {successToast}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '2px solid var(--border-color)', paddingBottom: 0 }}>
        <button
          onClick={() => setActiveTab('board')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'board' ? '2px solid var(--accent-blue)' : '2px solid transparent',
            color: activeTab === 'board' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'board' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
            marginBottom: -2,
            transition: 'all 0.15s'
          }}
        >
          Kanban Board Pipeline
        </button>
        <button
          onClick={() => setActiveTab('chart')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'chart' ? '2px solid var(--accent-blue)' : '2px solid transparent',
            color: activeTab === 'chart' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'chart' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
            marginBottom: -2,
            transition: 'all 0.15s'
          }}
        >
          Grafik Tren Tahunan
        </button>
      </div>

      {activeTab === 'board' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Kanban Board */}
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 10 }}>
            {Object.keys(stageCfg).map(stageKey => {
              const cfg = stageCfg[stageKey];
              const members = pipeline[stageKey] || [];
              const isGuest = stageKey === 'GUEST';
              
              return (
                <div 
                  key={stageKey}
                  style={{ 
                    minWidth: 230, 
                    flex: '0 0 230px', 
                    background: '#f8fafc', 
                    borderRadius: 12, 
                    padding: 12, 
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  {/* Column Header */}
                  <div style={{ borderBottom: `2px solid ${cfg.color}`, paddingBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: cfg.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <cfg.icon size={14} /> {cfg.label}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-color)', padding: '1px 6px', borderRadius: 10 }}>
                        {isGuest ? 145 : members.length}
                      </span>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{cfg.desc}</span>
                  </div>

                  {/* Cards container */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', minHeight: 300, maxHeight: 420 }}>
                    {isGuest ? (
                      // Display simulated guest items
                      members.map((g, idx) => (
                        <div
                          key={g.id}
                          style={{
                            background: 'white',
                            borderRadius: 8,
                            padding: 12,
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-sm)',
                            fontSize: 12
                          }}
                        >
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{g.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 10.5 }}>IP: {g.ip}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 10.5 }}>Laman: {g.page}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>⏰ {g.time}</span>
                            <span style={badgeStyle('#94a3b8', '#f1f5f9')}>Belum Daftar</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      members.map(m => (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMember(m)}
                          style={{
                            background: 'white',
                            borderRadius: 8,
                            padding: 12,
                            border: selectedMember?.id === m.id ? '1.5px solid var(--accent-blue)' : '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-sm)',
                            cursor: 'pointer',
                            fontSize: 12,
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{m.name}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginBottom: 6 }}>{m.email}</div>
                          <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                            🐾 {m.pets.length > 0 ? m.pets.join(', ') : 'Belum isi data hewan'}
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}> visits: {m.visits}x</span>
                            <span style={badgeStyle(cfg.color, cfg.bg)}>
                              {cfg.label}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Member Detail Sidebar Drawer */}
          {selectedMember && (
            <div style={{ ...cardStyle, animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  👤 Detail Member Pipeline — {selectedMember.name}
                </h3>
                <button 
                  onClick={() => setSelectedMember(null)}
                  style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 700 }}
                >
                  Tutup [X]
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Email & Telepon</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{selectedMember.email}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedMember.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Terdaftar Pada</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{selectedMember.registeredAt}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Jumlah Kunjungan</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{selectedMember.visits} Kunjungan</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Daftar Hewan Peliharaan</div>
                {selectedMember.pets.length > 0 ? (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selectedMember.pets.map(p => (
                      <span key={p} style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: 6, fontSize: 12, color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                        🐾 {p}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Belum mendaftarkan hewan peliharaan.</div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleSendReminder(selectedMember)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'linear-gradient(135deg, var(--accent-blue), #4c6ef5)',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Send size={12} /> Kirim Reminder
                  </button>
                  <button
                    onClick={() => handleSendReminder(selectedMember)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'white',
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={12} /> Lihat Profil Lengkap
                  </button>
                </div>

                {/* Move Stage Selector */}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ArrowRightLeft size={13} /> Pindah Tahap:
                  </span>
                  <select
                    value={selectedMember.stage.replace(' ', '_')}
                    onChange={e => handleMoveStage(selectedMember, e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'white',
                      fontSize: 12,
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    <option value="BARU">Baru</option>
                    <option value="AKTIF">Aktif</option>
                    <option value="SETIA">Setia</option>
                    <option value="TIDAK_AKTIF">Tidak Aktif</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
          {/* Chart area */}
          <div style={cardStyle}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Grafik Pertumbuhan Tahap Pelanggan</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Jumlah member pada setiap kategori pipeline dalam 6 bulan terakhir</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorGuest" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15}/><stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorBaru" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b5bdb" stopOpacity={0.15}/><stop offset="95%" stopColor="#3b5bdb" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorAktif" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ca678" stopOpacity={0.15}/><stop offset="95%" stopColor="#0ca678" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorSetia" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7048e8" stopOpacity={0.15}/><stop offset="95%" stopColor="#7048e8" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Guest" stroke="#94a3b8" fillOpacity={1} fill="url(#colorGuest)" strokeWidth={2} />
                <Area type="monotone" dataKey="Baru" stroke="#3b5bdb" fillOpacity={1} fill="url(#colorBaru)" strokeWidth={2} />
                <Area type="monotone" dataKey="Aktif" stroke="#0ca678" fillOpacity={1} fill="url(#colorAktif)" strokeWidth={2} />
                <Area type="monotone" dataKey="Setia" stroke="#7048e8" fillOpacity={1} fill="url(#colorSetia)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown Funnel Details */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Konversi Corong (Funnel)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { name: '1. Guest (Traffic)', val: 145, pct: '100%', color: '#94a3b8' },
                { name: '2. Baru (Register)', val: 32, pct: '22%', color: '#3b5bdb' },
                { name: '3. Aktif (1+ Kunjungan)', val: 40, pct: '27%', color: '#0ca678' },
                { name: '4. Setia (3+ Kunjungan)', val: 24, pct: '16%', color: '#7048e8' },
                { name: '5. Tidak Aktif (>3 bln)', val: 10, pct: '7%', color: '#e03131' }
              ].map(f => (
                <div key={f.name}>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <span>{f.name}</span>
                    <span>{f.val} ({f.pct})</span>
                  </div>
                  <div style={{ height: 18, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '100%', width: f.pct, background: f.color, borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: 'white' }}>{f.pct}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
