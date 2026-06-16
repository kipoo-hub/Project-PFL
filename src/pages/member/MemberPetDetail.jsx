import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { crmState } from '../../lib/crmState';

export default function MemberPetDetail() {
  const { id } = useParams();
  const { member } = useMemberAuth();
  const navigate = useNavigate();

  const [pet, setPet] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [vaccines, setVaccines] = useState([]);

  const loadPetData = () => {
    crmState.init();
    const email = member?.email || 'demo@email.com';
    
    // Find pet
    const memberPets = crmState.getMemberPets(email);
    const foundPet = memberPets.find(p => p.id === id);
    if (!foundPet) {
      setPet(null);
      return;
    }
    setPet(foundPet);

    // Load and filter appointments by pet name
    const allAppts = crmState.getMemberAppointments(email);
    const petAppts = allAppts.filter(a => a.petName?.toLowerCase() === foundPet.nama?.toLowerCase());
    setAppointments(petAppts);

    // Load and filter medical records by pet name
    const allRecords = crmState.getMemberMedicalRecords(email);
    const petRecords = allRecords.filter(r => r.petName?.toLowerCase() === foundPet.nama?.toLowerCase());
    setRecords(petRecords);

    // Load and filter vaccines by pet name
    const allVaccines = crmState.getVaccines();
    const petVaccines = allVaccines.filter(v => v.petName?.toLowerCase() === foundPet.nama?.toLowerCase());
    setVaccines(petVaccines);
  };

  useEffect(() => {
    loadPetData();

    const handleUpdate = () => {
      loadPetData();
    };
    window.addEventListener('crm_change', handleUpdate);
    return () => window.removeEventListener('crm_change', handleUpdate);
  }, [id, member]);

  if (!pet) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 text-center shadow-sm">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-slate-700">Hewan Tidak Ditemukan</h3>
        <p className="text-slate-400 text-sm max-w-sm mt-1 mb-6">Profil hewan peliharaan tidak ada atau Anda tidak memiliki akses ke data ini.</p>
        <button 
          onClick={() => navigate('/member/hewan')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition"
        >
          Kembali ke Daftar Hewan
        </button>
      </div>
    );
  }

  const getAge = (birthDateStr) => {
    if (!birthDateStr) return 'Umur tidak diketahui';
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let ageYears = today.getFullYear() - birthDate.getFullYear();
    let ageMonths = today.getMonth() - birthDate.getMonth();
    
    if (ageMonths < 0 || (ageMonths === 0 && today.getDate() < birthDate.getDate())) {
      ageYears--;
      ageMonths += 12;
    }
    
    if (ageYears > 0) {
      return `${ageYears} tahun` + (ageMonths > 0 ? ` ${ageMonths} bulan` : '');
    }
    return `${ageMonths} bulan`;
  };

  const petEmoji = (sp) => {
    const s = sp?.toLowerCase();
    if (s === 'anjing') return '🐕';
    if (s === 'kucing') return '🐈';
    if (s === 'kelinci') return '🐇';
    if (s === 'burung') return '🦜';
    return '🐾';
  };

  const getPastelBgClass = (sp) => {
    const s = sp?.toLowerCase();
    if (s === 'anjing') return 'from-amber-100 to-amber-50 text-amber-600 border-amber-200';
    if (s === 'kucing') return 'from-sky-100 to-sky-50 text-sky-600 border-sky-200';
    if (s === 'kelinci') return 'from-purple-100 to-purple-50 text-purple-600 border-purple-200';
    return 'from-emerald-100 to-emerald-50 text-emerald-600 border-emerald-200';
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Sehat') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (status === 'Vaksin Jatuh Tempo') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200'; // Perlu Perhatian
  };

  return (
    <div className="pb-10">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/member/hewan')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition"
      >
        <span className="text-base">←</span> Kembali ke Daftar Hewan
      </button>

      {/* Pet Header Card */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm mb-6">
        <div className={`h-32 bg-gradient-to-r ${getPastelBgClass(pet.spesies)} flex items-end px-6 pb-4 relative`}>
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border bg-white ${getStatusBadgeClass(pet.status)} shadow-sm`}>
              Status: {pet.status}
            </span>
          </div>
        </div>
        <div className="px-6 pb-6 pt-4 flex flex-col md:flex-row items-start md:items-center gap-5 -translate-y-6 md:translate-y-0">
          <div className={`w-24 h-24 rounded-2xl bg-gradient-to-tr ${getPastelBgClass(pet.spesies)} flex items-center justify-center text-5xl border shadow-md bg-white -mt-12 md:mt-0 z-10`}>
            {petEmoji(pet.spesies)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">{pet.nama}</h1>
            <p className="text-slate-400 font-medium text-sm mt-0.5">
              {pet.spesies} · {pet.ras || 'Blasteran'} · {getAge(pet.tanggalLahir)}
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
            <button 
              onClick={() => navigate('/member/janji', { state: { openBookingModal: true, selectPet: pet.nama } })}
              className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm transition active:scale-95 text-center"
            >
              📅 Buat Janji Temu
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {[
            { id: 'summary', label: 'Ringkasan', icon: '📝' },
            { id: 'medical', label: 'Rekam Medis', icon: '📋' },
            { id: 'vaccines', label: 'Vaksinasi', icon: '💉' },
            { id: 'appointments', label: 'Janji Temu', icon: '📅' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition ${
                activeTab === tab.id 
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/20' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* SUMMARY TAB */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-4">Informasi Dasar Peliharaan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Nama Lengkap', value: pet.nama },
                    { label: 'Spesies / Jenis', value: pet.spesies },
                    { label: 'Ras / Breed', value: pet.ras || '-' },
                    { label: 'Tanggal Lahir', value: pet.tanggalLahir || '-' },
                    { label: 'Jenis Kelamin', value: pet.jenisKelamin },
                    { label: 'Berat Badan', value: pet.berat ? `${pet.berat} kg` : '-' },
                    { label: 'Warna Bulu', value: pet.warna || '-' },
                    { label: 'Status Sterilisasi', value: pet.sterilisasi ? 'Sudah Steril' : 'Belum Steril' }
                  ].map((info) => (
                    <div key={info.label} className="p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{info.label}</span>
                      <span className="text-sm font-bold text-slate-700">{info.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-base font-bold text-slate-800 mb-3">Status Kesehatan Saat Ini</h3>
                <div className={`p-4 rounded-xl border flex gap-3 ${getStatusBadgeClass(pet.status)}`}>
                  <div className="text-xl">
                    {pet.status === 'Sehat' ? '🟢' : pet.status === 'Vaksin Jatuh Tempo' ? '🟡' : '🔴'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Status: {pet.status}</h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      {pet.status === 'Sehat' 
                        ? 'Hewan peliharaan Anda dalam kondisi prima. Tetap berikan asupan makanan sehat dan pemeriksaan berkala.'
                        : pet.status === 'Vaksin Jatuh Tempo'
                        ? 'Jadwal imunisasi berkala sudah memasuki masa jatuh tempo. Harap segera daftarkan janji vaksinasi agar kekebalan tubuhnya terjaga.'
                        : 'Membutuhkan perhatian klinis khusus atau pengawasan resep obat aktif. Silakan hubungi dokter hewan jika ada gejala mengkhawatirkan.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEDICAL RECORDS TAB */}
          {activeTab === 'medical' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 mb-2">Riwayat Pemeriksaan Medis</h3>
              {records.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed text-slate-400 text-sm">
                  Belum ada rekam medis terdaftar untuk {pet.nama}.
                </div>
              ) : (
                <div className="space-y-4">
                  {records.map((record) => (
                    <div key={record.id} className="p-5 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-50 mb-3">
                        <div>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">{record.id}</span>
                          <span className="text-xs text-slate-400 font-medium ml-2">{record.date}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          Dokter Pemeriksa: <strong className="text-slate-700">{record.doctor}</strong>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong className="text-slate-700">Diagnosis:</strong>
                          <div className="text-slate-600 mt-0.5">{record.diagnosis}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-2 border-t border-slate-50/50">
                          <div>
                            <strong className="text-slate-700 text-xs">Tindakan Medis:</strong>
                            <div className="text-slate-500 text-xs mt-0.5">{record.action}</div>
                          </div>
                          <div>
                            <strong className="text-slate-700 text-xs">Terapi / Resep Obat:</strong>
                            <div className="text-slate-500 text-xs mt-0.5">{record.treatment}</div>
                          </div>
                        </div>
                        {record.notes && (
                          <div className="bg-amber-50/50 border border-amber-100/30 p-2.5 rounded-lg text-xs text-slate-600 mt-2">
                            <strong>Catatan Tambahan:</strong> {record.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VACCINES TAB */}
          {activeTab === 'vaccines' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 mb-2">Jadwal & Riwayat Imunisasi</h3>
              {vaccines.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed text-slate-400 text-sm">
                  Belum ada rekam vaksinasi terdaftar untuk {pet.nama}.
                </div>
              ) : (
                <div className="overflow-hidden border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <th className="p-4">Jenis Vaksin</th>
                        <th className="p-4">Tanggal Jatuh Tempo</th>
                        <th className="p-4">Sisa Hari</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {vaccines.map((v) => {
                        const isOverdue = v.daysRemaining < 0;
                        const statusText = v.status === 'Sudah Diingatkan' ? 'Selesai / Terjadwal' : (isOverdue ? 'Terlambat' : 'Jatuh Tempo');
                        const colorClass = v.status === 'Sudah Diingatkan' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : (isOverdue ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800');

                        return (
                          <tr key={v.id} className="hover:bg-slate-50/30">
                            <td className="p-4 font-bold text-slate-700">{v.vaccineType}</td>
                            <td className="p-4 text-slate-500">{v.dueDate}</td>
                            <td className="p-4 text-slate-500">{isOverdue ? `${Math.abs(v.daysRemaining)} hari terlambat` : `${v.daysRemaining} hari lagi`}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
                                {statusText}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* APPOINTMENTS TAB */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 mb-2">Riwayat Janji Temu</h3>
              {appointments.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed text-slate-400 text-sm">
                  Belum ada janji temu terdaftar untuk {pet.nama}.
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appt) => {
                    const badgeClass = {
                      'Dikonfirmasi': 'bg-emerald-100 text-emerald-800 border-emerald-200',
                      'Menunggu': 'bg-amber-100 text-amber-800 border-amber-200',
                      'Selesai': 'bg-slate-100 text-slate-800 border-slate-200',
                      'Dibatalkan': 'bg-rose-100 text-rose-800 border-rose-200'
                    };

                    return (
                      <div key={appt.id} className="p-4 bg-white rounded-xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-slate-200 transition shadow-sm">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-700">{appt.service}</div>
                          <div className="text-xs text-slate-400 font-semibold flex flex-wrap gap-x-4">
                            <span>📅 {appt.date}</span>
                            <span>⏰ {appt.time} WIB</span>
                            <span>👨‍⚕️ {appt.doctor}</span>
                          </div>
                          {appt.notes && <p className="text-xs text-slate-500 mt-1 italic">"{appt.notes}"</p>}
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badgeClass[appt.status] || 'bg-slate-100 text-slate-800'}`}>
                          {appt.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
