import React, { useState, useEffect } from 'react';
import { ticketService } from '../../lib/supabaseService';

export default function MemberTickets() {
  const member = (() => {
    try { return JSON.parse(localStorage.getItem('memberUser')); } catch { return null; }
  })();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

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
    loadTickets();
  }, []);

  const loadTickets = async () => {
    if (!member?.email) return;
    setLoading(true);
    try {
      const data = await ticketService.getByEmail(member.email);
      setTickets(data || []);

      // Refresh selected ticket detail if open
      if (selectedTicket) {
        const refreshed = (data || []).find(t => t.id === selectedTicket.id);
        if (refreshed) setSelectedTicket(refreshed);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.title || !newTicket.description) return;

    await ticketService.create({
      ...newTicket,
      ownerName: member?.name || 'Member',
      email: member?.email || ''
    });

    setIsModalOpen(false);
    setNewTicket({
      petName: 'Buddy',
      category: 'Layanan',
      title: '',
      description: '',
      urgency: 'Sedang'
    });

    await loadTickets();
    // Dispatch storage event to update sidebar badges
    window.dispatchEvent(new Event('storage'));
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    await ticketService.reply(
      selectedTicket.id,
      replyText,
      'member',
      member?.name || 'Member'
    );

    setReplyText('');
    await loadTickets();
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

  if (loading) {
    return <div className="p-10 text-center text-slate-400">Memuat data...</div>;
  }

  return (
    <div className="pb-10 flex flex-col gap-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tiket Keluhan Saya</h1>
          <div className="text-slate-500 text-sm mt-1">Laporkan masalah, tanyakan resep, atau berikan kritik saran kepada pengelola Veterinario.</div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none rounded-xl text-sm font-bold cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-2 transition hover:from-emerald-700 hover:to-teal-700 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Buat Tiket Baru
        </button>
      </div>

      {/* Main Two Column View if Ticket Selected, else single list */}
      <div className={`grid gap-6 items-start ${selectedTicket ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        
        {/* Ticket List Column */}
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${selectedTicket ? 'lg:col-span-1' : ''}`}>
          <div className="px-5 py-4 border-b border-slate-100 font-bold text-sm text-slate-800 bg-slate-50/50">
            Daftar Tiket Anda ({tickets.length})
          </div>
          <div className="flex flex-col max-h-[550px] overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span className="text-sm font-medium">Anda belum memiliki tiket keluhan aktif.</span>
              </div>
            ) : (
              tickets.map(t => (
                <div 
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`px-5 py-4 border-b border-slate-50 cursor-pointer transition-colors flex flex-col gap-2 ${selectedTicket?.id === t.id ? 'bg-emerald-50/50 border-emerald-100' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500">#{t.id}</span>
                    <span className="text-[11px] text-slate-400">{t.createdAt}</span>
                  </div>
                  <div className="font-bold text-sm text-slate-800 line-clamp-1">
                    {t.title}
                  </div>
                  <div className="flex gap-2 items-center mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.urgency === 'Tinggi' ? 'bg-rose-50 text-rose-600 border-rose-100' : t.urgency === 'Sedang' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      Urgensi: {t.urgency}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.status === 'Baru' ? 'bg-blue-50 text-blue-600' : t.status === 'Dalam Proses' ? 'bg-amber-50 text-amber-600' : t.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[600px] lg:col-span-2">
            {/* Detail Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <span className="text-[11px] font-bold text-slate-500 tracking-wider">TINJAU TIKET #{selectedTicket.id}</span>
                <h2 className="text-base font-bold text-slate-800 mt-1">{selectedTicket.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-2 transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Ticket Info Section */}
            <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
              <div>Hewan: <strong className="text-slate-700">{selectedTicket.petName}</strong></div>
              <div>Kategori: <strong className="text-slate-700">{selectedTicket.category}</strong></div>
              <div className="flex items-center gap-1">Status: <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selectedTicket.status === 'Baru' ? 'bg-blue-50 text-blue-600' : selectedTicket.status === 'Dalam Proses' ? 'bg-amber-50 text-amber-600' : selectedTicket.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{selectedTicket.status}</span></div>
            </div>

            {/* Visual Stepper Tracker */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center w-full">
                {[
                  { key: 'Baru', label: 'Baru', desc: 'Tiket Terdaftar' },
                  { key: 'Dalam Proses', label: 'Dalam Proses', desc: 'Ditangani Staf' },
                  { key: 'Selesai', label: 'Selesai / Ditutup', desc: 'Solusi Diberikan' }
                ].map((step, idx, arr) => {
                  const isCompleted = 
                    selectedTicket.status === 'Ditutup' || 
                    selectedTicket.status === 'Selesai' || 
                    (selectedTicket.status === 'Dalam Proses' && idx <= 1) || 
                    (selectedTicket.status === 'Baru' && idx === 0);
                    
                  const isActive = selectedTicket.status === step.key || (idx === 2 && (selectedTicket.status === 'Selesai' || selectedTicket.status === 'Ditutup'));

                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 border-2 ${isCompleted ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white border-slate-300 text-slate-400'}`}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[11px] font-bold mt-2 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>{step.label}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 text-center">{step.desc}</span>
                      {idx < arr.length - 1 && (
                        <div className={`absolute top-3 left-1/2 right-[-50%] h-[2px] -z-10 ${((selectedTicket.status === 'Dalam Proses' && idx === 0) || selectedTicket.status === 'Selesai' || selectedTicket.status === 'Ditutup') ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conversation Timeline */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-slate-50/30">
              {selectedTicket.conversations.map((msg, idx) => {
                const isAdmin = msg.role === 'admin';
                return (
                  <div 
                    key={idx}
                    className={`max-w-[80%] flex flex-col ${isAdmin ? 'self-start items-start' : 'self-end items-end'}`}
                  >
                    <div className="text-[10px] text-slate-400 mb-1">
                      {msg.senderName} · {msg.time}
                    </div>
                    <div className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm border ${isAdmin ? 'bg-white text-slate-700 border-slate-200 rounded-2xl rounded-tl-none' : 'bg-emerald-50 text-emerald-900 border-emerald-100 rounded-2xl rounded-tr-none'}`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Form Balas */}
            {selectedTicket.status !== 'Ditutup' ? (
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-100 flex gap-3 bg-white rounded-b-2xl">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Ketik pesan balasan Anda di sini..."
                  rows="2"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition resize-none"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className={`px-5 rounded-xl text-sm font-bold transition flex items-center justify-center ${replyText.trim() ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mr-1">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  Kirim
                </button>
              </form>
            ) : (
              <div className="p-4 text-center bg-slate-50 text-slate-400 text-xs border-t border-slate-100 rounded-b-2xl font-medium">
                Tiket ini sudah ditutup. Anda tidak dapat membalas tiket ini lagi.
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE TICKET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-base font-bold text-slate-800 m-0">Buat Tiket Keluhan Baru</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateTicket} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1 tracking-wider">HEWAN TERKAIT</label>
                <select
                  value={newTicket.petName}
                  onChange={e => setNewTicket(prev => ({ ...prev, petName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                >
                  <option value="Buddy">Buddy (Anjing)</option>
                  <option value="Luna">Luna (Kucing)</option>
                  <option value="Mochi">Mochi (Kelinci)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1 tracking-wider">KATEGORI KELUHAN</label>
                <select
                  value={newTicket.category}
                  onChange={e => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                >
                  <option value="Layanan">Layanan Klinik</option>
                  <option value="Dokter">Komunikasi / Resep Dokter</option>
                  <option value="Fasilitas">Fasilitas Ruang Tunggu / Kandang</option>
                  <option value="Billing">Kesalahan Billing / Pembayaran</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1 tracking-wider">TINGKAT URGENSI</label>
                <select
                  value={newTicket.urgency}
                  onChange={e => setNewTicket(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                >
                  <option value="Rendah">Rendah (Dapat menunggu beberapa hari)</option>
                  <option value="Sedang">Sedang (Respons dalam 24 jam)</option>
                  <option value="Tinggi">Tinggi (Respons secepatnya)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1 tracking-wider">JUDUL KELUHAN</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan ringkasan masalah keluhan..."
                  value={newTicket.title}
                  onChange={e => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1 tracking-wider">DESKRIPSI DETAIL</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Tuliskan kronologi atau detail masalah keluhan Anda di sini..."
                  value={newTicket.description}
                  onChange={e => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm active:scale-95"
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
