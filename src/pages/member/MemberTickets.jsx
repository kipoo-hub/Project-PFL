import React, { useState, useEffect } from 'react';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { crmState } from '../../lib/crmState';

export default function MemberTickets() {
  const { member } = useMemberAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  
  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    petName: 'Buddy',
    category: 'Layanan',
    title: '',
    description: '',
    urgency: 'Sedang'
  });

  useEffect(() => {
    crmState.init();
    loadTickets();
  }, [member]);

  const loadTickets = () => {
    const all = crmState.getTickets();
    // Filter for current member (support demo user to budi@email.com mapping too)
    const filtered = all.filter(t => 
      t.email?.toLowerCase() === member?.email?.toLowerCase() || 
      (member?.email === 'demo@email.com' && t.email === 'budi@email.com')
    );
    setTickets(filtered);
    
    // Refresh selected ticket detail if open
    if (selectedTicket) {
      const refreshed = filtered.find(t => t.id === selectedTicket.id);
      if (refreshed) setSelectedTicket(refreshed);
    }
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newTicket.title || !newTicket.description) return;

    crmState.createTicket({
      ...newTicket,
      ownerName: member?.name || 'Member',
      email: member?.email || 'budi@email.com'
    });

    setIsModalOpen(false);
    setNewTicket({
      petName: 'Buddy',
      category: 'Layanan',
      title: '',
      description: '',
      urgency: 'Sedang'
    });
    
    loadTickets();
    // Dispatch storage event to update sidebar badges
    window.dispatchEvent(new Event('storage'));
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    crmState.replyTicket(
      selectedTicket.id,
      replyText,
      'member',
      member?.name || 'Member'
    );

    setReplyText('');
    loadTickets();
    window.dispatchEvent(new Event('storage'));
  };

  const getUrgencyBadgeStyle = (urgency) => {
    switch (urgency) {
      case 'Tinggi': return { background: '#fff0f6', color: '#e03131', border: '1px solid #ffdeeb' };
      case 'Sedang': return { background: '#fff9db', color: '#f08c00', border: '1px solid #ffe3e3' };
      default: return { background: '#f1f3f5', color: '#495057', border: '1px solid #e9ecef' };
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Baru': return { background: '#e7f5ff', color: '#1c7ed6' };
      case 'Dalam Proses': return { background: '#fff9db', color: '#f08c00' };
      case 'Selesai': return { background: '#e6fcf5', color: '#0ca678' };
      case 'Ditutup': return { background: '#f1f3f5', color: '#868e96' };
      default: return { background: '#f1f3f5', color: '#495057' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Row */}
      <div className="md-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="md-page-header__welcome" style={{ fontSize: '1.4rem' }}>Tiket Keluhan Saya</h1>
          <div className="md-page-header__sub">Laporkan masalah, tanyakan resep, atau berikan kritik saran kepada pengelola Veterinario.</div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '10px 18px',
            background: 'linear-gradient(135deg, #16a34a, #0d9488)',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(22, 163, 74, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>➕</span> Buat Tiket Baru
        </button>
      </div>

      {/* Main Two Column View if Ticket Selected, else single list */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '400px 1fr' : '1fr', gap: 20, alignItems: 'start' }}>
        {/* Ticket List Column */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 14, color: '#334155' }}>
            Daftar Tiket Anda ({tickets.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '550px', overflowY: 'auto' }}>
            {tickets.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: 10 }}>🎫</span>
                <span style={{ fontSize: 13 }}>Anda belum memiliki tiket keluhan aktif.</span>
              </div>
            ) : (
              tickets.map(t => (
                <div 
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    cursor: 'pointer',
                    background: selectedTicket?.id === t.id ? '#f0fdf4' : 'transparent',
                    transition: 'all 0.15s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>#{t.id}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{t.createdAt}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1e293b', lineClamp: 1, WebkitLineClamp: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {t.title}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 12,
                      ...getUrgencyBadgeStyle(t.urgency)
                    }}>
                      Urgensi: {t.urgency}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 12,
                      ...getStatusBadgeStyle(t.status)
                    }}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Ticket Conversation Panel */}
        {selectedTicket && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', height: '600px' }}>
            {/* Detail Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>TINJAU TIKET #{selectedTicket.id}</span>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', margin: '2px 0 0' }}>{selectedTicket.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                style={{ border: 'none', background: 'none', color: '#64748b', fontSize: 16, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Ticket Info Section */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
              <div>Hewan: <strong style={{ color: '#334155' }}>{selectedTicket.petName}</strong></div>
              <div>Kategori: <strong style={{ color: '#334155' }}>{selectedTicket.category}</strong></div>
              <div>Status: <span style={{
                fontSize: 10.5,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 4,
                ...getStatusBadgeStyle(selectedTicket.status)
              }}>{selectedTicket.status}</span></div>
            </div>

            {/* Conversation Timeline */}
            <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, background: '#fdfdfd' }}>
              {selectedTicket.conversations.map((msg, idx) => {
                const isAdmin = msg.role === 'admin';
                return (
                  <div 
                    key={idx}
                    style={{
                      alignSelf: isAdmin ? 'flex-start' : 'flex-end',
                      maxWidth: '80%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAdmin ? 'flex-start' : 'flex-end'
                    }}
                  >
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>
                      {msg.senderName} · {msg.time}
                    </div>
                    <div style={{
                      background: isAdmin ? '#f1f3f5' : '#e6fcf5',
                      color: '#212529',
                      padding: '10px 14px',
                      borderRadius: isAdmin ? '0px 12px 12px 12px' : '12px 0px 12px 12px',
                      fontSize: 12.5,
                      lineHeight: 1.4,
                      border: isAdmin ? '1px solid #e9ecef' : '1px solid #c3fae8',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Form Balas */}
            {selectedTicket.status !== 'Ditutup' ? (
              <form onSubmit={handleSendReply} style={{ padding: 16, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Ketik pesan balasan Anda di sini..."
                  rows="2"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 12.5,
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  style={{
                    padding: '0 18px',
                    background: replyText.trim() ? '#16a34a' : '#cbd5e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: replyText.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Kirim
                </button>
              </form>
            ) : (
              <div style={{ padding: 16, textAlign: 'center', background: '#f8fafc', color: '#94a3b8', fontSize: 12, borderTop: '1px solid #f1f5f9' }}>
                Tiket ini sudah ditutup. Anda tidak dapat membalas tiket ini lagi.
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE TICKET MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            width: 480,
            maxWidth: '90%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#1e293b', margin: 0 }}>Buat Tiket Keluhan Baru</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', background: 'none', color: '#64748b', fontSize: 16, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateTicket} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>HEWAN TERKAIT</label>
                <select
                  value={newTicket.petName}
                  onChange={e => setNewTicket(prev => ({ ...prev, petName: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: 'white' }}
                >
                  <option value="Buddy">Buddy (Anjing)</option>
                  <option value="Luna">Luna (Kucing)</option>
                  <option value="Mochi">Mochi (Kelinci)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>KATEGORI KELUHAN</label>
                <select
                  value={newTicket.category}
                  onChange={e => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: 'white' }}
                >
                  <option value="Layanan">Layanan Klinik</option>
                  <option value="Dokter">Komunikasi / Resep Dokter</option>
                  <option value="Fasilitas">Fasilitas Ruang Tunggu / Kandang</option>
                  <option value="Billing">Kesalahan Billing / Pembayaran</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>TINGKAT URGENSI</label>
                <select
                  value={newTicket.urgency}
                  onChange={e => setNewTicket(prev => ({ ...prev, urgency: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: 'white' }}
                >
                  <option value="Rendah">Rendah (Dapat menunggu beberapa hari)</option>
                  <option value="Sedang">Sedang (Respons dalam 24 jam)</option>
                  <option value="Tinggi">Tinggi (Respons secepatnya)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>JUDUL KELUHAN</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan ringkasan masalah keluhan..."
                  value={newTicket.title}
                  onChange={e => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>DESKRIPSI DETAIL</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Tuliskan kronologi atau detail masalah keluhan Anda di sini..."
                  value={newTicket.description}
                  onChange={e => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white', fontSize: 13, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #16a34a, #0d9488)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
