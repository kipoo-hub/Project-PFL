import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { slaService } from '../lib/supabaseService';
import { 
  Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  ShieldAlert, CheckCircle, Clock, Zap, Settings, ArrowRight, UserCheck
} from 'lucide-react';

const cardStyle = {
  background: 'white',
  borderRadius: 12,
  border: '1px solid var(--border-color)',
  boxShadow: 'var(--shadow-sm)',
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: 16
};

export default function SLAMonitor() {
  const [slaData, setSlaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Settings Config State
  const [config, setConfig] = useState({
    targetFirstResponse: 30,
    targetResolution: 24,
    operationalHoursStart: '08:00',
    operationalHoursEnd: '21:00'
  });

  useEffect(() => {
    loadSLA();
  }, []);

  const loadSLA = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await slaService.getAll();
      setSlaData(data);
      if (data?.config) setConfig(data.config);
    } catch (err) {
      setError('Gagal memuat data SLA. Silakan coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    alert('Pengaturan SLA berhasil disimpan!');
  };

  const handleEscalate = async (id) => {
    try {
      await slaService.escalate(id);
      await loadSLA();
      alert('Chat berhasil dieskalasikan ke dokter lain!');
    } catch (err) {
      alert('Gagal melakukan eskalasi. Silakan coba lagi.');
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Memuat data...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (!slaData) return <div style={{ padding: 20 }}>Memuat data SLA...</div>;

  const { chats, stats, doctorStats, weeklyTrend } = slaData;

  // Violating active chats (no response yet and exceed SLA threshold)
  const violatingChats = chats.filter(c => 
    c.statusChat === 'Aktif' && 
    c.firstResponseTime === null && 
    c.responseDuration > config.targetFirstResponse
  );

  const getSLABadge = (status) => {
    let colors = {};
    switch (status) {
      case 'Tepat Waktu': colors = { bg: '#e6fcf5', text: '#0ca678' }; break;
      case 'Hampir Terlambat': colors = { bg: '#fff9db', text: '#f08c00' }; break;
      case 'Terlambat': colors = { bg: '#fff5f5', text: '#e03131' }; break;
      default: colors = { bg: '#f1f3f5', text: '#495057' };
    }
    return (
      <span style={{
        fontSize: 10.5,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 12,
        background: colors.bg,
        color: colors.text
      }}>{status === 'Tepat Waktu' ? '✅ Tepat Waktu' : status === 'Hampir Terlambat' ? '⚠️ Hampir Lambat' : '❌ Terlambat'}</span>
    );
  };

  return (
    <div style={{ flex: 1, padding: 24, background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
      <PageHeader 
        title="SLA Monitor — Chat Dokter" 
        subtitle="Pantau kepatuhan waktu respons konsultasi online dokter terhadap target Service Level Agreement (SLA)." 
      />

      {/* SLA CONFIGURATION FORM */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border-color)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
          <Settings size={18} color="var(--accent-blue)" />
          <h3 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Pengaturan Target Waktu Respons (SLA)</h3>
        </div>

        <form onSubmit={handleSaveConfig} style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Target Respon Pertama</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  value={config.targetFirstResponse}
                  onChange={e => setConfig(prev => ({ ...prev, targetFirstResponse: parseInt(e.target.value) || 0 }))}
                  style={{ width: 70, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: 12.5, outline: 'none' }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Menit</span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Target Penyelesaian</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  value={config.targetResolution}
                  onChange={e => setConfig(prev => ({ ...prev, targetResolution: parseInt(e.target.value) || 0 }))}
                  style={{ width: 70, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: 12.5, outline: 'none' }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Jam</span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Jam Operasional</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="text"
                  placeholder="08:00"
                  value={config.operationalHoursStart}
                  onChange={e => setConfig(prev => ({ ...prev, operationalHoursStart: e.target.value }))}
                  style={{ width: 70, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: 12.5, outline: 'none' }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>s/d</span>
                <input
                  type="text"
                  placeholder="21:00"
                  value={config.operationalHoursEnd}
                  onChange={e => setConfig(prev => ({ ...prev, operationalHoursEnd: e.target.value }))}
                  style={{ width: 70, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: 12.5, outline: 'none' }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>WIB</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '7px 16px',
              borderRadius: 6,
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent-blue), #4c6ef5)',
              color: 'white',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              height: 32,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            Simpan Pengaturan
          </button>
        </form>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        <div style={cardStyle}>
          <div style={{
            background: stats.complianceRate >= 90 ? 'var(--accent-teal-light)' : '#fff9db',
            color: stats.complianceRate >= 90 ? 'var(--accent-teal)' : '#f08c00',
            width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>SLA Compliance Rate</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{stats.complianceRate}%</div>
            <div style={{ fontSize: 10, color: stats.complianceRate >= 90 ? 'var(--accent-teal)' : '#f08c00', fontWeight: 600 }}>Target: &gt;90%</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ background: '#e6fcf5', color: '#0ca678', width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Tepat Waktu</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{stats.compliantCount} Chat</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Respons &lt; {config.targetFirstResponse} Menit</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ background: '#fff5f5', color: '#e03131', width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Terlambat Direspons</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{stats.lateCount} Chat</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Respons &gt; {config.targetFirstResponse} Menit</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ background: '#e7f5ff', color: '#1c7ed6', width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Rerata Waktu Respons</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{stats.avgResponseTime} Menit</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Respons pertama dokter</div>
          </div>
        </div>
      </div>

      {/* URGENT ESCALATION BANNER SECTION */}
      {violatingChats.length > 0 && (
        <div style={{
          background: '#fff5f5',
          border: '1.5px solid #ffc9c9',
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c92a2a' }}>
            <ShieldAlert size={20} />
            <span style={{ fontSize: 13, fontWeight: 800 }}>ESKALASI MENDESAK: {violatingChats.length} Chat Dokter Belum Direspons &gt; {config.targetFirstResponse} Menit!</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {violatingChats.map(c => (
              <div 
                key={c.id}
                style={{
                  background: 'white',
                  borderRadius: 8,
                  padding: '10px 16px',
                  border: '1px solid #ffdeeb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 12.5
                }}
              >
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>#{c.id} · {c.ownerName}</strong> ({c.petName})
                  <span style={{ margin: '0 8px', color: '#ced4da' }}>|</span>
                  Dokter Penanggung Jawab: <strong style={{ color: '#c92a2a' }}>{c.doctorName}</strong>
                  <span style={{ margin: '0 8px', color: '#ced4da' }}>|</span>
                  Waktu Masuk: {c.chatReceivedTime} (<span style={{ color: '#c92a2a', fontWeight: 600 }}>Tunggu: {c.responseDuration} Menit</span>)
                </div>
                
                <button
                  onClick={() => handleEscalate(c.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#e03131',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Zap size={10} /> Eskalasi ke Dokter Lain
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main SLA Table & Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
        
        {/* Left Table: SLA Chat Logs */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>
            Log Kepatuhan SLA Chat Konsultasi
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid var(--border-color)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {['ID Chat', 'Member & Hewan', 'Dokter', 'Waktu Masuk', 'Respon Pertama', 'Durasi', 'Status SLA', 'Chat'].map(col => (
                    <th key={col} style={{ padding: '12px 18px' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chats.map((c, idx) => (
                  <tr key={c.id} style={{ borderBottom: idx < chats.length - 1 ? '1px solid var(--border-color)' : 'none', fontSize: 12.5 }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-primary)' }}>#{c.id}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 650 }}>{c.ownerName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Pet: {c.petName} {c.isEscalated && <span style={{ color: '#e03131', fontWeight: 600 }}>(Eskalasi)</span>}</div>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600 }}>{c.doctorName}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>{c.chatReceivedTime}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>{c.firstResponseTime || 'Belum direspons'}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: c.statusSLA === 'Terlambat' ? '#c92a2a' : 'var(--text-primary)' }}>
                      {c.responseDuration} Menit
                    </td>
                    <td style={{ padding: '14px 18px' }}>{getSLABadge(c.statusSLA)}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: 10.5,
                        fontWeight: 600,
                        background: c.statusChat === 'Selesai' ? '#f1f3f5' : '#e7f5ff',
                        color: c.statusChat === 'Selesai' ? '#868e96' : '#1c7ed6'
                      }}>
                        {c.statusChat}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Columns: Dokter & Tren Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Chart 1: SLA Performance per Dokter */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 overflow-hidden">
            <div className="pb-2">
              <h3 className="text-sm font-bold text-slate-800">SLA Kepatuhan Dokter (%)</h3>
              <p className="text-xs text-slate-500">Persentase respons cepat per dokter</p>
            </div>
            <div className="pb-2 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={doctorStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10.5} />
                  <YAxis tickLine={false} axisLine={false} fontSize={10.5} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="complianceRate" fill="#3b5bdb" radius={[4, 4, 0, 0]} barSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: SLA Tren per Minggu */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 overflow-hidden">
            <div className="pb-2">
              <h3 className="text-sm font-bold text-slate-800">Tren SLA Mingguan (%)</h3>
              <p className="text-xs text-slate-500">Kepatuhan SLA 8 minggu terakhir</p>
            </div>
            <div className="pb-2 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={10.5} />
                  <YAxis tickLine={false} axisLine={false} fontSize={10.5} domain={[70, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke="#0ca678" strokeWidth={2.5} dot={{ r: 3, fill: '#0ca678' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
