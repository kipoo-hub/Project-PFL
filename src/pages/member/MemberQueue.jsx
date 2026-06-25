import React, { useState, useEffect } from 'react';
import { queueService, pasienService } from '../../lib/supabaseService';

export default function MemberQueue() {
  const member = (() => {
    try { return JSON.parse(localStorage.getItem('memberUser')); } catch { return null; }
  })();
  const [queueList, setQueueList] = useState([]);
  const [pets, setPets] = useState([]);
  const [myQueue, setMyQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    petName: '',
    service: 'Konsultasi Dokter',
    type: 'Datang Sekarang', // 'Datang Sekarang' | 'Jadwalkan'
    appointmentTime: '09:00 WIB'
  });

  const loadPets = async () => {
    if (!member?.id) return;
    try {
      const list = await pasienService.getByMemberId(member.id);
      setPets(list || []);
      if (list && list.length > 0) {
        setFormData(prev => ({ ...prev, petName: list[0].nama }));
      }
    } catch (err) {
      console.error('Failed to load member pets for queue form:', err);
    }
  };

  useEffect(() => {
    loadQueue();
    loadPets();

    // Auto refresh queue position every 10 seconds
    const interval = setInterval(loadQueue, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const list = await queueService.getAll();
      setQueueList(list || []);

      // Find if current member has an active queue
      const active = (list || []).find(q =>
        q.email?.toLowerCase() === member?.email?.toLowerCase() &&
        ['Menunggu', 'Dipanggil', 'Dilayani'].includes(q.status)
      );
      setMyQueue(active || null);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeQueue = async (e) => {
    e.preventDefault();
    const petToUse = formData.petName || 'Buddy';

    await queueService.add({
      ownerName: member?.name || 'Member',
      email: member?.email || '',
      petName: petToUse,
      service: formData.service,
      type: formData.type,
      appointmentTime: formData.type === 'Jadwalkan' ? formData.appointmentTime : null
    });

    await loadQueue();
  };

  const handleCancelQueue = async () => {
    if (!myQueue) return;
    if (window.confirm('Apakah Anda yakin ingin membatalkan nomor antrian Anda?')) {
      await queueService.updateStatus(myQueue.id, 'Batal');
      await loadQueue();
    }
  };

  // Calculate stats for active queue
  const getQueuePosition = () => {
    if (!myQueue) return 0;
    return queueList.filter(q => 
      ['Menunggu', 'Dipanggil'].includes(q.status) && 
      q.queueNumber < myQueue.queueNumber
    ).length;
  };

  const currentServing = queueList.find(q => q.status === 'Dilayani')?.queueNumber || 'Belum ada';

  if (loading) {
    return <div className="p-10 text-center text-slate-400">Memuat data...</div>;
  }

  return (
    <div className="pb-10 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800">Antrian Digital Klinik</h1>
        <div className="text-slate-500 text-sm">Ambil nomor antrian online untuk meminimalisir waktu tunggu di ruang tunggu klinik.</div>
      </div>

      {/* Main Grid: Left side details, Right side display info */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Left Panel: Taking Queue or Active Queue status */}
        <div>
          {myQueue ? (
            /* ACTIVE QUEUE CARD */
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm flex flex-col items-center gap-6">
              <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
                Nomor Antrian Anda Aktif
              </span>
              
              <div className="bg-gradient-to-br from-emerald-50 to-teal-100 border-2 border-emerald-300 w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-lg shadow-emerald-500/10">
                <span className="text-6xl font-black text-emerald-600 leading-none">{myQueue.queueNumber}</span>
                <span className="text-xs text-emerald-700 font-bold mt-2 bg-white/60 px-2 py-0.5 rounded-full">{myQueue.service}</span>
              </div>

              <div className="text-center flex flex-col gap-2">
                <h3 className="text-lg font-bold text-slate-800 m-0 flex items-center justify-center gap-2">
                  Status: 
                  <span className={`px-3 py-1 rounded-full text-xs ${myQueue.status === 'Dipanggil' ? 'bg-rose-100 text-rose-700 border border-rose-200' : myQueue.status === 'Dilayani' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                    {myQueue.status === 'Dipanggil' ? '⚠️ SILAKAN MASUK (Dipanggil)' : myQueue.status === 'Dilayani' ? '🩺 Sedang Dilayani' : '⏳ Menunggu'}
                  </span>
                </h3>
                <p className="text-sm text-slate-500 m-0 mt-1">
                  Terdaftar untuk: <strong className="text-slate-700">{myQueue.petName}</strong> ({myQueue.registeredTime})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full border-y border-slate-100 py-4 mt-2">
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Antrian Di Depan Anda</div>
                  <div className="text-xl font-black text-slate-700">{getQueuePosition()} Hewan</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Estimasi Tunggu</div>
                  <div className="text-xl font-black text-slate-700">{getQueuePosition() * 15} Menit</div>
                </div>
              </div>

              <button
                onClick={handleCancelQueue}
                className="w-full py-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold transition active:scale-95"
              >
                Batalkan Antrian
              </button>
            </div>
          ) : (
            /* TAKE QUEUE FORM */
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-1">Ambil Nomor Antrian Online</h3>
              <p className="text-sm text-slate-500 mb-6">Silakan isi detail layanan untuk mendapatkan nomor antrian digital Anda hari ini.</p>

              <form onSubmit={handleTakeQueue} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1.5 tracking-wider">PILIH HEWAN PELIHARAAN</label>
                    <select
                      value={formData.petName}
                      onChange={e => setFormData(prev => ({ ...prev, petName: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    >
                      {pets.length === 0 ? (
                        <option value="Buddy">Buddy (Anjing)</option>
                      ) : (
                        pets.map(p => (
                          <option key={p.id} value={p.nama}>{p.nama} ({p.spesies})</option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1.5 tracking-wider">JENIS LAYANAN</label>
                    <select
                      value={formData.service}
                      onChange={e => setFormData(prev => ({ ...prev, service: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    >
                      <option value="Konsultasi Dokter">Konsultasi Dokter</option>
                      <option value="Vaksinasi">Vaksinasi</option>
                      <option value="Grooming">Grooming</option>
                      <option value="Pemeriksaan Darah">Pemeriksaan Darah</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1.5 tracking-wider">WAKTU KEDATANGAN</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'Datang Sekarang' }))}
                      className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition ${formData.type === 'Datang Sekarang' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/></svg>
                      Datang Sekarang
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'Jadwalkan' }))}
                      className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition ${formData.type === 'Jadwalkan' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      Jadwalkan Jam
                    </button>
                  </div>
                </div>

                {formData.type === 'Jadwalkan' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1.5 tracking-wider">PILIH JAM KEDATANGAN</label>
                    <select
                      value={formData.appointmentTime}
                      onChange={e => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    >
                      <option value="09:00 WIB">09:00 WIB</option>
                      <option value="10:00 WIB">10:00 WIB</option>
                      <option value="11:00 WIB">11:00 WIB</option>
                      <option value="13:30 WIB">13:30 WIB</option>
                      <option value="14:30 WIB">14:30 WIB</option>
                      <option value="15:30 WIB">15:30 WIB</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-2 py-3.5 rounded-xl border-none bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold cursor-pointer shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition active:scale-95"
                >
                  Ambil Nomor Antrian
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Panel: Display Info Monitor */}
        <div className="flex flex-col gap-6">
          {/* Monitor Card */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Monitor Utama Klinik</span>
            </div>
            
            <div className="flex flex-col items-center my-6 pb-6 border-b border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Sedang Dilayani</div>
              <div className="text-6xl font-black text-emerald-400 my-2">{currentServing}</div>
              <div className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">Loket Pemeriksaan Dokter</div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Antrian Hari Ini</span>
                <span className="font-bold text-slate-200">{queueList.length} Antrian</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Antrian Menunggu</span>
                <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                  {queueList.filter(q => ['Menunggu', 'Dipanggil'].includes(q.status)).length} Pasien
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Estimasi Rata-rata</span>
                <span className="font-bold text-slate-200">~15 Menit / Pasien</span>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-slate-600 text-xs leading-relaxed">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Panduan Antrian
            </h4>
            <ul className="pl-5 m-0 flex flex-col gap-2 list-disc marker:text-slate-300">
              <li>Harap datang 10 menit sebelum nomor antrian Anda dipanggil.</li>
              <li>Tunjukkan halaman ini ke resepsionis saat tiba untuk konfirmasi kehadiran.</li>
              <li>Jika terlambat dipanggil lebih dari 3 nomor, antrian Anda akan dilewati dan harus mengambil antrian baru.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
