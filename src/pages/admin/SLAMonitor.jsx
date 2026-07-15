import React, { useState, useEffect } from 'react';
import { slaService } from '../../lib/supabaseService';
import PageHeader from '../../components/PageHeader';
import { AlertTriangle, ShieldCheck, Clock, Zap, RefreshCw } from 'lucide-react';

export default function SLAMonitor() {
  const [data, setData] = useState({ chats: [], stats: {}, doctorStats: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSLA = async () => {
    try {
      setLoading(true);
      const res = await slaService.getAll();
      setData(res);
    } catch (err) {
      setError('Gagal memuat data SLA');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSLA();
  }, []);

  const handleEscalate = async (id) => {
    try {
      const success = await slaService.escalate(id);
      if (success) {
        alert('Chat berhasil dieskalasi ke dokter pendamping');
        fetchSLA();
      } else {
        alert('Gagal melakukan eskalasi');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat eskalasi');
    }
  };

  const { stats = {}, doctorStats = [], chats = [] } = data;

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#F7F8FC' }}>
      <PageHeader title="SLA Monitor" subtitle="Pantau kepatuhan waktu respon chat dokter terhadap pasien." />

      {/* SLA KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Kepatuhan SLA (Compliance)', value: `${stats.complianceRate || 0}%`, subtitle: 'Target: > 90%', icon: ShieldCheck, bg: '#ECFDF5', color: '#10B981' },
          { label: 'Rata-rata Respon', value: `${stats.avgResponseTime || 0} menit`, subtitle: 'Target: < 30 menit', icon: Clock, bg: '#EFF6FF', color: '#3B82F6' },
          { label: 'Pelanggaran SLA', value: stats.violationsCount || 0, subtitle: 'Chat aktif terlambat', icon: AlertTriangle, bg: '#FEE2E2', color: '#EF4444' },
          { label: 'Tepat Waktu', value: `${stats.compliantCount || 0} / ${chats.length}`, subtitle: 'Total chat selesai', icon: ShieldCheck, bg: '#EEF2FF', color: '#4F46E5' },
        ].map((card, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{card.label}</span>
              <h2 style={{ margin: '6px 0 2px 0', fontSize: 26, fontWeight: 800, color: '#111827' }}>{card.value}</h2>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{card.subtitle}</span>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
              <card.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Doctor Performance Summary */}
      <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Performa Waktu Respon Dokter</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {doctorStats.map((doc, idx) => (
            <div key={idx} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, background: '#F9FAFB' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: 15, fontWeight: 700 }}>{doc.name}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Tingkat Kepatuhan:</span>
                  <strong style={{ color: doc.complianceRate >= 90 ? '#10B981' : '#F59E0B' }}>{doc.complianceRate}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Rata-rata Respon:</span>
                  <strong>{doc.avgResponseTime} menit</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Total Konsultasi:</span>
                  <strong>{doc.totalChats} chat</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SLA Incidents / Live Chats Table */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Pemantauan SLA Obrolan</h3>
          <button onClick={fetchSLA} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: 20, color: '#6B7280' }}>Memuat data...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>Member / Hewan</th>
                  <th style={{ padding: '12px 16px' }}>Dokter</th>
                  <th style={{ padding: '12px 16px' }}>Chat Masuk</th>
                  <th style={{ padding: '12px 16px' }}>Waktu Respon</th>
                  <th style={{ padding: '12px 16px' }}>Status SLA</th>
                  <th style={{ padding: '12px 16px' }}>Status Chat</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Eskalasi</th>
                </tr>
              </thead>
              <tbody>
                {chats.map(chat => {
                  const statusColors = {
                    'Tepat Waktu': { bg: '#D1FAE5', text: '#059669' },
                    'Terlambat': { bg: '#FEE2E2', text: '#DC2626' },
                  }[chat.statusSLA] || { bg: '#F3F4F6', text: '#374151' };

                  return (
                    <tr key={chat.id} style={{ borderBottom: '1px solid #E5E7EB', verticalAlign: 'middle' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600 }}>{chat.ownerName}</div>
                        <span style={{ fontSize: 12, color: '#6B7280' }}>🐶 {chat.petName}</span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {chat.doctorName}
                        {chat.isEscalated && <span style={{ fontSize: 10, marginLeft: 6, padding: '1px 5px', borderRadius: 4, background: '#EFF6FF', color: '#3B82F6', fontWeight: 600 }}>Escalated</span>}
                      </td>
                      <td style={{ padding: '16px' }}>{chat.chatReceivedTime}</td>
                      <td style={{ padding: '16px' }}>
                        {chat.firstResponseTime ? `${chat.responseDuration} menit` : '-'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: statusColors.bg, color: statusColors.text, fontSize: 11, fontWeight: 700 }}>
                          {chat.statusSLA}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: 12, color: chat.statusChat === 'Aktif' ? '#10B981' : '#6B7280', fontWeight: 600 }}>
                          {chat.statusChat === 'Aktif' ? '● Aktif' : 'Selesai'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        {chat.statusSLA === 'Terlambat' && chat.statusChat === 'Aktif' && (
                          <button onClick={() => handleEscalate(chat.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F59E0B', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, boxShadow: '0 2px 4px rgba(245,158,11,0.2)' }}>
                            <Zap size={12} /> Eskalasi
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {chats.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF' }}>Tidak ada riwayat chat SLA hari ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
