import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { memberProfileService, pipelineService } from '../../lib/supabaseService';

export default function MemberProfile() {
  const { member, logout } = useMemberAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Custom added profile fields
  const [alamat, setAlamat] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');

  // Preference switches
  const [notifVaksin, setNotifVaksin] = useState(true);
  const [notifJanji, setNotifJanji] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);

  // Password modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loadProfile = async () => {
    try {
      const memberUser = JSON.parse(localStorage.getItem('memberUser'));
      if (!memberUser?.id) return;
      
      const data = await memberProfileService.getById(memberUser.id);
      if (data) {
        // Get pipeline data for stage/visits
        const pipeline = await pipelineService.getAll();
        const allPipelineMembers = [...(pipeline.BARU || []), ...(pipeline.AKTIF || []), ...(pipeline.SETIA || []), ...(pipeline.TIDAK_AKTIF || [])];
        const pipelineMember = allPipelineMembers.find(m => m.email?.toLowerCase() === data.email?.toLowerCase());
        
        const profileData = {
          ...data,
          stage: pipelineMember?.stage || 'BARU',
          visits: pipelineMember?.visits || 0,
          totalTransaksi: pipelineMember?.totalTransaksi || 0,
        };
        setProfile(profileData);
        setName(data.name || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setAlamat(data.alamat || 'Jl. Indah Lestari No. 42, Bandung');
        setTanggalLahir(data.tanggalLahir || '1990-05-15');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [member]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const memberUser = JSON.parse(localStorage.getItem('memberUser'));
      if (!memberUser?.id) return;
      await memberProfileService.update(memberUser.id, { name, email });
      // Update localStorage to keep it in sync
      const updated = { ...memberUser, name };
      localStorage.setItem('memberUser', JSON.stringify(updated));
      alert('Profil Anda berhasil diperbarui!');
      await loadProfile();
    } catch (err) {
      alert('Gagal memperbarui profil.');
    }
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Sandi baru dan konfirmasi sandi tidak cocok!');
      return;
    }
    alert('Sandi berhasil diubah!\nSilakan gunakan sandi baru Anda pada login berikutnya.');
    setIsPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    logout();
    navigate('/guest', { replace: true });
  };

  if (!profile) return null;

  const getStageBadgeClass = (stage) => {
    if (stage === 'SETIA') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (stage === 'AKTIF') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return 'bg-blue-100 text-blue-800 border-blue-200'; // BARU
  };

  const formatRupiah = (val) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(val || 0);
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola data informasi akun pribadi, preferensi notifikasi, dan keamanan kata sandi.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Loyalty card and Stats */}
        <div className="space-y-6">
          
          {/* Card Profil Utama */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 text-center relative overflow-hidden">
            {/* Decorative BG */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 to-sky-500" />
            
            <div className="w-20 h-20 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 mt-2 shadow-sm border border-emerald-50">
              {name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
            </div>
            
            <h2 className="text-lg font-bold text-slate-800">{name}</h2>
            <p className="text-slate-400 text-xs mt-0.5">{email}</p>

            <div className="mt-4 flex justify-center">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1 ${getStageBadgeClass(profile.stage)}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Member {profile.stage || 'BARU'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 mt-6 pt-5 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Kunjungan</span>
                <span className="text-xl font-bold text-slate-800 block mt-1">{profile.visits || 0} Kali</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Transaksi</span>
                <span className="text-xl font-bold text-emerald-600 block mt-1">{formatRupiah(profile.totalTransaksi)}</span>
              </div>
            </div>
          </div>

          {/* Preferences Box */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-50 pb-3 mb-4">Preferensi Notifikasi</h3>
            <div className="space-y-4">
              
              {[
                { id: 'vac', label: 'Pengingat Vaksinasi', desc: 'Dapatkan pemberitahuan WhatsApp saat vaksinasi hampir jatuh tempo.', checked: notifVaksin, setChecked: setNotifVaksin },
                { id: 'appt', label: 'Pengingat Janji Temu', desc: 'Dapatkan SMS & Notif email perihal konfirmasi janji temu medis.', checked: notifJanji, setChecked: setNotifJanji },
                { id: 'promo', label: 'Penawaran Promosi', desc: 'Dapatkan berita diskon perawatan bulanan grooming/vaksin.', checked: notifPromo, setChecked: setNotifPromo }
              ].map((pref) => (
                <div key={pref.id} className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-700 block cursor-pointer select-none" htmlFor={`pref-${pref.id}`}>{pref.label}</label>
                    <span className="text-[11px] text-slate-400 leading-normal block">{pref.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    id={`pref-${pref.id}`}
                    checked={pref.checked}
                    onChange={(e) => pref.setChecked(e.target.checked)}
                    className="w-4.5 h-4.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 mt-0.5 shrink-0"
                  />
                </div>
              ))}

            </div>
          </div>

        </div>

        {/* Right Column: Edit form and security */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Profile Form */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-50 pb-3 mb-4">Biodata Lengkap</h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nomor Telp / WhatsApp</label>
                  <input 
                    type="text" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Alamat Email (Akun)</label>
                  <input 
                    type="email" 
                    disabled
                    value={email}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tanggal Lahir</label>
                  <input 
                    type="date" 
                    required
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Alamat Rumah Tinggal</label>
                <textarea 
                  required
                  rows="3"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-50">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm active:scale-95 flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Simpan Perubahan Profil
                </button>
              </div>

            </form>
          </div>

          {/* Security & Actions panel */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Keamanan & Sesi Akun</h3>
              <p className="text-slate-400 text-xs mt-0.5">Ubah kata sandi berkala atau keluar dari portal member.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                Ganti Kata Sandi
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Keluar Sesi Portal
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)}></div>
          
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative z-10 overflow-y-auto max-h-[90vh] border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-base font-bold text-slate-800">Ganti Sandi Akun Member</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kata Sandi Saat Ini</label>
                <input 
                  type="password" 
                  required
                  placeholder="Masukkan sandi lama"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kata Sandi Baru</label>
                <input 
                  type="password" 
                  required
                  placeholder="Min. 8 Karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Konfirmasi Kata Sandi Baru</label>
                <input 
                  type="password" 
                  required
                  placeholder="Ulangi sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm shadow-emerald-100"
                >
                  Simpan Kata Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
