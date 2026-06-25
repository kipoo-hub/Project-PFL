import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { blastService, pipelineService } from '../lib/supabaseService';
import { 
  Send, History, MessageSquare, Mail, 
  Users, Layers, Check, ChevronRight, CheckCircle2,
  AlertCircle, Smartphone, Globe
} from 'lucide-react';

const cardStyle = {
  background: 'white',
  borderRadius: 12,
  border: '1px solid var(--border-color)',
  boxShadow: 'var(--shadow-sm)',
  padding: '20px 22px',
};

const templates = {
  'Reminder Vaksin': {
    subject: 'Pengingat Vaksinasi Rutin Hewan Kesayangan Anda',
    body: 'Halo! Jangan lupa untuk melakukan vaksinasi rutin hewan kesayangan Anda di Veterinario. Menjaga jadwal vaksinasi adalah langkah terbaik melindunginya dari virus berbahaya. Yuk booking janji temu sekarang!'
  },
  'Promo Grooming': {
    subject: 'Promo Spesial Grooming: Diskon 20% Minggu Ini!',
    body: 'Kabar gembira! Dapatkan diskon 20% untuk semua layanan Grooming Full di Veterinario selama minggu ini. Biarkan hewan peliharaan Anda tampil bersih, harum, dan segar. Hubungi kami untuk reservasi!'
  },
  'Ucapan Selamat Ulang Tahun Hewan': {
    subject: 'Selamat Ulang Tahun untuk Peliharaan Kesayangan Anda! 🎂',
    body: 'Selamat ulang tahun untuk si kecil yang menggemaskan! Kami dari Veterinario ikut merayakan hari bahagianya dengan memberikan voucher potongan Rp 50.000 untuk kunjungan berikutnya. Selamat merayakan!'
  },
  'Ajakan Kunjungan Rutin': {
    subject: 'Waktunya Check-Up Kesehatan Rutin Sahabat Anda',
    body: 'Halo! Sudahkah hewan kesayangan Anda melakukan check-up rutin? Deteksi dini adalah kunci pencegahan penyakit. Jadwalkan konsultasi dengan tim dokter profesional kami di Veterinario hari ini.'
  }
};

export default function Blast() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' or 'history'
  const [step, setStep] = useState(1);
  
  // Data State
  const [members, setMembers] = useState([]);
  const [blastHistory, setBlastHistory] = useState([]);
  const [segments, setSegments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [segmentMembers, setSegmentMembers] = useState([]);

  // Step 1: Recipients State
  const [recipientType, setRecipientType] = useState('All'); // 'All', 'Segment', 'Manual'
  const [selectedSegmentKey, setSelectedSegmentKey] = useState('jenisHewan:anjing');
  const [manualSelectedIds, setManualSelectedIds] = useState([]);

  // Step 2: Message Composition State
  const [channelType, setChannelType] = useState('WhatsApp'); // 'WhatsApp', 'Email'
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subjectText, setSubjectText] = useState('');
  const [messageText, setMessageText] = useState('');

  // Step 3: Sending Simulation State
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [finalRecipientCount, setFinalRecipientCount] = useState(0);

  // Initialize
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [allMembers, history, segs] = await Promise.all([
          pipelineService.getAll(),
          blastService.getHistory(),
          pipelineService.getSegments(),
        ]);
        setMembers(allMembers || []);
        setBlastHistory(history || []);
        setSegments(segs || {});
      } catch (err) {
        setError('Gagal memuat data blast.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Parse URL query parameters if redirected from segmentasi
    const query = new URLSearchParams(location.search);
    const category = query.get('category');
    const val = query.get('value');
    if (category && val) {
      setRecipientType('Segment');
      setSelectedSegmentKey(`${category}:${val}`);
    }
  }, [location]);

  // Fetch segment members whenever the selected segment key changes
  useEffect(() => {
    if (recipientType !== 'Segment') return;
    const fetchSegmentMembers = async () => {
      try {
        const [category, val] = selectedSegmentKey.split(':');
        if (!category || !val) { setSegmentMembers([]); return; }
        const data = await pipelineService.getMembersBySegment(category, val);
        setSegmentMembers(data || []);
      } catch (err) {
        setSegmentMembers([]);
      }
    };
    fetchSegmentMembers();
  }, [recipientType, selectedSegmentKey]);

  const handleSelectAllManual = (e) => {
    if (e.target.checked) {
      setManualSelectedIds(members.map(m => m.id));
    } else {
      setManualSelectedIds([]);
    }
  };

  const handleSelectManual = (id) => {
    setManualSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getTargetRecipients = () => {
    if (recipientType === 'All') {
      return members;
    }
    if (recipientType === 'Segment') {
      return segmentMembers;
    }
    if (recipientType === 'Manual') {
      return members.filter(m => manualSelectedIds.includes(m.id));
    }
    return [];
  };

  const handleTemplateChange = (e) => {
    const key = e.target.value;
    setSelectedTemplate(key);
    if (key && templates[key]) {
      setSubjectText(templates[key].subject);
      setMessageText(templates[key].body);
    } else {
      setSubjectText('');
      setMessageText('');
    }
  };

  const handleSendBlast = async () => {
    const list = getTargetRecipients();
    if (list.length === 0) return;

    setIsSending(true);
    setSendProgress(0);
    setFinalRecipientCount(list.length);

    // Simulate progress bar over 2.5 seconds
    const interval = setInterval(() => {
      setSendProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Save to history via blastService
          blastService.save({
            type: channelType,
            recipientCount: list.length,
            message: channelType === 'Email' ? `Subject: ${subjectText}\n\n${messageText}` : messageText
          }).then(async () => {
            const history = await blastService.getHistory();
            setBlastHistory(history || []);
          }).catch(err => console.error('Gagal menyimpan riwayat blast:', err));

          setIsSending(false);
          setSendSuccess(true);

          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleReset = () => {
    setStep(1);
    setRecipientType('All');
    setManualSelectedIds([]);
    setSelectedTemplate('');
    setSubjectText('');
    setMessageText('');
    setSendSuccess(false);
    setSendProgress(0);
  };

  const targetList = getTargetRecipients();

  return (
    <div style={{ flex: 1, padding: 24, background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
      <PageHeader 
        title="Pesan Massal (Blast)" 
        subtitle="Kirim pesan promosi, reminder vaksin, atau ulasan ke banyak member sekaligus." 
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '2px solid var(--border-color)', paddingBottom: 0 }}>
        <button
          onClick={() => setActiveTab('compose')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'compose' ? '2px solid var(--accent-blue)' : '2px solid transparent',
            color: activeTab === 'compose' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'compose' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
            marginBottom: -2,
            transition: 'all 0.15s'
          }}
        >
          Buat Pesan Massal
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'history' ? '2px solid var(--accent-blue)' : '2px solid transparent',
            color: activeTab === 'history' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'history' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
            marginBottom: -2,
            transition: 'all 0.15s'
          }}
        >
          Riwayat Pengiriman
        </button>
      </div>

      {activeTab === 'compose' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          {/* Left Panel: Steps Wizard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Step Wizard Header */}
            <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', padding: '14px 20px' }}>
              {[
                { number: 1, label: 'Penerima' },
                { number: 2, label: 'Pesan' },
                { number: 3, label: 'Kirim' }
              ].map(s => (
                <div key={s.number} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: step === s.number ? 'var(--accent-blue)' : step > s.number ? 'var(--accent-teal)' : '#e2e8f0',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700
                  }}>
                    {step > s.number ? <Check size={14} /> : s.number}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: step === s.number ? 700 : 500, color: step === s.number ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {s.label}
                  </span>
                  {s.number < 3 && <ChevronRight size={16} color="#cbd5e1" />}
                </div>
              ))}
            </div>

            {/* STEP 1: SELECT RECIPIENTS */}
            {step === 1 && (
              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Pilih Kelompok Penerima</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Tentukan member mana saja yang akan menerima broadcast pesan massal ini.</p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { key: 'All', label: 'Semua Member', icon: Users },
                    { key: 'Segment', label: 'Pilih Segmen', icon: Layers },
                    { key: 'Manual', label: 'Pilih Manual', icon: Check }
                  ].map(type => (
                    <button
                      key={type.key}
                      onClick={() => setRecipientType(type.key)}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: 8,
                        border: recipientType === type.key ? '1.5px solid var(--accent-blue)' : '1px solid var(--border-color)',
                        background: recipientType === type.key ? 'var(--accent-blue-light)' : 'white',
                        color: recipientType === type.key ? 'var(--accent-blue)' : 'var(--text-secondary)',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <type.icon size={14} /> {type.label}
                    </button>
                  ))}
                </div>

                {recipientType === 'Segment' && (
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>PILIH SEGMENTASI</label>
                    <select
                      value={selectedSegmentKey}
                      onChange={e => setSelectedSegmentKey(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        fontSize: 13,
                        outline: 'none',
                        background: 'white'
                      }}
                    >
                      <optgroup label="Jenis Hewan">
                        <option value="jenisHewan:anjing">Pemilik Anjing</option>
                        <option value="jenisHewan:kucing">Pemilik Kucing</option>
                        <option value="jenisHewan:kelinci">Pemilik Kelinci</option>
                      </optgroup>
                      <optgroup label="Kunjungan">
                        <option value="frekuensiKunjungan:sangat_aktif">Sangat Aktif (5+ Kunjungan)</option>
                        <option value="frekuensiKunjungan:aktif">Aktif (3-4 Kunjungan)</option>
                        <option value="frekuensiKunjungan:jarang">Jarang (1-2 Kunjungan)</option>
                        <option value="frekuensiKunjungan:belum_pernah">Belum Pernah (0 Kunjungan)</option>
                      </optgroup>
                      <optgroup label="Vaksinasi">
                        <option value="statusVaksin:lengkap">Vaksin Lengkap</option>
                        <option value="statusVaksin:hampir_tempo">Vaksin Hampir Jatuh Tempo</option>
                        <option value="statusVaksin:terlambat">Vaksin Terlambat</option>
                      </optgroup>
                      <optgroup label="Transaksi">
                        <option value="nilaiTransaksi:high">High Value (Rp 1jt+)</option>
                        <option value="nilaiTransaksi:medium">Medium Value (Rp 500rb - 1jt)</option>
                        <option value="nilaiTransaksi:low">Low Value (&lt; Rp 500rb)</option>
                      </optgroup>
                    </select>
                  </div>
                )}

                {recipientType === 'Manual' && (
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>CENTANG MEMBER SECARA MANUAL</label>
                    <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 8, overflowX: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', fontSize: 11.5, borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left', width: 40 }}>
                              <input type="checkbox" onChange={handleSelectAllManual} checked={manualSelectedIds.length === members.length} />
                            </th>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Nama Member</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Hewan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map(m => (
                            <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                              <td style={{ padding: '8px 12px' }}>
                                <input type="checkbox" checked={manualSelectedIds.includes(m.id)} onChange={() => handleSelectManual(m.id)} />
                              </td>
                              <td style={{ padding: '8px 12px', fontWeight: 600 }}>{m.name}</td>
                              <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{m.pets.join(', ') || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    Penerima terpilih: <strong style={{ color: 'var(--accent-blue)' }}>{targetList.length} member</strong>
                  </div>
                  <button
                    disabled={targetList.length === 0}
                    onClick={() => setStep(2)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 8,
                      border: 'none',
                      background: targetList.length === 0 ? '#cbd5e1' : 'linear-gradient(135deg, var(--accent-blue), #4c6ef5)',
                      color: 'white',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: targetList.length === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    Lanjut ke Pesan <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: COMPOSE MESSAGE */}
            {step === 2 && (
              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Buat Pesan Massal</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pilih metode dan tulis pesan broadcast yang ingin dikirimkan.</p>
                </div>

                {/* Channel Toggle */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>SALURAN BROADCAST</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => { setChannelType('WhatsApp'); setSelectedTemplate(''); }}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: 8,
                        border: channelType === 'WhatsApp' ? '1.5px solid #25D366' : '1px solid var(--border-color)',
                        background: channelType === 'WhatsApp' ? '#25D36615' : 'white',
                        color: channelType === 'WhatsApp' ? '#25D366' : 'var(--text-secondary)',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <MessageSquare size={14} /> WhatsApp
                    </button>
                    <button
                      onClick={() => { setChannelType('Email'); setSelectedTemplate(''); }}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: 8,
                        border: channelType === 'Email' ? '1.5px solid #3b5bdb' : '1px solid var(--border-color)',
                        background: channelType === 'Email' ? '#3b5bdb15' : 'white',
                        color: channelType === 'Email' ? '#3b5bdb' : 'var(--text-secondary)',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <Mail size={14} /> Email
                    </button>
                  </div>
                </div>

                {/* Quick Templates */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>TEMPLATE CEPAT</label>
                  <select
                    value={selectedTemplate}
                    onChange={handleTemplateChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      fontSize: 13,
                      outline: 'none',
                      background: 'white'
                    }}
                  >
                    <option value="">-- Tulis Pesan Kustom --</option>
                    {Object.keys(templates).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {channelType === 'Email' && (
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>SUBJEK EMAIL</label>
                    <input
                      value={subjectText}
                      onChange={e => setSubjectText(e.target.value)}
                      placeholder="Masukkan subjek email..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        fontSize: 13,
                        outline: 'none',
                        background: 'white'
                      }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>ISI PESAN</label>
                  <textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    maxLength={1000}
                    placeholder="Tulis pesan promosi atau reminder Anda di sini (Maksimal 1000 karakter)..."
                    style={{
                      width: '100%',
                      height: 120,
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'block', marginTop: 4, textAlign: 'right' }}>
                    {messageText.length} / 1000 Karakter
                  </span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'white', fontSize: 12.5, cursor: 'pointer' }}
                  >
                    Kembali
                  </button>
                  <button
                    disabled={!messageText || (channelType === 'Email' && !subjectText)}
                    onClick={() => setStep(3)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 8,
                      border: 'none',
                      background: !messageText || (channelType === 'Email' && !subjectText) ? '#cbd5e1' : 'linear-gradient(135deg, var(--accent-blue), #4c6ef5)',
                      color: 'white',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: !messageText ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    Lanjut ke Pengiriman <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SEND & SIMULATE */}
            {step === 3 && (
              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Konfirmasi & Kirim Blast</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Tinjau pengaturan sebelum menyebarkan pesan massal ke seluruh penerima.</p>
                </div>

                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>SALURAN MEDIA</div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: channelType === 'WhatsApp' ? '#25D366' : 'var(--accent-blue)', marginTop: 2 }}>{channelType}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>TOTAL PENERIMA</div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)', marginTop: 2 }}>{targetList.length} Member</div>
                  </div>
                </div>

                {isSending ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Mengirim broadcast pesan...</div>
                    <div style={{ height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden', width: '100%', border: '1px solid #cbd5e1' }}>
                      <div style={{ height: '100%', width: `${sendProgress}%`, background: 'var(--accent-blue)', transition: 'width 0.15s ease' }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 6 }}>{sendProgress}% Terkirim</span>
                  </div>
                ) : sendSuccess ? (
                  <div style={{ textAlign: 'center', background: 'var(--accent-teal-light)', padding: 20, borderRadius: 10, border: '1px solid var(--accent-teal)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={36} color="var(--accent-teal)" />
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0ca678' }}>Pesan Berhasil Dikirim!</h4>
                    <p style={{ fontSize: 12.5, color: '#0ca678', lineHeight: 1.4 }}>
                      Broadcast berhasil dikirim ke <strong>{finalRecipientCount} member</strong> menggunakan media <strong>{channelType}</strong>.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                    <button
                      onClick={() => setStep(2)}
                      style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'white', fontSize: 12.5, cursor: 'pointer' }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSendBlast}
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
                      <Send size={13} /> Kirim Sekarang
                    </button>
                  </div>
                )}

                {sendSuccess && (
                  <button
                    onClick={handleReset}
                    style={{
                      padding: '8px 0',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'white',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Buat Pesan Massal Baru
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Message Live Preview Mockup */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Live Preview
            </div>

            {channelType === 'WhatsApp' ? (
              // WhatsApp style Mockup
              <div style={{ background: '#e5ddd5', borderRadius: 16, border: '1px solid #cbd5e1', boxShadow: 'var(--shadow-md)', overflow: 'hidden', height: 400, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ background: '#075e54', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, color: 'white' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>VT</div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>Veterinario Blast</div>
                    <div style={{ fontSize: 9, color: '#86efac' }}>Online</div>
                  </div>
                </div>
                {/* Chats Area */}
                <div style={{ flex: 1, padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  {messageText ? (
                    <div style={{
                      alignSelf: 'flex-start',
                      background: '#fff',
                      borderRadius: '0px 10px 10px 10px',
                      padding: '8px 12px',
                      maxWidth: '85%',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                      fontSize: 12,
                      lineHeight: 1.4,
                      position: 'relative'
                    }}>
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{messageText}</div>
                      <span style={{ fontSize: 8.5, color: '#9ca3af', display: 'block', textAlign: 'right', marginTop: 4 }}>15:44</span>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', margin: 'auto', color: '#64748b', fontSize: 11.5, fontStyle: 'italic' }}>
                      Tulis pesan untuk melihat preview chat WhatsApp...
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Email style Mockup
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', height: 400, display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderBottom: '1px solid var(--border-color)', fontSize: 11, color: 'var(--text-secondary)' }}>
                  <div><strong>From:</strong> info@veterinario.id</div>
                  <div style={{ marginTop: 2 }}><strong>To:</strong> [Nama Member] &lt;member@email.com&gt;</div>
                  <div style={{ marginTop: 2 }}><strong>Subject:</strong> {subjectText || '(Tanpa Subjek)'}</div>
                </div>
                <div style={{ flex: 1, padding: 16, overflowY: 'auto', fontSize: 12.5, lineHeight: 1.5, color: '#334155' }}>
                  {messageText ? (
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {messageText}
                      <br /><br />
                      ---<br />
                      <strong>Veterinario PetCare Clinic</strong><br />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Surabaya, Indonesia</span>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', margin: '80px auto 0', color: '#64748b', fontSize: 11.5, fontStyle: 'italic' }}>
                      Tulis subjek dan isi email untuk melihat preview...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB 2: HISTORY LIST */
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  {['Tanggal', 'Metode', 'Jml Penerima', 'Isi Pesan', 'Status'].map(col => (
                    <th key={col} style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blastHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                      <History size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                      <p style={{ fontSize: 13 }}>Belum ada riwayat blast pesan massal.</p>
                    </td>
                  </tr>
                ) : (
                  blastHistory.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: idx < blastHistory.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <td style={{ padding: '16px 18px', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {item.date}
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          color: item.type === 'WhatsApp' ? '#0ca678' : 'var(--accent-blue)',
                          background: item.type === 'WhatsApp' ? '#e6fcf5' : 'var(--accent-blue-light)',
                          padding: '3px 8px',
                          borderRadius: 20
                        }}>
                          {item.type === 'WhatsApp' ? <MessageSquare size={11} /> : <Mail size={11} />}
                          {item.type}
                        </span>
                      </td>
                      <td style={{ padding: '16px 18px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.recipientCount} Member
                      </td>
                      <td style={{ padding: '16px 18px', fontSize: 12.5, color: 'var(--text-secondary)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.message}
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#0ca678',
                          background: '#e6fcf5',
                          padding: '3px 10px',
                          borderRadius: 20
                        }}>
                          <CheckCircle2 size={11} /> Terkirim
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
