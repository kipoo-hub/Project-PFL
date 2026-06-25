import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { pasienService } from '../../lib/supabaseService';

export default function MemberPets() {
  const navigate = useNavigate();
  const location = useLocation();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);

  // Form states
  const [nama, setNama] = useState('');
  const [spesies, setSpesies] = useState('Anjing');
  const [ras, setRas] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('Jantan');
  const [berat, setBerat] = useState('');
  const [warna, setWarna] = useState('');
  const [sterilisasi, setSterilisasi] = useState(false);

  const getMember = () => {
    try {
      return JSON.parse(localStorage.getItem('memberUser'));
    } catch {
      return null;
    }
  };

  const loadPets = async () => {
    setLoading(true);
    setError(null);
    try {
      const member = getMember();
      if (!member?.id) {
        setPets([]);
        return;
      }
      const list = await pasienService.getByMemberId(member.id);
      setPets(list || []);
    } catch (err) {
      setError('Gagal memuat data hewan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();

    // Check if redirect requested opening the add modal
    if (location.state?.openAddModal) {
      openAddModal();
      // Clear location state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const openAddModal = () => {
    setEditingPet(null);
    setNama('');
    setSpesies('Anjing');
    setRas('');
    setTanggalLahir('');
    setJenisKelamin('Jantan');
    setBerat('');
    setWarna('');
    setSterilisasi(false);
    setIsModalOpen(true);
  };

  const openEditModal = (pet, e) => {
    e.stopPropagation(); // Prevent card click navigation
    setEditingPet(pet);
    setNama(pet.nama || '');
    setSpesies(pet.spesies || 'Anjing');
    setRas(pet.ras || '');
    setTanggalLahir(pet.tanggalLahir || '');
    setJenisKelamin(pet.jenisKelamin || 'Jantan');
    setBerat(pet.berat || '');
    setWarna(pet.warna || '');
    setSterilisasi(pet.sterilisasi || false);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Apakah Anda yakin ingin menghapus hewan ini?')) {
      try {
        await pasienService.delete(id);
        await loadPets();
      } catch (err) {
        alert('Gagal menghapus hewan. Silakan coba lagi.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const member = getMember();
    const petData = {
      nama,
      spesies,
      ras,
      tanggalLahir,
      jenisKelamin,
      berat: parseFloat(berat) || 0,
      warna,
      sterilisasi,
    };

    try {
      if (editingPet) {
        await pasienService.update(editingPet.id, petData);
      } else {
        await pasienService.add({ ...petData, memberId: member?.id });
      }
      setIsModalOpen(false);
      await loadPets();
    } catch (err) {
      alert('Gagal menyimpan data hewan. Silakan coba lagi.');
    }
  };

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

  const getStatusBadgeClass = (status) => {
    if (status === 'Sehat') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (status === 'Vaksin Jatuh Tempo') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200'; // Perlu Perhatian
  };

  const getPastelBgClass = (sp) => {
    const s = sp?.toLowerCase();
    if (s === 'anjing') return 'bg-amber-50 border-amber-100 text-amber-600';
    if (s === 'kucing') return 'bg-sky-50 border-sky-100 text-sky-600';
    if (s === 'kelinci') return 'bg-purple-50 border-purple-100 text-purple-600';
    return 'bg-emerald-50 border-emerald-100 text-emerald-600';
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hewan Peliharaan Saya</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola data profil dan pantau status kesehatan peliharaan Anda.</p>
        </div>
        <button 
          onClick={openAddModal}
          id="btn-tambah-hewan-page"
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition duration-200 shadow-sm shadow-emerald-200 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Tambah Hewan
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-500 text-sm font-medium">
          Memuat data...
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-sm font-medium text-center">
          {error}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <>
          {pets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center p-12 sm:p-16 text-center min-h-[400px]">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
                <span className="text-4xl">🐾</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Hewan Peliharaan</h3>
              <p className="text-slate-500 text-sm max-w-md mb-8 leading-relaxed">
                Daftarkan hewan kesayangan Anda terlebih dahulu untuk mulai mengelola profil, melihat rekam medis, dan menjadwalkan janji temu.
              </p>
              <button 
                onClick={openAddModal}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-xl transition border border-emerald-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Tambah Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <div 
                  key={pet.id} 
                  id={`pet-item-${pet.id}`}
                  onClick={() => navigate(`/member/hewan/${pet.id}`)}
                  className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                >
                  {/* Pet Card Header Banner */}
                  <div className="h-24 bg-gradient-to-r from-emerald-50 to-sky-50 relative flex items-end px-5 pb-3 border-b border-slate-50">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl border shadow-sm ${getPastelBgClass(pet.spesies)} translate-y-6 transform group-hover:scale-105 transition-transform duration-200 bg-white`}>
                      {petEmoji(pet.spesies)}
                    </div>
                    <div className="ml-auto">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(pet.status)} shadow-sm`}>
                        {pet.status}
                      </span>
                    </div>
                  </div>

                  {/* Pet Card Body */}
                  <div className="pt-8 px-5 pb-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{pet.nama}</h3>
                    <div className="text-sm text-slate-400 font-medium mt-0.5">{pet.spesies} · {pet.ras || 'Blasteran'}</div>
                    
                    {/* Details list */}
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4 text-xs text-slate-500 font-medium border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Umur</span>
                        {getAge(pet.tanggalLahir)}
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Berat</span>
                        {pet.berat ? `${pet.berat} kg` : '-'}
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Jenis Kelamin</span>
                        {pet.jenisKelamin}
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Sterilisasi</span>
                        {pet.sterilisasi ? 'Sudah (Ya)' : 'Belum (Tidak)'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-6 pt-3 border-t border-slate-50">
                      <button 
                        onClick={(e) => openEditModal(pet, e)}
                        className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl text-xs transition active:scale-95"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/member/hewan/${pet.id}`); }}
                        className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl text-xs transition active:scale-95 text-center"
                      >
                        👁️ Lihat Detail
                      </button>
                      <button 
                        onClick={(e) => handleDelete(pet.id, e)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-xl text-xs transition active:scale-95"
                        title="Hapus Hewan"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          {/* Content */}
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative z-10 overflow-y-auto max-h-[90vh] border border-slate-100">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">{editingPet ? 'Edit Data Hewan' : 'Daftarkan Hewan Baru'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nama Hewan</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Buddy, Luna, Mochi"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Jenis Hewan</label>
                  <select 
                    value={spesies}
                    onChange={(e) => setSpesies(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    <option value="Anjing">Anjing 🐕</option>
                    <option value="Kucing">Kucing 🐈</option>
                    <option value="Kelinci">Kelinci 🐇</option>
                    <option value="Burung">Burung 🦜</option>
                    <option value="Lainnya">Lainnya 🐾</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ras / Breed</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Golden, Persia"
                    value={ras}
                    onChange={(e) => setRas(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tanggal Lahir</label>
                  <input 
                    type="date" 
                    required
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Jenis Kelamin</label>
                  <select 
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    <option value="Jantan">Jantan</option>
                    <option value="Betina">Betina</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Berat Badan (Kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="Contoh: 12.5"
                    value={berat}
                    onChange={(e) => setBerat(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Warna Bulu</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Golden, Cokelat"
                    value={warna}
                    onChange={(e) => setWarna(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="sterilisasi"
                  checked={sterilisasi}
                  onChange={(e) => setSterilisasi(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="sterilisasi" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                  Sudah Disterilisasi (Kastrasi/Steril)
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm shadow-emerald-100"
                >
                  {editingPet ? 'Simpan Perubahan' : 'Daftarkan Hewan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
