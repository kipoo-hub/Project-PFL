import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { chatService } from '../../lib/supabaseService';
import PageHeader from '../../components/PageHeader';
import { Send, User, ChevronRight, MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';

export default function CaseManagement() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const loadAllChats = async (selectFirst = false) => {
    try {
      setLoading(true);
      
      // Query chats joined with profiles or manual profile mapping
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*, chat_messages(*)')
        .order('created_at', { ascending: false });

      if (chatError) throw chatError;

      // Get profile details for each member_id
      const memberIds = chatData.map(c => c.member_id).filter(Boolean);
      let profilesMap = {};
      
      if (memberIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .in('user_id', memberIds);
        
        if (profiles) {
          profiles.forEach(p => {
            profilesMap[p.user_id] = p;
          });
        }
      }

      const formattedChats = chatData.map(c => {
        const profile = profilesMap[c.member_id] || { name: 'Member Baru', email: 'guest@contoh.com' };
        return {
          id: c.id,
          memberId: c.member_id,
          memberName: profile.name,
          memberEmail: profile.email,
          doctorName: c.doctor_name,
          doctorTitle: c.doctor_title,
          doctorOnline: c.doctor_online,
          unreadCount: c.unread_count,
          messages: (c.chat_messages || [])
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .map(m => ({
              id: m.id,
              sender: m.sender,
              text: m.text,
              time: new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            })),
        };
      });

      setChats(formattedChats);

      if (formattedChats.length > 0) {
        if (selectFirst && !activeChat) {
          setActiveChat(formattedChats[0]);
        } else if (activeChat) {
          const updatedActive = formattedChats.find(c => c.id === activeChat.id);
          if (updatedActive) setActiveChat(updatedActive);
        }
      }
    } catch (err) {
      setError('Gagal memuat daftar obrolan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllChats(true);
  }, []);

  // Real-time listener for current active chat
  useEffect(() => {
    if (!activeChat?.id) return;

    const channel = supabase
      .channel(`admin_chat_${activeChat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${activeChat.id}` }, () => {
        // Re-load chats to get new message
        loadAllChats(false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const text = inputText.trim();
    setInputText('');

    try {
      const success = await chatService.sendMessage(activeChat.id, text, 'doctor');
      if (success) {
        // Reset unread_count to 0 on database as admin reads it
        await supabase.from('chats').update({ unread_count: 0 }).eq('id', activeChat.id);
        loadAllChats(false);
      } else {
        alert('Gagal mengirim pesan');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#F7F8FC', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Case Management (Live Chat)" subtitle="Konsultasi langsung dan obrolan bantuan dokter dengan member." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, flex: 1, minHeight: '65vh' }}>
        {/* Active Chats Sidebar */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Obrolan Aktif</h3>
            <button onClick={() => loadAllChats(false)} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading && chats.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 20, color: '#6B7280' }}>Memuat obrolan...</p>
            ) : chats.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 20, color: '#9CA3AF' }}>Tidak ada obrolan.</p>
            ) : (
              chats.map(c => {
                const isActive = activeChat && activeChat.id === c.id;
                const lastMsg = c.messages?.[c.messages.length - 1];

                return (
                  <div key={c.id} onClick={() => setActiveChat(c)} style={{ padding: 16, borderBottom: '1px solid #F3F4F6', cursor: 'pointer', background: isActive ? '#F3F4F6' : 'white', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                      <User size={16} color="#4F46E5" />
                      {c.unreadCount > 0 && <span style={{ position: 'absolute', top: -2, right: -2, background: '#EF4444', color: 'white', fontSize: 10, fontWeight: 700, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.unreadCount}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: 14, fontWeight: 700, color: '#111827', truncate: 'true', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.memberName}</h4>
                      <p style={{ margin: 0, fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lastMsg ? lastMsg.text : 'Belum ada pesan'}
                      </p>
                    </div>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Conversation Area */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeChat ? (
            <>
              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: 16, fontWeight: 700 }}>{activeChat.memberName}</h3>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Email: {activeChat.memberEmail} &bull; Dokter: <strong>{activeChat.doctorName}</strong></span>
                </div>
              </div>

              {/* Messages List */}
              <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {activeChat.messages?.map((msg) => {
                  const isDoctor = msg.sender === 'doctor';
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isDoctor ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%', display: 'flex', gap: 8, flexDirection: isDoctor ? 'row-reverse' : 'row' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: isDoctor ? '#EEF2FF' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={14} color={isDoctor ? '#4F46E5' : '#4B5563'} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', justifyContent: isDoctor ? 'flex-end' : 'flex-start', marginBottom: 2 }}>
                            <span style={{ fontSize: 11, fontWeight: 700 }}>{isDoctor ? 'Dokter Klinik' : activeChat.memberName}</span>
                            <span style={{ fontSize: 9, color: '#9CA3AF' }}>{msg.time}</span>
                          </div>
                          <div style={{ background: isDoctor ? '#4F46E5' : 'white', color: isDoctor ? 'white' : '#1F2937', padding: '10px 14px', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: 13, wordBreak: 'break-word' }}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Box */}
              <form onSubmit={handleSend} style={{ padding: 16, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 12, background: 'white' }}>
                <input required type="text" placeholder="Ketik balasan Anda..." value={inputText} onChange={e => setInputText(e.target.value)} style={{ flex: 1, padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none' }} />
                <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#4F46E5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
                  <Send size={14} /> Kirim
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#9CA3AF' }}>
              <MessageSquare size={40} style={{ marginBottom: 12 }} />
              <p>Pilih salah satu obrolan untuk mulai membalas konsultasi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
