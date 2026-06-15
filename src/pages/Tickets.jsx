import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { crmState } from '../lib/crmState';
import { 
  Ticket, AlertCircle, Clock, CheckCircle, ShieldAlert,
  Search, Eye, Send, ArrowRight
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

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Filters State
  const [statusFilter, setStatusFilter] = useState('Semua'); // 'Semua', 'Baru', 'Dalam Proses', 'Selesai', 'Ditutup'
  const [priorityFilter, setPriorityFilter] = useState('Semua'); // 'Semua', 'Rendah', 'Sedang', 'Tinggi', 'Kritis'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Action state
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    crmState.init();
    loadTickets();
    
    const handleStorage = () => {
      loadTickets();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const loadTickets = () => {
    const list = crmState.getTickets();
    setTickets(list);
  };

  const handleUpdateStatus = (id, newStatus) => {
    const updated = crmState.updateTicketStatus(id, newStatus);
    setTickets(updated);
    
    // Update local selected ticket
    const current = updated.find(t => t.id === id);
    setSelectedTicket(current);
    
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdatePriority = (id, newPriority) => {
    const updated = crmState.updateTicketPriority(id, newPriority);
    setTickets(updated);
    
    // Update local selected ticket
    const current = updated.find(t => t.id === id);
    setSelectedTicket(current);
    
    window.dispatchEvent(new Event('storage'));
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    // Get current logged in staff name if any
    let adminName = 'Admin Taufiq';
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      if (u && u.name) adminName = u.name;
    } catch (_) {}

    const updated = crmState.replyTicket(
      selectedTicket.id,
      replyText,
      'admin',
      adminName
    );

    setReplyText('');
    setTickets(updated);
    
    // Update local selected ticket
    const current = updated.find(t => t.id === selectedTicket.id);
    setSelectedTicket(current);

    window.dispatchEvent(new Event('storage'));
  };

  // Filtered List
  const filteredTickets = tickets.filter(t => {
    const matchStatus = statusFilter === 'Semua' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'Semua' || t.priority === priorityFilter;
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const getPriorityBadge = (prio) => {
    let colors = {};
    switch (prio) {
      case 'Kritis': colors = { bg: '#fff5f5', text: '#e03131', border: '#ffa8a8' }; break;
      case 'Tinggi': colors = { bg: '#fff0f6', text: '#d6336c', border: '#faa2c1' }; break;
      case 'Sedang': colors = { bg: '#fff9db', text: '#f08c00', border: '#ffe3e3' }; break;
      default: colors = { bg: '#f1f3f5', text: '#495057', border: '#dee2e6' };
    }
    return (
      <span style={{
        fontSize: 10.5,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 4,
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`
      }}>{prio}</span>
    );
  };

  const getStatusBadge = (status) => {
    let colors = {};
    switch (status) {
      case 'Baru': colors = { bg: '#e7f5ff', text: '#1c7ed6' }; break;
      case 'Dalam Proses': colors = { bg: '#fff9db', text: '#f08c00' }; break;
      case 'Selesai': colors = { bg: '#e6fcf5', text: '#0ca678' }; break;
      case 'Ditutup': colors = { bg: '#f1f3f5', text: '#868e96' }; break;
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
      }}>{status}</span>
    );
  };

  // Stats
  const statTotal = tickets.length;
  const statNew = tickets.filter(t => t.status === 'Baru').length;
  const statProcess = tickets.filter(t => t.status === 'Dalam Proses').length;
  const statClosed = tickets.filter(t => t.status === 'Selesai' || t.status === 'Ditutup').length;

  return (
    <div style={{ flex: 1, padding: 24, background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', position: 'relative' }}>
      <PageHeader 
        title="Tiket Keluhan Member" 
        subtitle="Kelola laporan kendala, billing, masukan fasilitas, dan pertanyaan medis dari member." 
      />

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        <div style={cardStyle}>
          <div style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <Ticket size={20} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Tiket</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{statTotal}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ background: '#e7f5ff', color: '#1c7ed6', width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Tiket Baru</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{statNew}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ background: '#fff9db', color: '#f08c00', width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Dalam Proses</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{statProcess}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ background: '#e6fcf5', color: '#0ca678', width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Diselesaikan / Tutup</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{statClosed}</div>
          </div>
        </div>
      </div>

      {/* Main Filter & Table Area */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {/* Filters Topbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Tab Filters */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['Semua', 'Baru', 'Dalam Proses', 'Selesai', 'Ditutup'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: statusFilter === st ? 'var(--accent-blue-light)' : 'transparent',
                  color: statusFilter === st ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontSize: 12,
                  fontWeight: statusFilter === st ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Priority Filter + Search */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                fontSize: 12,
                outline: 'none',
                background: 'white'
              }}
            >
              <option value="Semua">Semua Prioritas</option>
              <option value="Rendah">Rendah</option>
              <option value="Sedang">Sedang</option>
              <option value="Tinggi">Tinggi</option>
              <option value="Kritis">Kritis</option>
            </select>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Cari ID/Judul/Member..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  padding: '6px 10px 6px 30px',
                  borderRadius: 6,
                  border: '1px solid var(--border-color)',
                  fontSize: 12.5,
                  outline: 'none',
                  width: 200
                }}
              />
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid var(--border-color)' }}>
                {['ID Tiket', 'Member & Hewan', 'Judul Keluhan', 'Kategori', 'Prioritas', 'Status', 'Tanggal Dibuat', 'Aksi'].map(col => (
                  <th key={col} style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Ticket size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                    <p style={{ fontSize: 13 }}>Tidak ada tiket keluhan ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t, idx) => (
                  <tr key={t.id} style={{ borderBottom: idx < filteredTickets.length - 1 ? '1px solid var(--border-color)' : 'none', fontSize: 12.5 }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-primary)' }}>#{t.id}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 650 }}>{t.ownerName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Pet: {t.petName}</div>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 500, color: '#334155', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#f1f5f9', color: '#475569' }}>
                        {t.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>{getPriorityBadge(t.priority)}</td>
                    <td style={{ padding: '14px 18px' }}>{getStatusBadge(t.status)}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>{t.createdAt}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <button
                        onClick={() => setSelectedTicket(t)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '5px 10px',
                          borderRadius: 6,
                          border: '1px solid var(--border-color)',
                          background: 'white',
                          cursor: 'pointer',
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <Eye size={12} /> Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLIDE OUT PANEL FROM RIGHT */}
      {selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.3)',
          zIndex: 99,
          display: 'flex',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(1px)'
        }}
        onClick={() => setSelectedTicket(null)}
        >
          <div 
            style={{
              width: 500,
              height: '100%',
              background: 'white',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideIn 0.3s ease'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div style={{ padding: 20, borderBottom: '1px solid var(--border-color)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>Detail Tiket Keluhan</span>
                <h3 style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0' }}>#{selectedTicket.id} - {selectedTicket.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                style={{ border: 'none', background: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* Panel Metadata & Controls */}
            <div style={{ padding: 18, borderBottom: '1px solid var(--border-color)', background: '#fafafa', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 12.5 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Member & Pasien</div>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedTicket.ownerName}</strong> ({selectedTicket.petName})
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Kategori Tiket</div>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedTicket.category}</strong>
              </div>

              {/* Status Update */}
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Ubah Status</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['Dalam Proses', 'Selesai', 'Ditutup'].map(st => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedTicket.id, st)}
                      style={{
                        padding: '4px 8px',
                        fontSize: 10.5,
                        fontWeight: 700,
                        borderRadius: 4,
                        border: selectedTicket.status === st ? 'none' : '1px solid var(--border-color)',
                        background: selectedTicket.status === st ? 'var(--accent-blue)' : 'white',
                        color: selectedTicket.status === st ? 'white' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {st === 'Dalam Proses' ? 'Proses' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Update */}
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Prioritas</div>
                <select
                  value={selectedTicket.priority}
                  onChange={e => handleUpdatePriority(selectedTicket.id, e.target.value)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: '1px solid var(--border-color)',
                    fontSize: 11,
                    background: 'white'
                  }}
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Kritis">Kritis</option>
                </select>
              </div>
            </div>

            {/* Conversation Timeline */}
            <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
              {selectedTicket.conversations.map((msg, idx) => {
                const isAdmin = msg.role === 'admin';
                return (
                  <div 
                    key={idx}
                    style={{
                      alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAdmin ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{msg.senderName} · {msg.time}</span>
                    <div style={{
                      background: isAdmin ? '#e7f5ff' : 'white',
                      border: '1px solid',
                      borderColor: isAdmin ? '#a5d8ff' : 'var(--border-color)',
                      padding: '10px 14px',
                      borderRadius: isAdmin ? '12px 0 12px 12px' : '0 12px 12px 12px',
                      fontSize: 12.5,
                      lineHeight: 1.4,
                      color: '#212529',
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
              <form onSubmit={handleSendReply} style={{ padding: 16, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 10, background: 'white' }}>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Tulis tanggapan atau solusi masalah untuk member..."
                  rows="2"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
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
                    background: replyText.trim() ? 'var(--accent-blue)' : '#cbd5e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Send size={12} /> Balas
                </button>
              </form>
            ) : (
              <div style={{ padding: 16, textAlign: 'center', background: '#f1f3f5', color: 'var(--text-muted)', fontSize: 12, borderTop: '1px solid var(--border-color)' }}>
                Tiket ini telah ditutup oleh admin.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
