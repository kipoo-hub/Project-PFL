import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { vaccineService } from '../../lib/supabaseService';

export default function MemberVaccines() {
  const { member: authMember } = useMemberAuth();
  const navigate = useNavigate();

  const member = (() => {
    try { return JSON.parse(localStorage.getItem('memberUser')); } catch { return authMember; }
  })() || authMember;

  const [vaccines, setVaccines] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPet, setFilterPet] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const loadVaccines = async () => {
    if (!member?.email) return;
    try {
      setLoading(true);
      setError(null);
      const memberVaccines = await vaccineService.getByEmail(member.email);
      setVaccines(memberVaccines || []);

      // Derive unique pets from vaccine data
      const uniquePets = [];
      const seen = new Set();
      (memberVaccines || []).forEach(v => {
        if (v.petName && !seen.has(v.petName)) {
          seen.add(v.petName);
          uniquePets.push({ id: v.petName, nama: v.petName, spesies: v.species || '' });
        }
      });
      setPets(uniquePets);
    } catch (err) {
      setError('Gagal memuat data vaksinasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVaccines();
  }, [member?.email]);

  // Statistics calculation
  const totalVaccinesCount = vaccines.length;
  const completedCount = vaccines.filter(v => v.status === 'Sudah Diingatkan').length;
  const overdueCount = vaccines.filter(v => v.status === 'Belum Diingatkan' && v.daysRemaining < 0).length;
  const dueSoonCount = vaccines.filter(v => v.status === 'Belum Diingatkan' && v.daysRemaining >= 0 && v.daysRemaining <= 7).length;

  // Filter logic
  const filteredVaccines = vaccines.filter(v => {
    const matchPet = filterPet === 'All' || v.petName?.toLowerCase() === filterPet.toLowerCase();
    
    const isOverdue = v.daysRemaining < 0 && v.status === 'Belum Diingatkan';
    const isDueSoon = v.daysRemaining >= 0 && v.daysRemaining <= 7 && v.status === 'Belum Diingatkan';
    const isScheduled = v.daysRemaining > 7 && v.status === 'Belum Diingatkan';
    const isCompleted = v.status === 'Sudah Diingatkan';

    let matchStatus = true;
    if (filterStatus === 'overdue') matchStatus = isOverdue;
    else if (filterStatus === 'dueSoon') matchStatus = isDueSoon;
    else if (filterStatus === 'scheduled') matchStatus = isScheduled;
    else if (filterStatus === 'completed') matchStatus = isCompleted;

    return matchPet && matchStatus;
  });

  const getStatusBadge = (v) => {
    if (v.status === 'Sudah Diingatkan') {
      return { text: 'Selesai ✓', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
    if (v.daysRemaining < 0) {
      return { text: 'Terlambat ⚠️', className: 'bg-rose-100 text-rose-800 border-rose-200' };
    }
    if (v.daysRemaining <= 7) {
      return { text: 'Jatuh Tempo ⏰', className: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    return { text: 'Terjadwal 🗓️', className: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  if (loading) return <div className="p-8 text-center text-slate-400 text-sm">Memuat data...</div>;
  if (error) return <div className="p-8 text-center text-rose-500 text-sm">{error}</div>;

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Jadwal Vaksinasi</h1>
          <p className="text-slate-500 text-sm mt-1">Pantau dan kelola jadwal imunisasi tahunan hewan kesayangan Anda.</p>
        </div>
        <button 
          onClick={() => navigate('/member/janji', { state: { openBookingModal: true } })}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-sm active:scale-95"
        >
          💉 Booking Vaksinasi
        </button>
      </div>

      {/* Warning Banner */}
      {(overdueCount > 0 || dueSoonCount > 0) && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm">
          <div className="flex gap-3 items-start">
            <span className="text-3xl mt-0.5">⚠️</span>
            <div>
              <h4 className="font-bold text-rose-950 text-sm">Peringatan: Jadwal Vaksinasi Bermasalah!</h4>
              <p className="text-rose-700 text-xs mt-1 leading-relaxed">
                Terdapat <strong>{overdueCount} vaksin terlambat</strong> dan <strong>{dueSoonCount} vaksin hampir jatuh tempo</strong>. 
                Harap segera lakukan pemesanan janji temu vaksinasi agar sistem imun peliharaan Anda tetap terlindungi dengan optimal.
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/member/janji', { state: { openBookingModal: true } })}
            className="w-full md:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-sm transition active:scale-95 text-center"
          >
            Buat Janji Vaksinasi
          </button>
        </div>
      )}

      {/* Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1 - Total Vaksin */}
        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Vaksin</span>
            <span className="text-2xl font-bold text-slate-800 block mt-1">{totalVaccinesCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border bg-sky-50 border-sky-100 text-sky-600">
            💉
          </div>
        </div>

        {/* Card 2 - Selesai Imunisasi */}
        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Selesai Imunisasi</span>
            <span className="text-2xl font-bold text-slate-800 block mt-1">{completedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border bg-emerald-50 border-emerald-100 text-emerald-600">
            ✓
          </div>
        </div>

        {/* Card 3 - Jatuh Tempo 7 Hari */}
        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Jatuh Tempo (7 Hari)</span>
            <span className="text-2xl font-bold text-slate-800 block mt-1">{dueSoonCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border bg-amber-50 border-amber-100 text-amber-600">
            ⏰
          </div>
        </div>

        {/* Card 4 - Terlambat Suntik */}
        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Terlambat Suntik</span>
            <span className="text-2xl font-bold text-slate-800 block mt-1">{overdueCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border bg-rose-50 border-rose-100 text-rose-600">
            ⚠️
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter Hewan:</span>
          <select 
            value={filterPet}
            onChange={(e) => setFilterPet(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="All">Semua Hewan ({pets.length})</option>
            {pets.map(p => (
              <option key={p.id} value={p.nama}>{p.nama} ({p.spesies})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter Status:</span>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="All">Semua Status</option>
            <option value="overdue">Terlambat ⚠️</option>
            <option value="dueSoon">Hampir Jatuh Tempo ⏰</option>
            <option value="scheduled">Terjadwal 🗓️</option>
            <option value="completed">Selesai Imunisasi ✓</option>
          </select>
        </div>
      </div>

      {/* Timeline / List */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span>📅</span> Timeline Jadwal Vaksinasi Pelanggan
        </h3>

        {filteredVaccines.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Tidak ada jadwal vaksinasi yang cocok dengan filter saat ini.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 pl-6 space-y-8 ml-3">
            {filteredVaccines.map((v) => {
              const badge = getStatusBadge(v);
              const isOverdue = v.daysRemaining < 0 && v.status === 'Belum Diingatkan';
              const isDueSoon = v.daysRemaining >= 0 && v.daysRemaining <= 7 && v.status === 'Belum Diingatkan';

              let pointColor = 'bg-slate-300';
              if (v.status === 'Sudah Diingatkan') pointColor = 'bg-emerald-500';
              else if (isOverdue) pointColor = 'bg-rose-500 animate-pulse';
              else if (isDueSoon) pointColor = 'bg-amber-500';

              return (
                <div key={v.id} className="relative">
                  {/* Timeline Point */}
                  <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${pointColor} shadow-sm`} />

                  {/* Card content */}
                  <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm sm:text-base">{v.vaccineType}</h4>
                        <span className="text-xs font-semibold text-slate-400 bg-white border px-1.5 py-0.5 rounded">ID: {v.id}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold mt-1">
                        Hewan Peliharaan: <strong className="text-emerald-700">{v.petName}</strong> · Jenis: {v.species}
                      </p>
                      <div className="text-xs text-slate-500 font-medium mt-2 flex gap-4">
                        <span>📅 Tanggal Target: <strong>{v.dueDate}</strong></span>
                        {v.status === 'Belum Diingatkan' && (
                          <span>
                            ⏳ {isOverdue 
                              ? `${Math.abs(v.daysRemaining)} hari terlambat` 
                              : `${v.daysRemaining} hari tersisa`}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${badge.className}`}>
                      {badge.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
