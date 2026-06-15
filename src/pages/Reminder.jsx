import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { crmState } from '../lib/crmState';
import { 
  Bell, Clock, CheckCircle2, MessageSquare, 
  Send, ShieldAlert, Calendar, Search, AlertCircle
} from 'lucide-react';

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
  gap: 5,
  padding: '3px 10px',
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  color,
  background: bg,
});

export default function Reminder() {
  const [vaccines, setVaccines] = useState([]);
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [sendingId, setSendingId] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    crmState.init();
    setVaccines(crmState.getVaccines());
  }, []);

  const handleSendReminder = (item) => {
    setSendingId(item.id);
    // Simulate sending network request (500ms)
    setTimeout(() => {
      const updated = crmState.sendVaccineReminder(item.id);
      setVaccines(updated);
      setSendingId(null);
      setSuccessToast(`Reminder Vaksin berhasil dikirim ke WhatsApp/Email ${item.ownerName}!`);
      
      // Dispatch storage event to sync other tabs/components
      window.dispatchEvent(new Event('storage'));

      // Auto dismiss toast
      setTimeout(() => {
        setSuccessToast('');
      }, 4000);
    }, 800);
  };

  const getUrgencyColor = (days) => {
    if (days < 0) return { text: '#e03131', bg: '#fff5f5', label: 'Terlambat' };
    if (days === 1) return { text: '#e03131', bg: '#fff5f5', label: '1 Hari Lagi' };
    if (days <= 3) return { text: '#f76707', bg: '#fff4e6', label: `${days} Hari Lagi` };
    if (days <= 7) return { text: '#b25e00', bg: '#fff9db', label: `${days} Hari Lagi` };
    return { text: '#0ca678', bg: '#e6fcf5', label: `${days} Hari Lagi` };
  };

  const filtered = vaccines.filter(v => {
    const matchesSearch = v.petName.toLowerCase().includes(search.toLowerCase()) || 
                          v.ownerName.toLowerCase().includes(search.toLowerCase()) ||
                          v.vaccineType.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'Semua') return matchesSearch;
    if (filter === 'Belum Diingatkan') return matchesSearch && v.status === 'Belum Diingatkan';
    if (filter === 'Sudah Diingatkan') return matchesSearch && v.status === 'Sudah Diingatkan';
    return matchesSearch;
  });

  const totalBelum = vaccines.filter(v => v.status === 'Belum Diingatkan').length;
  const totalSudah = vaccines.filter(v => v.status === 'Sudah Diingatkan').length;

  return (
    <div style={{ flex: 1, padding: 24, background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
      <PageHeader 
        title="Notifikasi & Reminder" 
        subtitle="Mendeteksi otomatis hewan peliharaan member yang vaksinnya akan jatuh tempo." 
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

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={20} color="var(--accent-blue)" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL JATUH TEMPO</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{vaccines.length}</div>
          </div>
        </div>
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} color="var(--accent-red)" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>BELUM DIINGATKAN</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-red)' }}>{totalBelum}</div>
          </div>
        </div>
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} color="var(--accent-teal)" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>SUDAH DIINGATKAN</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-teal)' }}>{totalSudah}</div>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['Semua', 'Belum Diingatkan', 'Sudah Diingatkan'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: filter === tab ? '#1e293b' : '#f1f5f9',
                  color: filter === tab ? 'white' : '#64748b',
                  transition: 'all 0.2s'
                }}
              >
                {tab} {tab === 'Belum Diingatkan' ? `(${totalBelum})` : tab === 'Sudah Diingatkan' ? `(${totalSudah})` : `(${vaccines.length})`}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari hewan, pemilik, atau vaksin..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                fontSize: 13,
                outline: 'none',
                background: 'white',
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['Hewan & Pemilik', 'Jenis Vaksin', 'Jatuh Tempo', 'Sisa Waktu', 'Status', 'Aksi'].map((col) => (
                  <th key={col} style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                    <p style={{ fontSize: 13 }}>Tidak ada notifikasi vaksin yang cocok.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const urgency = getUrgencyColor(item.daysRemaining);
                  const isBelum = item.status === 'Belum Diingatkan';
                  const isSending = sendingId === item.id;
                  
                  return (
                    <tr key={item.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-color)' : 'none', background: 'transparent' }}>
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>{item.petName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.ownerName} • {item.phone}</div>
                      </td>
                      <td style={{ padding: '16px 18px', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                        {item.vaccineType}
                      </td>
                      <td style={{ padding: '16px 18px', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={13} color="#94a3b8" />
                          {item.dueDate}
                        </div>
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <span style={badgeStyle(urgency.text, urgency.bg)}>
                          {urgency.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <span style={badgeStyle(
                          isBelum ? 'var(--accent-red)' : 'var(--accent-teal)',
                          isBelum ? 'var(--accent-red-light)' : 'var(--accent-teal-light)'
                        )}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <button
                          disabled={!isBelum || isSending}
                          onClick={() => handleSendReminder(item)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 12px',
                            borderRadius: 8,
                            border: 'none',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: !isBelum ? 'not-allowed' : 'pointer',
                            background: !isBelum 
                              ? '#e2e8f0' 
                              : 'linear-gradient(135deg, var(--accent-blue), #4c6ef5)',
                            color: !isBelum ? '#94a3b8' : 'white',
                            opacity: isSending ? 0.7 : 1,
                            transition: 'all 0.15s ease',
                            boxShadow: isBelum ? '0 2px 6px rgba(59, 91, 219, 0.15)' : 'none'
                          }}
                        >
                          {isSending ? (
                            <>Simulasi Kirim...</>
                          ) : !isBelum ? (
                            <>
                              <CheckCircle2 size={13} /> Diingatkan
                            </>
                          ) : (
                            <>
                              <Send size={13} /> Kirim Reminder
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
