import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { crmState } from '../lib/crmState';
import { 
  Users, CheckCircle2, XCircle, Clock, 
  MessageSquare, Save, Search, Sparkles, Phone
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

export default function FollowUp() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [selectedTask, setSelectedTask] = useState(null);
  const [notesInput, setNotesInput] = useState('');
  const [statusInput, setStatusInput] = useState('Belum');
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    crmState.init();
    const data = crmState.getFollowups();
    setTasks(data);
    if (data.length > 0) {
      setSelectedTask(data[0]);
      setNotesInput(data[0].notes);
      setStatusInput(data[0].status);
    }
  }, []);

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setNotesInput(task.notes);
    setStatusInput(task.status);
  };

  const handleSaveFollowup = (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    const updated = crmState.updateFollowup(selectedTask.id, statusInput, notesInput);
    setTasks(updated);
    
    // Update selected task reference
    const newSelected = updated.find(t => t.id === selectedTask.id);
    setSelectedTask(newSelected);
    
    setSuccessToast(`Follow-up untuk ${selectedTask.petName} berhasil disimpan!`);
    
    // Dispatch storage event to notify other components/tabs
    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      setSuccessToast('');
    }, 3000);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.petName.toLowerCase().includes(search.toLowerCase()) || 
                          t.ownerName.toLowerCase().includes(search.toLowerCase()) ||
                          t.doctor.toLowerCase().includes(search.toLowerCase()) ||
                          t.service.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'Semua') return matchesSearch;
    return matchesSearch && t.status === filter;
  });

  const getStatusCfg = (status) => {
    switch (status) {
      case 'Sudah Dihubungi':
        return { color: '#0ca678', bg: '#e6fcf5', icon: CheckCircle2 };
      case 'Tidak Perlu':
        return { color: '#64748b', bg: '#f1f5f9', icon: XCircle };
      default:
        return { color: '#f76707', bg: '#fff4e6', icon: Clock };
    }
  };

  const totalBelum = tasks.filter(t => t.status === 'Belum').length;
  const totalSudah = tasks.filter(t => t.status === 'Sudah Dihubungi').length;
  const totalTidakPerlu = tasks.filter(t => t.status === 'Tidak Perlu').length;

  return (
    <div style={{ flex: 1, padding: 24, background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
      <PageHeader 
        title="Follow-up Kunjungan" 
        subtitle="Kelola tugas tindak lanjut (follow-up) setelah janji temu selesai dalam 1-3 hari." 
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
        <div style={{ ...cardStyle, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} color="#3b5bdb" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL TASK</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{tasks.length}</div>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: '#fff4e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={18} color="#f76707" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>BELUM DIHUBUNGI</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f76707' }}>{totalBelum}</div>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: '#e6fcf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={18} color="#0ca678" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>SUDAH DIHUBUNGI</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0ca678' }}>{totalSudah}</div>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={18} color="#64748b" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>TIDAK PERLU</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#64748b' }}>{totalTidakPerlu}</div>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, flex: 1 }}>
        {/* Left Column: List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Filters & Search */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, flex: 1 }}>
              {['Semua', 'Belum', 'Sudah Dihubungi', 'Tidak Perlu'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 12px',
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
                  {f === 'Belum' ? 'Belum Dihubungi' : f}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari pasien..."
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

          {/* List items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 440, overflowY: 'auto' }}>
            {filteredTasks.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                Tidak ada tugas follow-up.
              </div>
            ) : (
              filteredTasks.map(t => {
                const cfg = getStatusCfg(t.status);
                const isSelected = selectedTask?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTask(t)}
                    style={{
                      ...cardStyle,
                      cursor: 'pointer',
                      borderLeft: `4px solid ${cfg.color}`,
                      border: isSelected ? `1.5px solid var(--accent-blue)` : '1px solid var(--border-color)',
                      borderLeftWidth: 4,
                      padding: '14px 18px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{t.petName}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({t.ownerName})</span>
                          <span style={badgeStyle(cfg.color, cfg.bg)}>{t.status}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                          <span>👨‍⚕️ {t.doctor}</span>
                          <span>🩺 {t.service}</span>
                          <span>📅 Kunjungan: {t.visitDate}</span>
                        </div>
                        {t.notes && (
                          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', background: '#f8fafc', padding: '6px 10px', borderRadius: 6 }}>
                            " {t.notes.substring(0, 80)}{t.notes.length > 80 ? '...' : ''} "
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detail Form */}
        <div>
          {selectedTask ? (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 14 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700 }}>Follow-up Detail</h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'mono' }}>{selectedTask.id}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>PASIEN & PEMILIK</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{selectedTask.petName}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Pemilik: {selectedTask.ownerName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12, color: 'var(--accent-blue)', fontWeight: 600 }}>
                    <Phone size={12} /> {selectedTask.phone}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Layanan Kunjungan</div>
                    <div style={{ fontWeight: 600, fontSize: 12.5, marginTop: 1 }}>{selectedTask.service}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Dokter Pemeriksa</div>
                    <div style={{ fontWeight: 600, fontSize: 12.5, marginTop: 1 }}>{selectedTask.doctor}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2', marginTop: 4 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tanggal Kunjungan</div>
                    <div style={{ fontWeight: 600, fontSize: 12.5 }}>{selectedTask.visitDate}</div>
                  </div>
                </div>

                <form onSubmit={handleSaveFollowup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>STATUS FOLLOW-UP</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['Belum', 'Sudah Dihubungi', 'Tidak Perlu'].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatusInput(s)}
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            borderRadius: 6,
                            border: statusInput === s ? `1.5px solid ${getStatusCfg(s).color}` : '1px solid var(--border-color)',
                            background: statusInput === s ? getStatusCfg(s).bg : 'white',
                            color: statusInput === s ? getStatusCfg(s).color : 'var(--text-secondary)',
                            fontSize: 11.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          {s === 'Belum' ? 'Belum Dihubungi' : s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>CATATAN FOLLOW-UP</label>
                    <textarea
                      value={notesInput}
                      onChange={e => setNotesInput(e.target.value)}
                      placeholder="Masukkan catatan respon pemilik hewan (misal: kondisi nafsu makan, anjuran kontrol kembali, obat diminum teratur, dsb)..."
                      style={{
                        width: '100%',
                        height: 100,
                        padding: 10,
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

                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    {statusInput === 'Belum' && (
                      <button
                        type="button"
                        onClick={() => {
                          setStatusInput('Sudah Dihubungi');
                          setNotesInput('Telah dihubungi via WhatsApp. Pemilik menyampaikan kondisi hewan stabil dan sehat.');
                        }}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #0ca678',
                          background: '#e6fcf5',
                          color: '#0ca678',
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <Sparkles size={13} /> Set Sudah Dihubungi
                      </button>
                    )}
                    <button
                      type="submit"
                      style={{
                        padding: '8px 20px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'linear-gradient(135deg, var(--accent-blue), #4c6ef5)',
                        color: 'white',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 3px 8px rgba(59, 91, 219, 0.2)'
                      }}
                    >
                      <Save size={13} /> Simpan Catatan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: 'var(--text-muted)' }}>
              <Users size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p style={{ fontWeight: 600, fontSize: 13 }}>Pilih tugas untuk tindak lanjut</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
