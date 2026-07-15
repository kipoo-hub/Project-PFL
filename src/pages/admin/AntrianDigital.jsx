import React, { useState, useEffect } from 'react';
import { queueService } from '../../lib/supabaseService';
import PageHeader from '../../components/PageHeader';
import { Volume2, Play, CheckCircle, XCircle, Trash2, Plus, Users, Clock } from 'lucide-react';

export default function AntrianDigital() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ ownerName: '', petName: '', service: 'Pemeriksaan Umum', type: 'Datang Sekarang', appointmentTime: '' });

  const fetchQueues = async () => {
    try {
      setLoading(true);
      const data = await queueService.getAll();
      setQueues(data);
    } catch (err) {
      setError('Gagal memuat data antrian');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();

    // Subscribe to real-time updates
    const subscription = queueService.subscribeToChanges(() => {
      // Re-fetch when change happens
      fetchQueues();
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleCallNext = async () => {
    try {
      await queueService.callNext();
      fetchQueues();
    } catch (err) {
      alert('Gagal memanggil antrian berikutnya');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await queueService.updateStatus(id, status);
      fetchQueues();
    } catch (err) {
      alert('Gagal memperbarui status antrian');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus antrian ini?')) return;
    try {
      await queueService.delete(id);
      fetchQueues();
    } catch (err) {
      alert('Gagal menghapus antrian');
    }
  };

  const handleAddQueue = async (e) => {
    e.preventDefault();
    try {
      await queueService.add(formData);
      setShowAddModal(false);
      setFormData({ ownerName: '', petName: '', service: 'Pemeriksaan Umum', type: 'Datang Sekarang', appointmentTime: '' });
      fetchQueues();
    } catch (err) {
      alert('Gagal menambah antrian');
    }
  };

  // Text-to-speech announcement for Indonesia
  const announceQueue = (number) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = `Nomor antrean, ${number.replace('-', ' ')}, silakan menuju ruang periksa`;
      msg.lang = 'id-ID';
      window.speechSynthesis.speak(msg);
    } else {
      alert(`Panggil antrian: ${number}`);
    }
  };

  const currentCalling = queues.find(q => q.status === 'Dipanggil');
  const currentServing = queues.find(q => q.status === 'Dilayani');
  const waitingQueues = queues.filter(q => q.status === 'Menunggu');

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#F7F8FC' }}>
      <PageHeader title="Antrian Digital" subtitle="Kelola dan panggil antrian pasien klinik secara real-time." />

      {/* Real-time Status Card & Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Active Caller Panel */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#10B981', tracking: '0.05em' }}>Status Panggilan Sekarang</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 14 }}>
              <div style={{ background: '#ECFDF5', padding: '16px 28px', borderRadius: 16, textAlign: 'center', border: '1px solid #A7F3D0' }}>
                <span style={{ fontSize: 13, color: '#047857', fontWeight: 600 }}>Sedang Dipanggil</span>
                <h1 style={{ fontSize: 44, margin: '8px 0', fontWeight: 800, color: '#065F46' }}>{currentCalling ? currentCalling.queueNumber : '-'}</h1>
                <span style={{ fontSize: 12, color: '#047857' }}>{currentCalling ? currentCalling.petName : 'Tidak ada panggilan'}</span>
              </div>
              
              <div style={{ flex: 1 }}>
                {currentCalling ? (
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: 700 }}>{currentCalling.ownerName}</h3>
                    <p style={{ margin: 0, color: '#6B7280', fontSize: 14 }}>Layanan: <strong>{currentCalling.service}</strong></p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                      <button onClick={() => announceQueue(currentCalling.queueNumber)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
                        <Volume2 size={16} /> Suarakan
                      </button>
                      <button onClick={() => handleUpdateStatus(currentCalling.id, 'Dilayani')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#3B82F6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
                        <Play size={16} /> Layani
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: '#9CA3AF', margin: '0 0 16px 0' }}>Tidak ada antrean dalam status panggilan. Klik tombol di samping untuk memanggil antrean berikutnya.</p>
                    <button onClick={handleCallNext} disabled={waitingQueues.length === 0} style={{ background: waitingQueues.length > 0 ? '#10B981' : '#E5E7EB', color: waitingQueues.length > 0 ? 'white' : '#9CA3AF', border: 'none', padding: '10px 20px', borderRadius: 12, fontWeight: 700, cursor: waitingQueues.length > 0 ? 'pointer' : 'not-allowed', boxShadow: waitingQueues.length > 0 ? '0 4px 14px rgba(16,185,129,0.3)' : 'none' }}>
                      Panggil Antrean Berikutnya
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#4B5563' }}>Sedang Dilayani: <strong style={{ color: '#3B82F6' }}>{currentServing ? `${currentServing.queueNumber} (${currentServing.petName})` : '-'}</strong></span>
            {currentServing && (
              <button onClick={() => handleUpdateStatus(currentServing.id, 'Selesai')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#10B981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                <CheckCircle size={14} /> Tandai Selesai
              </button>
            )}
          </div>
        </div>

        {/* Queue Stats Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: '#EEF2FF', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justify: 'center', color: '#4F46E5' }}>
              <Users size={22} />
            </div>
            <div>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Total Antrean</span>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{queues.length}</h3>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: '#FFFBEB', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justify: 'center', color: '#D97706' }}>
              <Clock size={22} />
            </div>
            <div>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Menunggu</span>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{waitingQueues.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main List and Controls */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Semua Antrean</h3>
          <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#3B82F6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
            <Plus size={16} /> Tambah Antrean
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: 20, color: '#6B7280' }}>Memuat...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>No. Antrean</th>
                  <th style={{ padding: '12px 16px' }}>Pemilik / Hewan</th>
                  <th style={{ padding: '12px 16px' }}>Layanan</th>
                  <th style={{ padding: '12px 16px' }}>Waktu Daftar</th>
                  <th style={{ padding: '12px 16px' }}>Tipe</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {queues.map(q => {
                  const statusColors = {
                    'Menunggu': { bg: '#FEF3C7', text: '#D97706' },
                    'Dipanggil': { bg: '#D1FAE5', text: '#059669' },
                    'Dilayani': { bg: '#DBEAFE', text: '#2563EB' },
                    'Selesai': { bg: '#E5E7EB', text: '#4B5563' },
                    'Batal': { bg: '#FEE2E2', text: '#DC2626' },
                  }[q.status] || { bg: '#F3F4F6', text: '#374151' };

                  return (
                    <tr key={q.id} style={{ borderBottom: '1px solid #E5E7EB', verticalAlign: 'middle' }}>
                      <td style={{ padding: '16px', fontWeight: 700, color: '#111827' }}>{q.queueNumber}</td>
                      <td style={{ padding: '16px' }}>
                        <div>{q.ownerName}</div>
                        <span style={{ fontSize: 12, color: '#6B7280' }}>🐶 {q.petName}</span>
                      </td>
                      <td style={{ padding: '16px' }}>{q.service}</td>
                      <td style={{ padding: '16px' }}>{q.registeredTime}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 12, border: '1px solid #E5E7EB' }}>{q.type}</span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: statusColors.bg, color: statusColors.text, fontSize: 11, fontWeight: 700 }}>
                          {q.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {q.status === 'Menunggu' && (
                            <button onClick={() => handleUpdateStatus(q.id, 'Dipanggil')} style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', padding: 4 }} title="Panggil"><Volume2 size={16} /></button>
                          )}
                          {q.status !== 'Selesai' && q.status !== 'Batal' && (
                            <button onClick={() => handleUpdateStatus(q.id, 'Batal')} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }} title="Batalkan"><XCircle size={16} /></button>
                          )}
                          <button onClick={() => handleDelete(q.id)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4 }} title="Hapus"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {queues.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF' }}>Tidak ada antrean hari ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Queue Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, width: 440, padding: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700 }}>Tambah Antrean Manual</h3>
            <form onSubmit={handleAddQueue} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Nama Pemilik</label>
                <input required type="text" value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Nama Hewan</label>
                <input required type="text" value={formData.petName} onChange={e => setFormData({ ...formData, petName: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Layanan</label>
                <select value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }}>
                  {['Pemeriksaan Umum', 'Vaksinasi', 'Operasi', 'Konsultasi Spesialis', 'Grooming'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Tipe Kedatangan</label>
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }}>
                  <option value="Datang Sekarang">Datang Sekarang (Walk-In)</option>
                  <option value="Dengan Janji">Dengan Janji Temu</option>
                </select>
              </div>
              {formData.type === 'Dengan Janji' && (
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Waktu Janji</label>
                  <input required type="text" placeholder="Contoh: 14:30 WIB" value={formData.appointmentTime} onChange={e => setFormData({ ...formData, appointmentTime: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ padding: '8px 20px', border: 'none', background: '#3B82F6', color: 'white', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Tambah</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
