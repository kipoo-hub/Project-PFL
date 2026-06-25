import React, { useState, useEffect, useRef } from 'react';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { chatService } from '../../lib/supabaseService';
import { supabase } from '../../lib/supabase';

export default function MemberChat() {
  const { member } = useMemberAuth();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadChats = async (selectFirst = false) => {
    const memberUser = JSON.parse(localStorage.getItem('memberUser'));
    if (!memberUser?.id) return;
    setLoading(true);
    setError(null);
    try {
      const list = await chatService.getByMemberId(memberUser.id);
      setChats(list);

      if (list.length > 0) {
        if (selectFirst && !activeChat) {
          setActiveChat(list[0]);
        } else if (activeChat) {
          // Refresh active chat data
          const updatedActive = list.find(c => c.id === activeChat.id);
          if (updatedActive) {
            setActiveChat(updatedActive);
          }
        }
      }
    } catch (err) {
      setError('Gagal memuat percakapan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats(true);
  }, []);

  // Real-time subscription for active chat
  useEffect(() => {
    if (!activeChat?.id) return;

    const subscription = chatService.subscribeToMessages(activeChat.id, () => {
      loadChats(false);
    });

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [activeChat?.id]);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
  };

  // Scroll to bottom whenever messages list changes or active chat changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const userMsg = inputText.trim();
    setInputText('');

    // Save member message
    await chatService.sendMessage(activeChat.id, userMsg, 'member');
    await loadChats(false);

    // Trigger Doctor Auto-reply Simulation
    setIsTyping(true);

    setTimeout(async () => {
      setIsTyping(false);
      
      const doctorReplies = [
        "Terima kasih atas informasinya. Saya sarankan untuk memantau makannya selama 24 jam ke depan.",
        "Kondisi tersebut wajar terjadi pasca tindakan medis. Harap pastikan dia tidak menggaruk area jahitan.",
        "Apabila kondisinya memburuk atau timbul demam tinggi, mohon segera bawa ke klinik sore ini ya.",
        "Sudah dicatat. Obat sirup multivitaminnya dilanjutkan setelah makan sehari 2 kali 1.5ml ya pak.",
        "Baik, saya sarankan pakaikan kerah pelindung (Elizabeth collar) agar lukanya tidak dijilati.",
        "Pastikan area kandang/alas tidurnya tetap bersih dan kering agar terhindar dari infeksi bakteri."
      ];
      
      const randomReply = doctorReplies[Math.floor(Math.random() * doctorReplies.length)];
      
      // Save doctor message
      await chatService.sendMessage(activeChat.id, randomReply, 'doctor');
      await loadChats(false);
    }, 2000);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-210px)] min-h-[500px]">
      
      {/* Panel Kiri: Chat List */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-100 flex-col bg-slate-50/50 h-full`}>
        <div className="p-4 border-b border-slate-100 bg-white">
          <h2 className="text-base font-bold text-slate-800">Konsultasi Dokter</h2>
          <p className="text-slate-400 text-xs mt-0.5">Tanya jawab medis real-time dengan dokter hewan.</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Belum ada percakapan dokter.
            </div>
          ) : (
            chats.map((chat) => {
              const lastMsg = chat.messages?.[chat.messages.length - 1];
              const isSelected = activeChat?.id === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`p-4 cursor-pointer flex gap-3 items-center transition ${
                    isSelected ? 'bg-emerald-50/30 border-l-4 border-emerald-600' : 'bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-sm relative shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>
                    {chat.doctorOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" title="Online" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-slate-800 text-xs truncate">{chat.doctorName}</h4>
                      {lastMsg && <span className="text-[10px] text-slate-400 font-medium">{lastMsg.time.split(', ')[1] || lastMsg.time}</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{chat.doctorTitle}</p>
                    {lastMsg && (
                      <p className="text-xs text-slate-500 mt-1 truncate font-medium">
                        {lastMsg.sender === 'member' ? 'Anda: ' : ''}{lastMsg.text}
                      </p>
                    )}
                  </div>
                  {chat.unreadCount > 0 && !isSelected && (
                    <span className="w-5 h-5 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Panel Kanan: Chat Room */}
      <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-slate-50/30 h-full`}>
        {activeChat ? (
          <>
            {/* Room Header */}
            <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-3">
              <button 
                className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition"
                onClick={() => setActiveChat(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-sm relative shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>
                {activeChat.doctorOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-none">{activeChat.doctorName}</h3>
                <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">
                  {activeChat.doctorOnline ? 'Aktif Sekarang (Online)' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChat.messages?.map((msg, idx) => {
                const isMember = msg.sender === 'member';
                return (
                  <div key={idx} className={`flex ${isMember ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm text-sm ${
                      isMember 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                    }`}>
                      <p className="leading-relaxed">{msg.text}</p>
                      <span className={`block text-[9px] mt-1.5 text-right font-medium ${isMember ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-500 border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm text-xs font-semibold flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    <span>{activeChat.doctorName} sedang mengetik...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
              <input
                type="text"
                required
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tulis pesan konsultasi Anda..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
              />
              <button
                type="submit"
                className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center transition shadow-sm active:scale-95 shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3 className="text-slate-700 font-bold">Pilih Chat Dokter</h3>
            <p className="text-slate-400 text-xs max-w-xs mt-1">Silakan pilih salah satu dokter di panel kiri untuk memulai obrolan konsultasi medis.</p>
          </div>
        )}
      </div>

    </div>
  );
}
