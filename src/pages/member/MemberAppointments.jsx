import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { jadwalService, pasienService } from '../../lib/supabaseService';

const SERVICES = [
  { id: 'srv1', title: 'Konsultasi Dokter Hewan', desc: 'Pemeriksaan kesehatan, diagnosis, dan resep obat.', icon: '🩺', cost: 'Rp 75.000' },
  { id: 'srv2', title: 'Vaksinasi', desc: 'Imunisasi rabies, tricat, leukemia, dll.', icon: '💉', cost: 'Rp 150.000 - Rp 250.000' },
  { id: 'srv3', title: 'Grooming', desc: 'Mandi antijamur, potong bulu, potong kuku, dll.', icon: '✂️', cost: 'Rp 80.000 - Rp 150.000' },
  { id: 'srv4', title: 'Operasi / Tindakan Medis', desc: 'Sterilisasi jantan/betina, penanganan luka jahitan.', icon: '🩹', cost: 'Mulai Rp 500.000' },
  { id: 'srv5', title: 'Rawat Inap / Penitipan', desc: 'Penitipan hewan sehat & perawatan medis rawat inap.', icon: '🏥', cost: 'Rp 100.000 - Rp 150.000 / malam' },
  { id: 'srv6', title: 'Pemeriksaan Darah', desc: 'Tes laboratorium lengkap, kolesterol, ginjal, dll.', icon: '🔬', cost: 'Rp 200.000' }
];

const DOCTORS = [
  { id: 'doc1', name: 'Dr. Rizal', title: 'Spesialis Bedah & Umum', avatar: '👨‍⚕️' },
  { id: 'doc2', name: 'Dr. Maya', title: 'Dermatologi & Internis', avatar: '👩‍⚕️' },
  { id: 'doc3', name: 'Dr. Sarah', title: 'Spesialis Gigi & Umum', avatar: '👩‍⚕️' }
];

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];

export default function MemberAppointments() {
  const { member: authMember } = useMemberAuth();
  const location = useLocation();

  const member = (() => {
    try { return JSON.parse(localStorage.getItem('memberUser')); } catch { return authMember; }
  })() || authMember;

  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Form selections
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  const loadAppointments = async () => {
    if (!member?.id) return;
    try {
      setLoading(true);
      setError(null);
      const [appts, memberPets] = await Promise.all([
        jadwalService.getByMemberId(member.id),
        pasienService.getByMemberId(member.id)
      ]);
      setAppointments(appts || []);
      setPets(memberPets || []);
      if (memberPets?.length > 0 && !selectedPet) {
        setSelectedPet(memberPets[0].nama);
      }
    } catch (err) {
      setError('Gagal memuat data janji temu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();

    if (location.state?.openBookingModal) {
      if (location.state.selectPet) {
        setSelectedPet(location.state.selectPet);
      }
      setIsWizardOpen(true);
      setStep(1);
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [member?.id, location.state]);

  const handleCancel = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan janji temu ini?')) {
      await jadwalService.cancel(id);
      loadAppointments();
    }
  };

  const startBooking = () => {
    setSelectedService(null);
    if (pets.length > 0) setSelectedPet(pets[0].nama);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setNotes('');
    setStep(1);
    setIsWizardOpen(true);
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedService) {
      alert('Pilih salah satu layanan terlebih dahulu.');
      return;
    }
    if (step === 2) {
      if (!selectedPet) {
        alert('Pilih hewan peliharaan terlebih dahulu.');
        return;
      }
      if (!selectedDoctor) {
        alert('Pilih dokter terlebih dahulu.');
        return;
      }
    }
    if (step === 3) {
      if (!selectedDate) {
        alert('Pilih tanggal janji temu.');
        return;
      }
      if (!selectedTime) {
        alert('Pilih slot waktu janji temu.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleConfirmBooking = async () => {
    const apptData = {
      petName: selectedPet,
      service: selectedService.title,
      doctor: selectedDoctor.name,
      date: selectedDate,
      time: selectedTime,
      notes: notes
    };

    await jadwalService.create({ ...apptData, memberId: member.id });
    setIsWizardOpen(false);
    loadAppointments();
  };

  // Filter categories
  const upcomingAppts = appointments.filter(a => a.status === 'Menunggu' || a.status === 'Dikonfirmasi');
  const pastAppts = appointments.filter(a => a.status === 'Selesai');
  const cancelledAppts = appointments.filter(a => a.status === 'Dibatalkan');

  const getBadgeClass = (status) => {
    if (status === 'Dikonfirmasi') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (status === 'Menunggu') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (status === 'Selesai') return 'bg-slate-100 text-slate-800 border-slate-200';
    return 'bg-rose-100 text-rose-800 border-rose-200'; // Dibatalkan
  };

  if (loading) return <div className="p-8 text-center text-slate-400 text-sm">Memuat data...</div>;
  if (error) return <div className="p-8 text-center text-rose-500 text-sm">{error}</div>;

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Janji Temu Medis</h1>
          <p className="text-slate-500 text-sm mt-1">Jadwalkan kunjungan dokter atau pantau riwayat janji temu klinis.</p>
        </div>
        <button 
          onClick={startBooking}
          id="btn-buat-janji-page"
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition duration-150 shadow-sm shadow-emerald-200 active:scale-95"
        >
          📅 Buat Janji Baru
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <div className="flex border-b border-slate-100">
          {[
            { id: 'upcoming', label: `Mendatang (${upcomingAppts.length})`, color: 'emerald' },
            { id: 'past', label: `Riwayat Selesai (${pastAppts.length})`, color: 'slate' },
            { id: 'cancelled', label: `Dibatalkan (${cancelledAppts.length})`, color: 'rose' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none px-6 py-4 text-sm font-bold border-b-2 text-center transition ${
                activeTab === tab.id 
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/20' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Lists */}
        <div className="p-6">
          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              {upcomingAppts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Tidak ada janji temu mendatang.
                </div>
              ) : (
                upcomingAppts.map((appt) => (
                  <div key={appt.id} className="p-5 bg-white rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:border-slate-200 transition">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 bg-slate-50 border px-2 py-0.5 rounded-md">{appt.id}</span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getBadgeClass(appt.status)}`}>
                          {appt.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 mt-1">{appt.service} — <strong className="text-emerald-700">{appt.petName}</strong></h3>
                      <div className="text-xs text-slate-400 font-semibold flex flex-wrap gap-x-4 pt-1">
                        <span>📅 Tanggal: <strong className="text-slate-600">{appt.date}</strong></span>
                        <span>⏰ Jam: <strong className="text-slate-600">{appt.time} WIB</strong></span>
                        <span>👨‍⚕️ Dokter: <strong className="text-slate-600">{appt.doctor}</strong></span>
                      </div>
                      {appt.notes && (
                        <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mt-2 italic">"{appt.notes}"</p>
                      )}
                    </div>
                    <div>
                      <button 
                        onClick={() => handleCancel(appt.id)}
                        className="w-full md:w-auto px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-bold rounded-xl transition active:scale-95 text-center"
                      >
                        🚫 Batalkan Janji
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'past' && (
            <div className="space-y-4">
              {pastAppts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Tidak ada riwayat janji temu selesai.
                </div>
              ) : (
                pastAppts.map((appt) => (
                  <div key={appt.id} className="p-5 bg-white rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm opacity-90">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 bg-slate-50 border px-2 py-0.5 rounded-md">{appt.id}</span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getBadgeClass(appt.status)}`}>
                          Selesai
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-700 mt-1">{appt.service} — {appt.petName}</h3>
                      <div className="text-xs text-slate-400 font-semibold flex flex-wrap gap-x-4 pt-1">
                        <span>📅 Tanggal: {appt.date}</span>
                        <span>⏰ Jam: {appt.time} WIB</span>
                        <span>👨‍⚕️ Dokter: {appt.doctor}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'cancelled' && (
            <div className="space-y-4">
              {cancelledAppts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Tidak ada janji temu dibatalkan.
                </div>
              ) : (
                cancelledAppts.map((appt) => (
                  <div key={appt.id} className="p-5 bg-white rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm opacity-85">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 bg-slate-50 border px-2 py-0.5 rounded-md">{appt.id}</span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getBadgeClass(appt.status)}`}>
                          Batal
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-500 mt-1">{appt.service} — {appt.petName}</h3>
                      <div className="text-xs text-slate-400 font-semibold flex flex-wrap gap-x-4 pt-1">
                        <span>📅 Tanggal: {appt.date}</span>
                        <span>⏰ Jam: {appt.time} WIB</span>
                        <span>👨‍⚕️ Dokter: {appt.doctor}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsWizardOpen(false)}></div>
          
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative z-10 overflow-y-auto max-h-[90vh] border border-slate-100 flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Pendaftaran Janji Temu Medis</h3>
                <p className="text-slate-400 text-xs mt-0.5">Selesaikan 4 langkah pemesanan jadwal dokter.</p>
              </div>
              <button onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>

            {/* Step Stepper */}
            <div className="flex justify-between items-center px-4 mb-6">
              {[
                { s: 1, label: 'Layanan' },
                { s: 2, label: 'Pasien & Dokter' },
                { s: 3, label: 'Jadwal' },
                { s: 4, label: 'Konfirmasi' }
              ].map((stepItem) => (
                <div key={stepItem.s} className="flex flex-col items-center gap-1.5 flex-1 relative last:flex-initial">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition ${
                    step >= stepItem.s 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    {stepItem.s}
                  </div>
                  <span className={`text-[10px] font-bold ${step >= stepItem.s ? 'text-slate-700' : 'text-slate-400'}`}>{stepItem.label}</span>
                  {stepItem.s < 4 && (
                    <div className={`absolute top-4 left-[60%] right-[-40%] h-[2px] -z-10 ${
                      step > stepItem.s ? 'bg-emerald-600' : 'bg-slate-100'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Contents */}
            <div className="flex-1 overflow-y-auto min-h-[300px] pr-1">
              {/* STEP 1: PILIH LAYANAN */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700">Pilih Kategori Layanan</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SERVICES.map((srv) => (
                      <div 
                        key={srv.id}
                        onClick={() => setSelectedService(srv)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition flex gap-3 ${
                          selectedService?.id === srv.id
                            ? 'border-emerald-600 bg-emerald-50/10'
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/30'
                        }`}
                      >
                        <div className="text-3xl p-2 bg-slate-50 rounded-xl self-start">{srv.icon}</div>
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm">{srv.title}</h5>
                          <p className="text-slate-400 text-xs mt-1 leading-relaxed">{srv.desc}</p>
                          <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-2">{srv.cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: PILIH HEWAN & DOKTER */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Select Pet */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-700">Pilih Pasien (Hewan Peliharaan)</h4>
                    {pets.length === 0 ? (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                        Anda belum mendaftarkan hewan peliharaan. Silakan tutup modal dan tambahkan hewan terlebih dahulu.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {pets.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPet(p.nama)}
                            className={`p-3 rounded-xl border-2 cursor-pointer text-center transition ${
                              selectedPet === p.nama
                                ? 'border-emerald-600 bg-emerald-50/15'
                                : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/20'
                            }`}
                          >
                            <span className="text-2xl block mb-1">{p.spesies === 'Anjing' ? '🐕' : p.spesies === 'Kucing' ? '🐈' : p.spesies === 'Kelinci' ? '🐇' : '🐾'}</span>
                            <span className="font-bold text-slate-700 text-xs">{p.nama}</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">{p.spesies}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Select Doctor */}
                  <div className="space-y-2 border-t border-slate-100 pt-5">
                    <h4 className="text-sm font-bold text-slate-700">Pilih Dokter Spesialis</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {DOCTORS.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDoctor(doc)}
                          className={`p-4 rounded-xl border-2 cursor-pointer text-center transition ${
                            selectedDoctor?.id === doc.id
                              ? 'border-emerald-600 bg-emerald-50/15'
                              : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/20'
                          }`}
                        >
                          <div className="text-3xl mb-1">{doc.avatar}</div>
                          <h5 className="font-bold text-slate-700 text-xs">{doc.name}</h5>
                          <p className="text-[10px] text-slate-400 mt-1">{doc.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PILIH TANGGAL & WAKTU */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Calendar input */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-700">Pilih Tanggal</h4>
                      <input 
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                      />
                    </div>

                    {/* Time Picker */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-700">Pilih Slot Jam Layanan</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTime(t)}
                            className={`py-2 rounded-xl text-xs font-semibold border transition ${
                              selectedTime === t
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-50'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                            }`}
                          >
                            {t} WIB
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2 border-t border-slate-100 pt-5">
                    <h4 className="text-sm font-bold text-slate-700">Catatan Khusus (Keluhan/Permintaan)</h4>
                    <textarea
                      placeholder="Tuliskan keluhan peliharaan Anda secara singkat di sini..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition resize-none"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* STEP 4: RINGKASAN KONFIRMASI */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="bg-emerald-50/20 border border-emerald-100/50 p-5 rounded-2xl">
                    <div className="text-emerald-700 text-center mb-4">
                      <span className="text-4xl">📄</span>
                      <h4 className="font-bold text-base mt-2">Ringkasan Janji Temu Medis</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Harap periksa kembali detail pesanan Anda sebelum mengonfirmasi.</p>
                    </div>

                    <div className="divide-y divide-slate-100 text-sm font-medium">
                      <div className="py-2.5 flex justify-between">
                        <span className="text-slate-400">Layanan</span>
                        <span className="text-slate-700 font-bold">{selectedService?.title}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-slate-400">Peliharaan</span>
                        <span className="text-slate-700 font-bold">{selectedPet}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-slate-400">Dokter Spesialis</span>
                        <span className="text-slate-700 font-bold">{selectedDoctor?.name} ({selectedDoctor?.title})</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-slate-400">Tanggal Kunjungan</span>
                        <span className="text-slate-700 font-bold">{selectedDate}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-slate-400">Waktu Kedatangan</span>
                        <span className="text-slate-700 font-bold">{selectedTime} WIB</span>
                      </div>
                      {notes && (
                        <div className="py-2.5">
                          <span className="text-slate-400 block mb-1">Catatan Keluhan</span>
                          <span className="text-slate-600 block text-xs bg-white border p-3 rounded-xl italic">"{notes}"</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed max-w-md mx-auto pt-2">
                    Dengan mengonfirmasi, janji temu Anda akan diteruskan ke sistem pendaftaran klinik. Silakan datang 10 menit sebelum waktu kunjungan.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition"
                >
                  Kembali
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm shadow-emerald-100"
                >
                  Lanjut
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm shadow-emerald-100"
                >
                  Konfirmasi & Daftarkan
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
