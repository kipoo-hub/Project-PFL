import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { Plus, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { DAYS, MONTHS, allAppointments } from '../data/jadwal';
import { crmState } from '../lib/crmState';

const statusCfg = {
  'Selesai':    { bg:'#e6fcf5', color:'#0ca678', icon: CheckCircle2 },
  'Menunggu':   { bg:'#fff4e6', color:'#f76707', icon: Clock },
  'Dibatalkan': { bg:'#fff5f5', color:'#e03131', icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const c = statusCfg[status] || statusCfg.Menunggu;
  const Icon = c.icon;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, background:c.bg, color:c.color, fontSize:11, fontWeight:600 }}>
      <Icon size={11} />{status}
    </span>
  );
};

const Modal = ({ show, onClose, selectedDate }) => {
  const [form, setForm] = useState({ hewan:'', pemilik:'', layanan:'Pemeriksaan', waktu:'08:00' });
  if (!show) return null;
  const inputStyle = { width:'100%', padding:'9px 12px', border:'1px solid var(--border-color)', borderRadius:8, fontSize:13, outline:'none', background:'var(--bg-app)', boxSizing:'border-box' };
  const labelStyle = { fontSize:12, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:6 };
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'white', borderRadius:16, width:440, boxShadow:'var(--shadow-lg)', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid var(--border-color)' }}>
          <h3 style={{ fontSize:15, fontWeight:700 }}>Tambah Janji Temu — {selectedDate}</h3>
          <button onClick={onClose} style={{ border:'none', background:'none', cursor:'pointer', color:'var(--text-muted)', padding:4 }}><X size={18} /></button>
        </div>
        <div style={{ padding:24, display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div><label style={labelStyle}>Nama Hewan</label><input value={form.hewan} onChange={e=>setForm(f=>({...f,hewan:e.target.value}))} style={inputStyle} placeholder="Max" /></div>
          <div><label style={labelStyle}>Nama Pemilik</label><input value={form.pemilik} onChange={e=>setForm(f=>({...f,pemilik:e.target.value}))} style={inputStyle} placeholder="Budi Santoso" /></div>
          <div>
            <label style={labelStyle}>Jenis Layanan</label>
            <select value={form.layanan} onChange={e=>setForm(f=>({...f,layanan:e.target.value}))} style={inputStyle}>
              {['Pemeriksaan','Vaksinasi','Operasi','Grooming','Perawatan'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Waktu</label><input type="time" value={form.waktu} onChange={e=>setForm(f=>({...f,waktu:e.target.value}))} style={inputStyle} /></div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, padding:'16px 24px', borderTop:'1px solid var(--border-color)' }}>
          <button onClick={onClose} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid var(--border-color)', background:'white', fontSize:13, cursor:'pointer' }}>Batal</button>
          <button onClick={onClose} style={{ padding:'8px 20px', borderRadius:8, border:'none', background:'linear-gradient(135deg, var(--accent-blue),#4c6ef5)', color:'white', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <Check size={14} /> Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

const JadwalTemu = () => {
  const today = new Date(2025, 4, 11);
  const [currentMonth, setCurrentMonth] = useState({ year: 2025, month: 4 });
  const [selectedDate, setSelectedDate] = useState('2025-05-11');
  const [showModal, setShowModal] = useState(false);
  const [dbAppointments, setDbAppointments] = useState({});
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    crmState.init();
    const stored = localStorage.getItem('vet_crm_appointments');
    if (!stored) {
      localStorage.setItem('vet_crm_appointments', JSON.stringify(allAppointments));
      setDbAppointments(allAppointments);
    } else {
      setDbAppointments(JSON.parse(stored));
    }
  }, []);

  const handleUpdateStatus = (dateStr, apptId, newStatus) => {
    const updated = { ...dbAppointments };
    const list = updated[dateStr] || [];
    
    const idx = list.findIndex(a => a.id === apptId);
    if (idx !== -1) {
      const appt = { ...list[idx], status: newStatus };
      list[idx] = appt;
      updated[dateStr] = list;
      
      localStorage.setItem('vet_crm_appointments', JSON.stringify(updated));
      setDbAppointments(updated);
      
      if (newStatus === 'Selesai') {
        crmState.addFollowUpTask(appt);
        setSuccessToast(`Janji temu selesai! Task follow-up untuk ${appt.hewan} otomatis dibuat.`);
      } else {
        setSuccessToast(`Jadwal janji temu berhasil diubah ke: ${newStatus}`);
      }

      window.dispatchEvent(new Event('storage'));

      setTimeout(() => {
        setSuccessToast('');
      }, 3500);
    }
  };

  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();

  const fmtDate = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const appointments = dbAppointments[selectedDate] || [];

  const prevMonth = () => setCurrentMonth(c => c.month === 0 ? {year:c.year-1,month:11} : {year:c.year,month:c.month-1});
  const nextMonth = () => setCurrentMonth(c => c.month === 11 ? {year:c.year+1,month:0} : {year:c.year,month:c.month+1});

  const selectedLabel = (() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  })();

  return (
    <div style={{ flex:1, padding:24, background:'var(--bg-app)', position: 'relative' }}>
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
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          {successToast}
        </div>
      )}
      <PageHeader title="Jadwal Temu" subtitle="Kelola janji temu dan jadwal kunjungan pasien." />

      <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:20 }}>
        {/* Calendar */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--border-color)', boxShadow:'var(--shadow-sm)', padding:20, alignSelf:'start' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <button id="cal-prev-btn" onClick={prevMonth} style={{ border:'none', background:'var(--bg-app)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-secondary)' }}><ChevronLeft size={16}/></button>
            <span style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>{MONTHS[currentMonth.month]} {currentMonth.year}</span>
            <button id="cal-next-btn" onClick={nextMonth} style={{ border:'none', background:'var(--bg-app)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-secondary)' }}><ChevronRight size={16}/></button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, textAlign:'center' }}>
            {DAYS.map(d => <div key={d} style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', padding:'4px 0', textTransform:'uppercase' }}>{d}</div>)}
            {Array(firstDay).fill(null).map((_,i) => <div key={`empty-${i}`} />)}
            {Array(daysInMonth).fill(null).map((_,i) => {
              const day = i + 1;
              const dateStr = fmtDate(currentMonth.year, currentMonth.month, day);
              const isSelected = dateStr === selectedDate;
              const hasAppt = !!allAppointments[dateStr];
              const isToday = dateStr === '2025-05-11';
              return (
                <button key={day} id={`cal-day-${dateStr}`} onClick={() => setSelectedDate(dateStr)}
                  style={{ width:'100%', aspectRatio:'1', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight: isSelected||isToday ? 700 : 400,
                    background: isSelected ? 'var(--accent-blue)' : isToday ? 'var(--accent-blue-light)' : 'transparent',
                    color: isSelected ? 'white' : isToday ? 'var(--accent-blue)' : 'var(--text-primary)',
                    position:'relative', transition:'all 0.15s',
                  }}>
                  {day}
                  {hasAppt && !isSelected && <div style={{ position:'absolute', bottom:2, left:'50%', transform:'translateX(-50%)', width:4, height:4, borderRadius:'50%', background:'var(--accent-blue)' }} />}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border-color)', display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Ringkasan Bulan Ini</div>
            {[['Total Janji',Object.values(allAppointments).flat().length],['Selesai',Object.values(allAppointments).flat().filter(a=>a.status==='Selesai').length],['Dibatalkan',Object.values(allAppointments).flat().filter(a=>a.status==='Dibatalkan').length]].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                <span style={{ color:'var(--text-secondary)' }}>{k}</span>
                <span style={{ fontWeight:700, color:'var(--text-primary)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment List */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--border-color)', boxShadow:'var(--shadow-sm)', overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--border-color)' }}>
            <div>
              <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>Janji Temu — {selectedLabel}</h3>
              <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{appointments.length} jadwal terdaftar</p>
            </div>
            <button id="jadwal-add-btn" onClick={() => setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:8, border:'none', background:'linear-gradient(135deg,var(--accent-blue),#4c6ef5)', color:'white', fontSize:13, fontWeight:600, cursor:'pointer', boxShadow:'0 4px 12px rgba(59,91,219,0.3)' }}>
              <Plus size={15}/> Tambah Jadwal
            </button>
          </div>

          {appointments.length === 0 ? (
            <div style={{ padding:60, textAlign:'center', color:'var(--text-muted)' }}>
              <Clock size={40} style={{ margin:'0 auto 12px', display:'block', opacity:0.3 }} />
              <p>Tidak ada jadwal pada tanggal ini.</p>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#fafafa' }}>
                    {['Waktu','Hewan','Spesies','Pemilik','Layanan','Dokter','Status','Aksi'].map(c=>(
                      <th key={c} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid var(--border-color)', whiteSpace:'nowrap' }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a,i) => (
                    <tr key={a.id} style={{ borderBottom: i<appointments.length-1?'1px solid var(--border-color)':'none', transition:'background 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#fafbff'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'12px 16px', fontWeight:700, color:'var(--accent-blue)', fontSize:13 }}>{a.waktu}</td>
                      <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{a.hewan}</td>
                      <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-secondary)' }}>{a.spesies}</td>
                      <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-primary)', whiteSpace:'nowrap' }}>{a.pemilik}</td>
                      <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-secondary)' }}>{a.layanan}</td>
                      <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-secondary)' }}>{a.dokter}</td>
                      <td style={{ padding:'12px 16px' }}><StatusBadge status={a.status} /></td>
                      <td style={{ padding:'12px 16px' }}>
                        {a.status === 'Menunggu' ? (
                          <div style={{ display:'flex', gap:6 }}>
                            <button 
                              onClick={() => handleUpdateStatus(selectedDate, a.id, 'Selesai')}
                              style={{ padding:'3px 8px', borderRadius:6, border:'none', background:'#e6fcf5', color:'#0ca678', fontSize:11, fontWeight:600, cursor:'pointer' }}
                            >
                              Selesai
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(selectedDate, a.id, 'Dibatalkan')}
                              style={{ padding:'3px 8px', borderRadius:6, border:'none', background:'#fff5f5', color:'#e03131', fontSize:11, fontWeight:600, cursor:'pointer' }}
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize:11, color:'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} selectedDate={selectedLabel} />
    </div>
  );
};

export default JadwalTemu;
