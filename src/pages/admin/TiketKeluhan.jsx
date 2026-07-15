import React, { useState, useEffect } from 'react';
import { ticketService } from '../../lib/supabaseService';
import PageHeader from '../../components/PageHeader';
import { Send, User, ChevronRight, AlertCircle, RefreshCw, Clock, CheckCircle } from 'lucide-react';

export default function TiketKeluhan() {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Semua');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAll();
      setTickets(data);
      if (data.length > 0 && !activeTicket) {
        setActiveTicket(data[0]);
      } else if (activeTicket) {
        const updatedActive = data.find(t => t.id === activeTicket.id);
        if (updatedActive) setActiveTicket(updatedActive);
      }
    } catch (err) {
      setError('Gagal memuat tiket keluhan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicket) return;

    try {
      const success = await ticketService.reply(
        activeTicket.id,
        replyMessage,
        'admin',
        'Customer Service Admin'
      );
      if (success) {
        setReplyMessage('');
        fetchTickets();
      } else {
        alert('Gagal mengirim balasan');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat membalas');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const success = await ticketService.updateStatus(id, status);
      if (success) fetchTickets();
    } catch (err) {
      alert('Gagal memperbarui status');
    }
  };

  const handleUpdatePriority = async (id, priority) => {
    try {
      const success = await ticketService.updatePriority(id, priority);
      if (success) fetchTickets();
    } catch (err) {
      alert('Gagal memperbarui prioritas');
    }
  };

  const filteredTickets = tickets.filter(t => filterStatus === 'Semua' || t.status === filterStatus);

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#F7F8FC', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Tiket Keluhan" subtitle="Hub dan pusat bantuan pelanggan/member klinik." />

      {/* Main split dashboard view */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, flex: 1, minHeight: '65vh' }}>
        {/* Ticket List Panel */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Daftar Tiket</h3>
            <button onClick={fetchTickets} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
          <div style={{ padding: 12, borderBottom: '1px solid #E5E7EB' }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none' }}>
              <option value="Semua">Semua Status</option>
              <option value="Baru">Baru</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {loading && tickets.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 20, color: '#6B7280' }}>Memuat tiket...</p>
            ) : filteredTickets.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 20, color: '#9CA3AF' }}>Tidak ada tiket.</p>
            ) : (
              filteredTickets.map(t => {
                const isActive = activeTicket && activeTicket.id === t.id;
                const statusConfig = {
                  'Baru': { bg: '#FEF3C7', color: '#D97706' },
                  'Dalam Proses': { bg: '#DBEAFE', color: '#2563EB' },
                  'Selesai': { bg: '#D1FAE5', color: '#059669' },
                }[t.status] || { bg: '#F3F4F6', color: '#374151' };

                return (
                  <div key={t.id} onClick={() => setActiveTicket(t)} style={{ padding: 16, borderBottom: '1px solid #F3F4F6', cursor: 'pointer', background: isActive ? '#F3F4F6' : 'white', transition: 'background 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 12, background: statusConfig.bg, color: statusConfig.color, fontWeight: 700 }}>{t.status}</span>
                        <span style={{ fontSize: 11, color: t.priority === 'Tinggi' ? '#EF4444' : '#6B7280', fontWeight: 600 }}>{t.priority}</span>
                      </div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</h4>
                      <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{t.ownerName} &bull; {t.createdAt}</p>
                    </div>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Active Ticket Conversation Panel */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeTicket ? (
            <>
              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 700 }}>{activeTicket.title}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>Kategori: <strong>{activeTicket.category}</strong> &bull; Pemilik: <strong>{activeTicket.ownerName} (🐶 {activeTicket.petName})</strong></p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <select value={activeTicket.status} onChange={e => handleUpdateStatus(activeTicket.id, e.target.value)} style={{ padding: 6, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, outline: 'none' }}>
                    <option value="Baru">Baru</option>
                    <option value="Dalam Proses">Dalam Proses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                  <select value={activeTicket.priority} onChange={e => handleUpdatePriority(activeTicket.id, e.target.value)} style={{ padding: 6, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, outline: 'none' }}>
                    <option value="Rendah">Prioritas Rendah</option>
                    <option value="Sedang">Prioritas Sedang</option>
                    <option value="Tinggi">Prioritas Tinggi</option>
                  </select>
                </div>
              </div>

              {/* Message History */}
              <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {activeTicket.conversations?.map((conv) => {
                  const isAdmin = conv.role === 'admin';
                  return (
                    <div key={conv.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%', display: 'flex', gap: 10, flexDirection: isAdmin ? 'row-reverse' : 'row' }}>
                        <div style={{ size: 36, borderRadius: '50%', background: isAdmin ? '#DBEAFE' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: 36, height: 36 }}>
                          <User size={16} color={isAdmin ? '#2563EB' : '#4B5563'} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', justifyContent: isAdmin ? 'flex-end' : 'flex-start', marginBottom: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 700 }}>{conv.senderName}</span>
                            <span style={{ fontSize: 10, color: '#9CA3AF' }}>{conv.time}</span>
                          </div>
                          <div style={{ background: isAdmin ? '#2563EB' : 'white', color: isAdmin ? 'white' : '#1F2937', padding: '10px 14px', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: 13, wordBreak: 'break-word' }}>
                            {conv.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} style={{ padding: 16, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 12, background: 'white' }}>
                <input required type="text" placeholder="Tulis balasan di sini..." value={replyMessage} onChange={e => setReplyMessage(e.target.value)} style={{ flex: 1, padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none' }} />
                <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#2563EB', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
                  <Send size={14} /> Kirim
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#9CA3AF' }}>
              <AlertCircle size={40} style={{ marginBottom: 12 }} />
              <p>Pilih tiket dari daftar sebelah kiri untuk melihat percakapan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
