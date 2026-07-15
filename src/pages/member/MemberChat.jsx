import React, { useState, useEffect, useRef } from 'react';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { chatService } from '../../lib/supabaseService';
import { supabase } from '../../lib/supabase';
import GuestNavbar from '../guest/components/GuestNavbar';
import GuestFooter from '../guest/components/GuestFooter';
import '../guest/guest.css';

export default function MemberChat() {
  const { member } = useMemberAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const loadChats = async (selectFirst = false) => {
    if (!member?.id) return;
    setLoading(true);
    try {
      const list = await chatService.getByMemberId(member.id);
      setChats(list);
      if (list.length > 0) {
        if (selectFirst && !activeChat) setActiveChat(list[0]);
        else if (activeChat) {
          const updated = list.find(c => c.id === activeChat.id);
          if (updated) setActiveChat(updated);
        }
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadChats(true); }, []);

  useEffect(() => {
    if (!activeChat?.id) return;
    const sub = chatService.subscribeToMessages(activeChat.id, () => loadChats(false));
    return () => { if (sub) supabase.removeChannel(sub); };
  }, [activeChat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isTyping]);

  useEffect(() => () => { if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;
    const userMsg = inputText.trim();
    setInputText('');
    await chatService.sendMessage(activeChat.id, userMsg, 'member');
    await loadChats(false);
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);
      typingTimeoutRef.current = null;
      const replies = [
        'Terima kasih atas informasinya. Saya sarankan memantau makannya selama 24 jam ke depan.',
        'Kondisi tersebut wajar pasca tindakan medis. Pastikan dia tidak menggaruk area jahitan.',
        'Apabila kondisinya memburuk atau timbul demam, mohon segera bawa ke klinik.',
        'Sudah dicatat. Obat sirup multivitaminnya dilanjutkan setelah makan 2x sehari ya.',
        'Pakaikan kerah pelindung (Elizabeth collar) agar luka tidak dijilati.',
      ];
      await chatService.sendMessage(activeChat.id, replies[Math.floor(Math.random() * replies.length)], 'doctor');
      await loadChats(false);
    }, 2000);
  };

  return (
    <div className="guest-page">
      <GuestNavbar />
      <style>{`@keyframes bounce-dot { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>

      <main style={{ paddingTop: 96, paddingBottom: 80, background: '#f4f7fc', minHeight: '60vh' }}>
        <div className="guest-container">
          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#16a34a', marginBottom: 6 }}>Layanan Konsultasi</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Chat Dokter</h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>Tanya jawab medis real-time dengan dokter hewan kami.</p>
          </div>

          {/* Chat Panel */}
          <div style={{
            background: 'white', borderRadius: 18, border: '1px solid #edf2f7',
            boxShadow: '0 2px 12px rgba(15,23,42,0.07)',
            display: 'flex', overflow: 'hidden',
            height: 'calc(100vh - 320px)', minHeight: 480,
          }}>
            {/* Left: Chat List */}
            <div style={{
              width: 280, flexShrink: 0, borderRight: '1px solid #f1f5f9',
              display: 'flex', flexDirection: 'column', background: '#fafcff',
            }}>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b' }}>Percakapan</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>Pilih dokter untuk mulai konsultasi</div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {loading && !chats.length ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>Memuat…</div>
                ) : chats.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>Belum ada percakapan.</div>
                ) : chats.map(chat => {
                  const lastMsg = chat.messages?.[chat.messages.length - 1];
                  const isSelected = activeChat?.id === chat.id;
                  return (
                    <div key={chat.id} onClick={() => setActiveChat(chat)} style={{
                      padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center',
                      background: isSelected ? '#f0fdf4' : 'white',
                      borderLeft: `3px solid ${isSelected ? '#16a34a' : 'transparent'}`,
                      borderBottom: '1px solid #f8fafc', transition: 'all 0.15s',
                    }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>
                        </div>
                        {chat.doctorOnline && <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, background: '#22c55e', borderRadius: '50%', border: '2px solid white' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.doctorName}</span>
                          {lastMsg && <span style={{ fontSize: '0.63rem', color: '#94a3b8', flexShrink: 0, marginLeft: 4 }}>{lastMsg.time?.split(', ')[1] || lastMsg.time}</span>}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 1 }}>{chat.doctorTitle}</div>
                        {lastMsg && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lastMsg.sender === 'member' ? 'Anda: ' : ''}{lastMsg.text}
                        </div>}
                      </div>
                      {chat.unreadCount > 0 && !isSelected && (
                        <span style={{ flexShrink: 0, width: 20, height: 20, background: '#16a34a', color: 'white', borderRadius: '50%', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{chat.unreadCount}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Chat Room */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
              {activeChat ? (
                <>
                  {/* Room Header */}
                  <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', background: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>
                      </div>
                      {activeChat.doctorOnline && <span style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, background: '#22c55e', borderRadius: '50%', border: '2px solid white' }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b' }}>{activeChat.doctorName}</div>
                      <div style={{ fontSize: '0.7rem', color: activeChat.doctorOnline ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>{activeChat.doctorOnline ? '● Online' : '○ Offline'}</div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {activeChat.messages?.map((msg, idx) => {
                      const isMember = msg.sender === 'member';
                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: isMember ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            maxWidth: '70%', padding: '10px 14px', borderRadius: isMember ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: isMember ? '#16a34a' : 'white',
                            color: isMember ? 'white' : '#1e293b',
                            fontSize: '0.83rem', lineHeight: 1.5,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            border: isMember ? 'none' : '1px solid #edf2f7',
                          }}>
                            <p style={{ margin: 0 }}>{msg.text}</p>
                            <span style={{ display: 'block', fontSize: '0.62rem', marginTop: 4, textAlign: 'right', opacity: 0.7 }}>{msg.time}</span>
                          </div>
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ padding: '10px 14px', background: 'white', borderRadius: '18px 18px 18px 4px', border: '1px solid #edf2f7', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748b' }}>
                          {[0, 150, 300].map(d => <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: `bounce-dot 1.2s ${d}ms infinite` }} />)}
                          <span style={{ marginLeft: 4 }}>{activeChat.doctorName} mengetik…</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSend} style={{ padding: '12px 16px', background: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                      type="text" required value={inputText} onChange={e => setInputText(e.target.value)}
                      placeholder="Tulis pesan konsultasi…"
                      style={{ flex: 1, padding: '10px 16px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: '0.83rem', outline: 'none', background: '#f8fafc' }}
                      onFocus={e => e.target.style.borderColor = '#16a34a'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                    <button type="submit" style={{ width: 42, height: 42, borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#94a3b8' }}>
                  <div style={{ width: 60, height: 60, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>Pilih Percakapan</div>
                  <div style={{ fontSize: '0.78rem', maxWidth: 260, textAlign: 'center' }}>Pilih salah satu dokter di panel kiri untuk memulai konsultasi.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <GuestFooter />
    </div>
  );
}
