import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { crmState } from '../lib/crmState';
import { 
  Users, UserCheck, MessageSquare, Phone, 
  Mail, Search, CheckCircle2, XCircle, AlertCircle, Sparkles, X, Check
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
  gap: 4,
  padding: '3px 10px',
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  color,
  background: bg,
});

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [selectedLead, setSelectedLead] = useState(null);
  const [contactMethod, setContactMethod] = useState('WhatsApp');
  const [messageText, setMessageText] = useState(
    'Halo! Kami dari Veterinario melihat Anda tertarik dengan layanan kami. Daftar sekarang gratis dan nikmati kemudahan kelola kesehatan hewan peliharaan Anda!'
  );
  const [showContactModal, setShowContactModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    crmState.init();
    setLeads(crmState.getLeads());
  }, []);

  const handleOpenContact = (lead) => {
    setSelectedLead(lead);
    setShowContactModal(true);
  };

  const handleSendContact = (e) => {
    e.preventDefault();
    if (!selectedLead) return;

    // Simulate sending message
    const updated = crmState.updateLeadStatus(selectedLead.id, 'Dihubungi');
    setLeads(updated);
    setShowContactModal(false);
    setSuccessToast(`Pesan berhasil dikirim ke ${selectedLead.visitorName} melalui ${contactMethod}!`);
    
    // Notify other tabs
    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      setSuccessToast('');
    }, 3500);
  };

  const handleConvertLead = (lead) => {
    const updated = crmState.updateLeadStatus(lead.id, 'Konversi');
    setLeads(updated);
    setSuccessToast(`Selamat! ${lead.visitorName} resmi terkonversi menjadi member.`);
    
    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      setSuccessToast('');
    }, 3500);
  };

  const handleIgnoreLead = (lead) => {
    const updated = crmState.updateLeadStatus(lead.id, 'Tidak Tertarik');
    setLeads(updated);
    setSuccessToast(`Status ${lead.visitorName} diubah ke Tidak Tertarik.`);
    
    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      setSuccessToast('');
    }, 3000);
  };

  const getStatusCfg = (status) => {
    switch (status) {
      case 'Konversi':
        return { color: '#0ca678', bg: '#e6fcf5', icon: CheckCircle2 };
      case 'Dihubungi':
        return { color: '#3b5bdb', bg: '#eef2ff', icon: MessageSquare };
      case 'Tidak Tertarik':
        return { color: '#64748b', bg: '#f1f5f9', icon: XCircle };
      default:
        return { color: '#f76707', bg: '#fff4e6', icon: AlertCircle };
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.visitorName.toLowerCase().includes(search.toLowerCase()) || 
                          l.email.toLowerCase().includes(search.toLowerCase()) ||
                          l.source.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'Semua') return matchesSearch;
    return matchesSearch && l.status === filter;
  });

  // KPI Calculations
  const stats = crmState.getCRMStats();

  return (
    <div style={{ flex: 1, padding: 24, background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
      <PageHeader 
        title="Lead Management" 
        subtitle="Kelola calon pelanggan potensial dan konversi mereka menjadi member." 
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

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} color="#64748b" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL LEAD</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{stats.totalLeads}</div>
          </div>
        </div>
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fff4e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={18} color="#f76707" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>BARU HARI INI</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f76707' }}>{stats.newLeadsToday}</div>
          </div>
        </div>
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={18} color="#3b5bdb" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>SUDAH DIHUBUNGI</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#3b5bdb' }}>{stats.contactedLeads}</div>
          </div>
        </div>
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#e6fcf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={18} color="#0ca678" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>KONVERSI MEMBER</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0ca678' }}>{stats.conversionRate}%</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['Semua', 'Baru', 'Dihubungi', 'Konversi'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: filter === f ? '#1e293b' : '#f1f5f9',
                  color: filter === f ? 'white' : '#64748b',
                  transition: 'all 0.15s'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari lead / visitor..."
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                fontSize: 12.5,
                outline: 'none',
                background: 'white'
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['ID / Nama Visitor', 'Halaman Kunjungan', 'Kunjungan Terakhir', 'Jml Kunjungan', 'Status', 'Aksi'].map(col => (
                  <th key={col} style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                    <p style={{ fontSize: 13 }}>Tidak ada data lead ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((item, idx) => {
                  const cfg = getStatusCfg(item.status);
                  
                  return (
                    <tr key={item.id} style={{ borderBottom: idx < filteredLeads.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>{item.visitorName}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{item.email} • {item.phone}</div>
                      </td>
                      <td style={{ padding: '16px 18px', fontSize: 13, color: 'var(--text-secondary)' }}>
                        <span style={{ background: '#f8fafc', padding: '2px 8px', borderRadius: 4, border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: 11.5 }}>
                          {item.source}
                        </span>
                      </td>
                      <td style={{ padding: '16px 18px', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {item.lastActive}
                      </td>
                      <td style={{ padding: '16px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>
                        {item.visitCount}x
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <span style={badgeStyle(cfg.color, cfg.bg)}>
                          <cfg.icon size={11} /> {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        {item.status !== 'Konversi' && item.status !== 'Tidak Tertarik' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => handleOpenContact(item)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 6,
                                border: 'none',
                                background: '#eef2ff',
                                color: '#3b5bdb',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Hubungi
                            </button>
                            <button
                              onClick={() => handleConvertLead(item)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 6,
                                border: 'none',
                                background: '#e6fcf5',
                                color: '#0ca678',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Konversi
                            </button>
                            <button
                              onClick={() => handleIgnoreLead(item)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 6,
                                border: 'none',
                                background: '#f1f5f9',
                                color: '#64748b',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Abaikan
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>- Selesai -</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && selectedLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: 16, width: 480, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Hubungi Lead — {selectedLead.visitorName}</h3>
              <button onClick={() => setShowContactModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSendContact} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>METODE KONTAK</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { name: 'WhatsApp', icon: MessageSquare, color: '#25D366' },
                    { name: 'Email', icon: Mail, color: '#3b5bdb' },
                    { name: 'Telepon', icon: Phone, color: '#f76707' }
                  ].map(method => (
                    <button
                      key={method.name}
                      type="button"
                      onClick={() => setContactMethod(method.name)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: 8,
                        border: contactMethod === method.name ? `1.5px solid ${method.color}` : '1px solid var(--border-color)',
                        background: contactMethod === method.name ? method.color + '10' : 'white',
                        color: contactMethod === method.name ? method.color : 'var(--text-secondary)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <method.icon size={13} /> {method.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>PESAN TINDAK LANJUT (AUTO-TEMPLATE)</label>
                <textarea
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  style={{
                    width: '100%',
                    height: 120,
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    fontSize: 12.5,
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border-color)', paddingTop: 16, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'white', fontSize: 13, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--accent-blue), #4c6ef5)',
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Check size={14} /> Kirim Pesan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
