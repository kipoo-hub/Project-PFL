import React, { useState, useEffect } from 'react';
import { blastService } from '../../lib/supabaseService';
import PageHeader from '../../components/PageHeader';
import { Megaphone, Send, HelpCircle, RefreshCw, FileText } from 'lucide-react';

export default function BlastPesan() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({ type: 'WhatsApp', recipientCount: 15, message: '' });
  const [sending, setSending] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await blastService.getHistory();
      setHistory(data);
    } catch (err) {
      setError('Gagal memuat riwayat blast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSendBlast = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setSending(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const payload = {
        type: formData.type,
        recipientCount: parseInt(formData.recipientCount),
        message: formData.message
      };

      const result = await blastService.save(payload);
      if (result) {
        alert(`Pesan Massal via ${formData.type} berhasil diproses ke ${formData.recipientCount} penerima!`);
        setFormData({ type: 'WhatsApp', recipientCount: 15, message: '' });
        fetchHistory();
      } else {
        alert('Gagal menyimpan riwayat blast');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat mengirim blast');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#F7F8FC' }}>
      <PageHeader title="Pesan Massal (Blast)" subtitle="Kirim pengumuman, promosi, atau info penting secara massal ke nomor pelanggan." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, minHeight: '60vh' }}>
        {/* Blaster Form Panel */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: '#4F46E5' }}>
            <Megaphone size={20} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Buat Pesan Massal</h3>
          </div>

          <form onSubmit={handleSendBlast} style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Saluran Pengiriman</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none' }}>
                <option value="WhatsApp">WhatsApp Gateway</option>
                <option value="Email">Email Marketing</option>
                <option value="SMS">SMS Gateway</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Estimasi Jumlah Penerima</label>
              <input required type="number" min="1" max="1000" value={formData.recipientCount} onChange={e => setFormData({ ...formData, recipientCount: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none' }} />
              <span style={{ fontSize: 11, color: '#9CA3AF', display: 'block', marginTop: 4 }}>Pesan akan dikirimkan ke kontak pelanggan aktif.</span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Isi Pesan Blasting</label>
              <textarea required rows="8" placeholder="Tulis penawaran spesial atau pengumuman penting klinik Anda di sini..." value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} style={{ width: '100%', padding: 12, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none', resize: 'none', flex: 1, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" disabled={sending} style={{ display: 'flex', alignItems: 'center', justify: 'center', gap: 8, background: '#4F46E5', color: 'white', border: 'none', padding: '12px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.3)', transition: 'background 0.2s', width: '100%', boxSizing: 'border-box' }}>
              {sending ? 'Memproses Pengiriman...' : <><Send size={15} /> Kirim Sekarang</>}
            </button>
          </form>
        </div>

        {/* History Log Panel */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Riwayat Pengiriman</h3>
            <button onClick={fetchHistory} style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <p style={{ textAlign: 'center', padding: 20, color: '#6B7280' }}>Memuat...</p>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                <FileText size={32} style={{ marginBottom: 10 }} />
                <p>Belum ada riwayat pengiriman pesan massal.</p>
              </div>
            ) : (
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {history.map(item => (
                  <div key={item.id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, background: '#F9FAFB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: '#E0E7FF', color: '#4F46E5' }}>{item.type}</span>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>📅 {item.date} &bull; <strong style={{ color: '#10B981' }}>{item.recipientCount} Penerima</strong></span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{item.message}</p>
                    <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981' }}>✓ Sent & Success</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
