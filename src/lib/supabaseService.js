// ─────────────────────────────────────────────────────────────────────────────
// supabaseService.js — Replaces crmState.js
// All CRM data operations through Supabase instead of localStorage
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabase';
import { logActivity } from './logActivity';

// ─── Helper ──────────────────────────────────────────────────────────────────
const handleError = (context, error) => {
  console.error(`[supabaseService:${context}]`, error?.message || error);
};

// ─────────────────────────────────────────────────────────────────────────────
// VACCINE SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const vaccineService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('vaksin')
      .select('*')
      .order('due_date', { ascending: true });
    if (error) { handleError('vaccineService.getAll', error); return []; }
    return data.map(v => ({
      id: v.id,
      petName: v.pet_name,
      species: v.species,
      ownerName: v.owner_name,
      email: v.email,
      phone: v.phone,
      vaccineType: v.vaccine_type,
      dueDate: v.due_date,
      daysRemaining: Math.ceil((new Date(v.due_date) - new Date()) / (1000 * 60 * 60 * 24)),
      status: v.status,
      created_at: v.created_at,
    }));
  },

  getByEmail: async (email) => {
    const { data, error } = await supabase
      .from('vaksin')
      .select('*')
      .eq('email', email)
      .order('due_date', { ascending: true });
    if (error) { handleError('vaccineService.getByEmail', error); return []; }
    return data.map(v => ({
      id: v.id,
      petName: v.pet_name,
      species: v.species,
      ownerName: v.owner_name,
      email: v.email,
      phone: v.phone,
      vaccineType: v.vaccine_type,
      dueDate: v.due_date,
      daysRemaining: Math.ceil((new Date(v.due_date) - new Date()) / (1000 * 60 * 60 * 24)),
      status: v.status,
    }));
  },

  sendReminder: async (id) => {
    const { error } = await supabase
      .from('vaksin')
      .update({ status: 'Sudah Diingatkan' })
      .eq('id', id);
    if (error) { handleError('vaccineService.sendReminder', error); return false; }
    return true;
  },

  add: async (data) => {
    const { data: result, error } = await supabase
      .from('vaksin')
      .insert([{
        pet_name: data.petName,
        species: data.species,
        owner_name: data.ownerName,
        email: data.email,
        phone: data.phone,
        vaccine_type: data.vaccineType,
        due_date: data.dueDate,
        status: 'Belum Diingatkan',
      }])
      .select()
      .single();
    if (error) { handleError('vaccineService.add', error); return null; }
    return result;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FOLLOWUP SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const followupService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('followups')
      .select('*')
      .order('visit_date', { ascending: false });
    if (error) { handleError('followupService.getAll', error); return []; }
    return data.map(f => ({
      id: f.id,
      petName: f.pet_name,
      ownerName: f.owner_name,
      phone: f.phone,
      visitDate: f.visit_date,
      doctor: f.doctor,
      service: f.service,
      status: f.status,
      notes: f.notes,
    }));
  },

  add: async (data) => {
    const { data: result, error } = await supabase
      .from('followups')
      .insert([{
        pet_name: data.petName || data.hewan,
        owner_name: data.ownerName || data.pemilik,
        phone: data.phone || '0812-0000-0000',
        visit_date: new Date().toISOString().split('T')[0],
        doctor: data.doctor || data.dokter,
        service: data.service || data.layanan,
        status: 'Belum',
        notes: '',
      }])
      .select()
      .single();
    if (error) { handleError('followupService.add', error); return null; }
    return result;
  },

  update: async (id, status, notes) => {
    const { error } = await supabase
      .from('followups')
      .update({ status, notes })
      .eq('id', id);
    if (error) { handleError('followupService.update', error); return false; }
    return true;
  },

  delete: async (id) => {
    const { error } = await supabase.from('followups').delete().eq('id', id);
    if (error) { handleError('followupService.delete', error); return false; }
    return true;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LEAD SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const leadService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { handleError('leadService.getAll', error); return []; }
    return data.map(l => ({
      id: l.id,
      visitorName: l.visitor_name,
      source: l.source,
      lastActive: l.last_active,
      visitCount: l.visit_count,
      status: l.status,
      phone: l.phone,
      email: l.email,
      isNewToday: l.is_new_today,
    }));
  },

  updateStatus: async (id, status) => {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id);
    if (error) { handleError('leadService.updateStatus', error); return false; }

    // If converted, auto-add to pipeline_members
    if (status === 'Konversi') {
      const { data: lead } = await supabase.from('leads').select('*').eq('id', id).single();
      if (lead) {
        const { data: existing } = await supabase
          .from('pipeline_members')
          .select('id')
          .eq('email', lead.email)
          .single();
        if (!existing) {
          await supabase.from('pipeline_members').insert([{
            name: lead.visitor_name,
            email: lead.email,
            phone: lead.phone,
            stage: 'BARU',
            visits: 0,
            total_transaksi: 0,
          }]);
        }
      }
    }
    return true;
  },

  add: async (data) => {
    const { data: result, error } = await supabase
      .from('leads')
      .insert([{
        visitor_name: data.visitorName,
        source: data.source || '/guest',
        last_active: 'Hari ini, Baru saja',
        visit_count: 1,
        status: 'Baru',
        phone: data.phone,
        email: data.email,
        is_new_today: true,
      }])
      .select()
      .single();
    if (error) { handleError('leadService.add', error); return null; }
    return result;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// BLAST SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const blastService = {
  getHistory: async () => {
    const { data, error } = await supabase
      .from('blasts')
      .select('*')
      .order('sent_at', { ascending: false });
    if (error) { handleError('blastService.getHistory', error); return []; }
    return data.map(b => ({
      id: b.id,
      date: b.sent_at?.split('T')[0],
      type: b.type,
      recipientCount: b.recipient_count,
      message: b.message,
      status: b.status,
    }));
  },

  save: async (data) => {
    const { data: result, error } = await supabase
      .from('blasts')
      .insert([{
        type: data.type,
        recipient_count: data.recipientCount,
        message: data.message,
        status: 'Selesai',
      }])
      .select()
      .single();
    if (error) { handleError('blastService.save', error); return null; }
    return result;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TICKET SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const ticketService = {
  getAll: async () => {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*, ticket_conversations(*)')
      .order('created_at', { ascending: false });
    if (error) { handleError('ticketService.getAll', error); return []; }
    return tickets.map(t => ({
      id: t.id,
      petName: t.pet_name,
      ownerName: t.owner_name,
      email: t.email,
      category: t.category,
      title: t.title,
      urgency: t.urgency,
      priority: t.priority,
      status: t.status,
      createdAt: t.created_at?.split('T')[0],
      conversations: (t.ticket_conversations || []).map(c => ({
        id: c.id,
        role: c.role,
        senderName: c.sender_name,
        message: c.message,
        time: new Date(c.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      })).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    }));
  },

  getByEmail: async (email) => {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*, ticket_conversations(*)')
      .eq('email', email)
      .order('created_at', { ascending: false });
    if (error) { handleError('ticketService.getByEmail', error); return []; }
    return tickets.map(t => ({
      id: t.id,
      petName: t.pet_name,
      ownerName: t.owner_name,
      email: t.email,
      category: t.category,
      title: t.title,
      urgency: t.urgency,
      priority: t.priority,
      status: t.status,
      createdAt: t.created_at?.split('T')[0],
      conversations: (t.ticket_conversations || []).map(c => ({
        id: c.id,
        role: c.role,
        senderName: c.sender_name,
        message: c.message,
        time: new Date(c.created_at).toLocaleString('id-ID'),
      })),
    }));
  },

  create: async (data) => {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert([{
        pet_name: data.petName,
        owner_name: data.ownerName,
        email: data.email,
        category: data.category,
        title: data.title,
        urgency: data.urgency,
        priority: data.urgency === 'Tinggi' ? 'Tinggi' : data.urgency === 'Sedang' ? 'Sedang' : 'Rendah',
        status: 'Baru',
      }])
      .select()
      .single();
    if (error) { handleError('ticketService.create', error); return null; }

    // Add initial conversation
    await supabase.from('ticket_conversations').insert([{
      ticket_id: ticket.id,
      role: 'member',
      sender_name: data.ownerName,
      message: data.description,
    }]);
    await logActivity('Membuat tiket bantuan', { title: data.title, category: data.category });
    return ticket;
  },

  reply: async (ticketId, message, role, senderName) => {
    const { error: convError } = await supabase
      .from('ticket_conversations')
      .insert([{ ticket_id: ticketId, role, sender_name: senderName, message }]);
    if (convError) { handleError('ticketService.reply.conv', convError); return false; }

    // Update ticket status if admin replies on new ticket
    if (role === 'admin') {
      const { data: ticket } = await supabase.from('tickets').select('status').eq('id', ticketId).single();
      if (ticket?.status === 'Baru') {
        await supabase.from('tickets').update({ status: 'Dalam Proses' }).eq('id', ticketId);
      }
    }
    return true;
  },

  updateStatus: async (id, status) => {
    const { error } = await supabase.from('tickets').update({ status }).eq('id', id);
    if (error) { handleError('ticketService.updateStatus', error); return false; }
    return true;
  },

  updatePriority: async (id, priority) => {
    const { error } = await supabase.from('tickets').update({ priority }).eq('id', id);
    if (error) { handleError('ticketService.updatePriority', error); return false; }
    return true;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// QUEUE SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const queueService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('queues')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) { handleError('queueService.getAll', error); return []; }
    return data.map(q => ({
      id: q.id,
      queueNumber: q.queue_number,
      ownerName: q.owner_name,
      email: q.email,
      petName: q.pet_name,
      service: q.service,
      registeredTime: q.registered_time,
      status: q.status,
      type: q.type,
      appointmentTime: q.appointment_time,
    }));
  },

  getByEmail: async (email) => {
    const { data, error } = await supabase
      .from('queues')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });
    if (error) { handleError('queueService.getByEmail', error); return []; }
    return data.map(q => ({
      id: q.id,
      queueNumber: q.queue_number,
      ownerName: q.owner_name,
      petName: q.pet_name,
      service: q.service,
      registeredTime: q.registered_time,
      status: q.status,
      type: q.type,
    }));
  },

  add: async (data) => {
    // Get next queue number
    const { data: existing } = await supabase
      .from('queues')
      .select('queue_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let nextNum = 1;
    if (existing?.queue_number) {
      const match = existing.queue_number.match(/\d+/);
      if (match) nextNum = parseInt(match[0]) + 1;
    }
    const queueNumber = `A-${String(nextNum).padStart(3, '0')}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} WIB`;

    const { data: result, error } = await supabase
      .from('queues')
      .insert([{
        queue_number: queueNumber,
        owner_name: data.ownerName,
        email: data.email || '',
        pet_name: data.petName,
        service: data.service,
        registered_time: timeStr,
        status: 'Menunggu',
        type: data.type || 'Datang Sekarang',
        appointment_time: data.appointmentTime || null,
      }])
      .select()
      .single();
    if (error) { handleError('queueService.add', error); return null; }
    await logActivity('Mengambil nomor antrian', { service: data.service, petName: data.petName });
    return result;
  },

  updateStatus: async (id, status) => {
    const { error } = await supabase.from('queues').update({ status }).eq('id', id);
    if (error) { handleError('queueService.updateStatus', error); return false; }
    return true;
  },

  callNext: async () => {
    // Set current 'Dipanggil' to 'Dilayani'
    const { data: called } = await supabase
      .from('queues')
      .select('id')
      .eq('status', 'Dipanggil')
      .limit(1);
    if (called?.length > 0) {
      await supabase.from('queues').update({ status: 'Dilayani' }).eq('id', called[0].id);
    }

    // Call next in 'Menunggu'
    const { data: waiting } = await supabase
      .from('queues')
      .select('id')
      .eq('status', 'Menunggu')
      .order('created_at', { ascending: true })
      .limit(1);
    if (waiting?.length > 0) {
      await supabase.from('queues').update({ status: 'Dipanggil' }).eq('id', waiting[0].id);
    }
    return true;
  },

  delete: async (id) => {
    const { error } = await supabase.from('queues').delete().eq('id', id);
    if (error) { handleError('queueService.delete', error); return false; }
    return true;
  },

  subscribeToChanges: (callback) => {
    const channel = supabase
      .channel('queues_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queues' }, callback)
      .subscribe();
    return channel;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SLA SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const slaService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('sla_chats')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { handleError('slaService.getAll', error); return { chats: [], stats: { complianceRate: 0, compliantCount: 0, lateCount: 0, avgResponseTime: 0, violationsCount: 0 }, doctorStats: [], weeklyTrend: [] }; }

    const chats = data.map(c => ({
      id: c.id,
      ownerName: c.owner_name,
      petName: c.pet_name,
      doctorName: c.doctor_name,
      chatReceivedTime: c.chat_received_time,
      firstResponseTime: c.first_response_time,
      responseDuration: c.response_duration,
      statusSLA: c.status_sla,
      statusChat: c.status_chat,
      isEscalated: c.is_escalated,
    }));

    const SLA_TARGET = 30;
    const compliantChats = chats.filter(c => c.statusSLA === 'Tepat Waktu').length;
    const lateChats = chats.filter(c => c.statusSLA === 'Terlambat').length;
    const complianceRate = chats.length > 0 ? Math.round((compliantChats / chats.length) * 100) : 100;
    const violationsCount = chats.filter(c => c.statusSLA === 'Terlambat' && c.statusChat === 'Aktif').length;
    const responded = chats.filter(c => c.firstResponseTime !== null);
    const avgResponseTime = responded.length > 0
      ? Math.round(responded.reduce((sum, c) => sum + (c.responseDuration || 0), 0) / responded.length)
      : 0;

    const doctors = ['Dr. Rizal', 'Dr. Maya', 'Dr. Sarah'];
    const doctorStats = doctors.map(doc => {
      const docChats = chats.filter(c => c.doctorName === doc);
      const docTotal = docChats.length;
      const docCompliant = docChats.filter(c => c.statusSLA === 'Tepat Waktu').length;
      const docRate = docTotal > 0 ? Math.round((docCompliant / docTotal) * 100) : 100;
      const docResponded = docChats.filter(c => c.firstResponseTime !== null);
      const docAvg = docResponded.length > 0
        ? Math.round(docResponded.reduce((sum, c) => sum + c.responseDuration, 0) / docResponded.length)
        : 0;
      return { name: doc, complianceRate: docRate, avgResponseTime: docAvg, totalChats: docTotal };
    });

    return { chats, stats: { complianceRate, compliantCount: compliantChats, lateCount: lateChats, avgResponseTime, violationsCount }, doctorStats, weeklyTrend: [] };
  },

  escalate: async (id) => {
    const doctors = ['Dr. Rizal', 'Dr. Maya', 'Dr. Sarah'];
    const { data: chat } = await supabase.from('sla_chats').select('doctor_name').eq('id', id).single();
    if (!chat) return false;
    const currentIdx = doctors.indexOf(chat.doctor_name);
    const nextDoc = doctors[(currentIdx + 1) % doctors.length];
    const { error } = await supabase.from('sla_chats').update({ doctor_name: nextDoc, status_sla: 'Tepat Waktu', response_duration: 2, is_escalated: true }).eq('id', id);
    if (error) { handleError('slaService.escalate', error); return false; }
    return true;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PIPELINE MEMBER SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const pipelineService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('pipeline_members')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { handleError('pipelineService.getAll', error); return { GUEST: [], BARU: [], AKTIF: [], SETIA: [], TIDAK_AKTIF: [] }; }

    const members = data.map(m => ({
      id: m.id,
      member_id: m.member_id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      stage: m.stage,
      registeredAt: m.registered_at,
      visits: m.visits,
      pets: m.pets || [],
      totalTransaksi: m.total_transaksi,
    }));

    return {
      GUEST: [],
      BARU: members.filter(m => m.stage === 'BARU'),
      AKTIF: members.filter(m => m.stage === 'AKTIF'),
      SETIA: members.filter(m => m.stage === 'SETIA'),
      TIDAK_AKTIF: members.filter(m => m.stage === 'TIDAK AKTIF'),
    };
  },

  moveStage: async (id, newStage) => {
    const { error } = await supabase
      .from('pipeline_members')
      .update({ stage: newStage })
      .eq('id', id);
    if (error) { handleError('pipelineService.moveStage', error); return false; }
    return true;
  },

  getSegments: async () => {
    const { data: members, error } = await supabase.from('pipeline_members').select('*');
    if (error) { handleError('pipelineService.getSegments', error); return {}; }
    const { data: vaccines } = await supabase.from('vaksin').select('email, due_date, status');

    const checkPetType = (m, type) => {
      if (!m.pets) return false;
      return m.pets.some(p => p.toLowerCase().includes(type.toLowerCase()));
    };

    const getMemberVaccineStatus = (m) => {
      const mVacs = (vaccines || []).filter(v => v.email?.toLowerCase() === m.email?.toLowerCase());
      if (mVacs.length === 0) return 'Vaksin Lengkap';
      const hasOverdue = mVacs.some(v => {
        const days = Math.ceil((new Date(v.due_date) - new Date()) / (1000 * 60 * 60 * 24));
        return days < 0 && v.status === 'Belum Diingatkan';
      });
      if (hasOverdue) return 'Vaksin Sudah Terlambat';
      const hasSoon = mVacs.some(v => {
        const days = Math.ceil((new Date(v.due_date) - new Date()) / (1000 * 60 * 60 * 24));
        return days >= 0 && days <= 7 && v.status === 'Belum Diingatkan';
      });
      if (hasSoon) return 'Vaksin Hampir Jatuh Tempo';
      return 'Vaksin Lengkap';
    };

    return {
      jenisHewan: [
        { name: 'Pemilik Anjing', count: members.filter(m => checkPetType(m, 'anjing')).length, value: 'anjing' },
        { name: 'Pemilik Kucing', count: members.filter(m => checkPetType(m, 'kucing')).length, value: 'kucing' },
        { name: 'Pemilik Kelinci', count: members.filter(m => checkPetType(m, 'kelinci')).length, value: 'kelinci' },
        { name: 'Lainnya', count: members.filter(m => !checkPetType(m, 'anjing') && !checkPetType(m, 'kucing') && !checkPetType(m, 'kelinci')).length, value: 'lainnya' },
      ],
      frekuensiKunjungan: [
        { name: 'Sangat Aktif (5+)', count: members.filter(m => m.visits >= 5).length, value: 'sangat_aktif' },
        { name: 'Aktif (3-4)', count: members.filter(m => m.visits >= 3 && m.visits <= 4).length, value: 'aktif' },
        { name: 'Jarang (1-2)', count: members.filter(m => m.visits >= 1 && m.visits <= 2).length, value: 'jarang' },
        { name: 'Belum Pernah (0)', count: members.filter(m => m.visits === 0).length, value: 'belum_pernah' },
      ],
      statusVaksin: [
        { name: 'Vaksin Lengkap', count: members.filter(m => getMemberVaccineStatus(m) === 'Vaksin Lengkap').length, value: 'lengkap' },
        { name: 'Vaksin Hampir Jatuh Tempo', count: members.filter(m => getMemberVaccineStatus(m) === 'Vaksin Hampir Jatuh Tempo').length, value: 'hampir_tempo' },
        { name: 'Vaksin Sudah Terlambat', count: members.filter(m => getMemberVaccineStatus(m) === 'Vaksin Sudah Terlambat').length, value: 'terlambat' },
      ],
      nilaiTransaksi: [
        { name: 'High Value (Rp 1jt+)', count: members.filter(m => (m.total_transaksi || 0) >= 1000000).length, value: 'high' },
        { name: 'Medium (Rp 500rb - 1jt)', count: members.filter(m => (m.total_transaksi || 0) >= 500000 && (m.total_transaksi || 0) < 1000000).length, value: 'medium' },
        { name: 'Low Value (< Rp 500rb)', count: members.filter(m => (m.total_transaksi || 0) < 500000).length, value: 'low' },
      ],
      pipelineStage: [
        { name: 'Baru', count: members.filter(m => m.stage === 'BARU').length, value: 'BARU' },
        { name: 'Aktif', count: members.filter(m => m.stage === 'AKTIF').length, value: 'AKTIF' },
        { name: 'Setia', count: members.filter(m => m.stage === 'SETIA').length, value: 'SETIA' },
        { name: 'Tidak Aktif', count: members.filter(m => m.stage === 'TIDAK AKTIF').length, value: 'TIDAK_AKTIF' },
      ],
    };
  },

  getMembersBySegment: async (category, val) => {
    const { data: members } = await supabase.from('pipeline_members').select('*');
    if (!members) return [];

    const checkPetType = (m, type) => (m.pets || []).some(p => p.toLowerCase().includes(type.toLowerCase()));

    if (category === 'jenisHewan') {
      if (val === 'lainnya') return members.filter(m => !checkPetType(m, 'anjing') && !checkPetType(m, 'kucing') && !checkPetType(m, 'kelinci'));
      return members.filter(m => checkPetType(m, val));
    }
    if (category === 'frekuensiKunjungan') {
      if (val === 'sangat_aktif') return members.filter(m => m.visits >= 5);
      if (val === 'aktif') return members.filter(m => m.visits >= 3 && m.visits <= 4);
      if (val === 'jarang') return members.filter(m => m.visits >= 1 && m.visits <= 2);
      if (val === 'belum_pernah') return members.filter(m => m.visits === 0);
    }
    if (category === 'nilaiTransaksi') {
      if (val === 'high') return members.filter(m => (m.total_transaksi || 0) >= 1000000);
      if (val === 'medium') return members.filter(m => (m.total_transaksi || 0) >= 500000 && (m.total_transaksi || 0) < 1000000);
      if (val === 'low') return members.filter(m => (m.total_transaksi || 0) < 500000);
    }
    if (category === 'pipelineStage') {
      const dbStage = val === 'TIDAK_AKTIF' ? 'TIDAK AKTIF' : val;
      return members.filter(m => m.stage === dbStage);
    }
    return [];
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PASIEN SERVICE (Hewan)
// ─────────────────────────────────────────────────────────────────────────────
export const pasienService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('pasien')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { handleError('pasienService.getAll', error); return []; }
    return data.map(p => ({
      id: p.id,
      nama: p.nama,
      spesies: p.spesies,
      ras: p.ras,
      pemilik: p.pemilik,
      telepon: p.telepon,
      email: p.email,
      kunjunganTerakhir: p.tanggal_lahir,
      status: p.status,
      berat: p.berat,
      foto: p.foto,
      memberId: p.member_id,
    }));
  },

  getByMemberId: async (memberId) => {
    const { data, error } = await supabase
      .from('pasien')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });
    if (error) { handleError('pasienService.getByMemberId', error); return []; }
    return data.map(p => ({
      id: p.id,
      memberId: p.member_id,
      nama: p.nama,
      spesies: p.spesies,
      ras: p.ras,
      tanggalLahir: p.tanggal_lahir,
      jenisKelamin: p.jenis_kelamin,
      berat: p.berat,
      warna: p.warna,
      sterilisasi: p.sterilisasi,
      status: p.status,
      foto: p.foto,
    }));
  },

  add: async (data) => {
    const { data: result, error } = await supabase
      .from('pasien')
      .insert([{
        member_id: data.memberId || null,
        nama: data.nama,
        spesies: data.spesies,
        ras: data.ras,
        tanggal_lahir: data.tanggalLahir,
        jenis_kelamin: data.jenisKelamin,
        berat: data.berat,
        warna: data.warna,
        sterilisasi: data.sterilisasi || false,
        status: data.status || 'Sehat',
        foto: data.foto || '🐾',
      }])
      .select()
      .single();
    if (error) { handleError('pasienService.add', error); return null; }
    return result;
  },

  update: async (id, data) => {
    const { error } = await supabase
      .from('pasien')
      .update({
        nama: data.nama,
        spesies: data.spesies,
        ras: data.ras,
        tanggal_lahir: data.tanggalLahir,
        jenis_kelamin: data.jenisKelamin,
        berat: data.berat,
        warna: data.warna,
        sterilisasi: data.sterilisasi,
        status: data.status,
      })
      .eq('id', id);
    if (error) { handleError('pasienService.update', error); return false; }
    return true;
  },

  delete: async (id) => {
    const { error } = await supabase.from('pasien').delete().eq('id', id);
    if (error) { handleError('pasienService.delete', error); return false; }
    return true;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// JADWAL TEMU SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const jadwalService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('jadwal_temu')
      .select('*')
      .order('tanggal', { ascending: true });
    if (error) { handleError('jadwalService.getAll', error); return []; }
    return data;
  },

  getByDate: async (date) => {
    const { data, error } = await supabase
      .from('jadwal_temu')
      .select('*')
      .eq('tanggal', date)
      .order('waktu', { ascending: true });
    if (error) { handleError('jadwalService.getByDate', error); return []; }
    return data.map(a => ({
      id: a.id,
      waktu: a.waktu?.substring(0, 5),
      hewan: a.pet_name,
      spesies: a.spesies,
      pemilik: a.pemilik,
      layanan: a.layanan,
      dokter: a.dokter,
      status: a.status,
    }));
  },

  getByMemberId: async (memberId) => {
    const { data, error } = await supabase
      .from('jadwal_temu')
      .select('*')
      .eq('member_id', memberId)
      .order('tanggal', { ascending: false });
    if (error) { handleError('jadwalService.getByMemberId', error); return []; }
    return data.map(a => ({
      id: a.id,
      memberId: a.member_id,
      petName: a.pet_name,
      service: a.layanan,
      doctor: a.dokter,
      date: a.tanggal,
      time: a.waktu?.substring(0, 5),
      status: a.status,
      notes: a.catatan,
    }));
  },

  create: async (data) => {
    const { data: result, error } = await supabase
      .from('jadwal_temu')
      .insert([{
        member_id: data.memberId || null,
        pet_name: data.petName || data.hewan,
        spesies: data.spesies,
        pemilik: data.pemilik,
        email: data.email,
        telepon: data.telepon,
        layanan: data.layanan || data.service,
        dokter: data.dokter || data.doctor,
        tanggal: data.tanggal || data.date,
        waktu: data.waktu || data.time,
        status: 'Menunggu',
        catatan: data.catatan || data.notes || '',
      }])
      .select()
      .single();
    if (error) { handleError('jadwalService.create', error); return null; }
    await logActivity('Membuat janji temu', { service: data.layanan || data.service, doctor: data.dokter || data.doctor, date: data.tanggal || data.date });
    return result;
  },

  updateStatus: async (id, status) => {
    const { error } = await supabase.from('jadwal_temu').update({ status }).eq('id', id);
    if (error) { handleError('jadwalService.updateStatus', error); return false; }
    return true;
  },

  cancel: async (id) => {
    return jadwalService.updateStatus(id, 'Dibatalkan');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MEDICAL RECORD SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const medicalRecordService = {
  getByMemberId: async (memberId) => {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('member_id', memberId)
      .order('visit_date', { ascending: false });
    if (error) { handleError('medicalRecordService.getByMemberId', error); return []; }
    return data.map(r => ({
      id: r.id,
      memberId: r.member_id,
      petName: r.pet_name,
      date: r.visit_date,
      doctor: r.doctor,
      diagnosis: r.diagnosis,
      action: r.action,
      treatment: r.treatment,
      notes: r.notes,
    }));
  },

  add: async (data) => {
    const { data: result, error } = await supabase
      .from('medical_records')
      .insert([{
        member_id: data.memberId,
        pet_name: data.petName,
        visit_date: data.date,
        doctor: data.doctor,
        diagnosis: data.diagnosis,
        action: data.action,
        treatment: data.treatment,
        notes: data.notes,
      }])
      .select()
      .single();
    if (error) { handleError('medicalRecordService.add', error); return null; }
    return result;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAT SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const chatService = {
  getByMemberId: async (memberId) => {
    const { data, error } = await supabase
      .from('chats')
      .select('*, chat_messages(*)')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });
    if (error) { handleError('chatService.getByMemberId', error); return []; }
    return data.map(c => ({
      id: c.id,
      memberId: c.member_id,
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
          time: new Date(m.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date(m.created_at).getTime(),
        })),
    }));
  },

  sendMessage: async (chatId, text, sender = 'member') => {
    const { error } = await supabase
      .from('chat_messages')
      .insert([{ chat_id: chatId, sender, text }]);
    if (error) { handleError('chatService.sendMessage', error); return false; }

    if (sender === 'member') {
      await logActivity('Mengirim pesan konsultasi', { chatId, snippet: text.substring(0, 40) });
    }
    if (sender === 'doctor') {
      await supabase.rpc('increment', { table: 'chats', col: 'unread_count', row_id: chatId }).catch(() => {
        supabase.from('chats').select('unread_count').eq('id', chatId).single().then(({ data }) => {
          if (data) supabase.from('chats').update({ unread_count: (data.unread_count || 0) + 1 }).eq('id', chatId);
        });
      });
    }
    return true;
  },

  subscribeToMessages: (chatId, callback) => {
    const channel = supabase
      .channel(`chat_${chatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${chatId}` }, callback)
      .subscribe();
    return channel;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// BILL SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const billService = {
  getByMemberId: async (memberId) => {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('member_id', memberId)
      .order('bill_date', { ascending: false });
    if (error) { handleError('billService.getByMemberId', error); return []; }
    return data.map(b => ({
      id: b.id,
      memberId: b.member_id,
      invoiceNo: b.invoice_no,
      date: b.bill_date,
      service: b.service,
      amount: b.amount,
      status: b.status,
      details: b.details || [],
    }));
  },

  add: async (data) => {
    const { data: result, error } = await supabase
      .from('bills')
      .insert([{
        member_id: data.memberId,
        invoice_no: data.invoiceNo,
        service: data.service,
        amount: data.amount,
        status: data.status || 'Belum Dibayar',
        details: data.details || [],
        bill_date: data.date || new Date().toISOString().split('T')[0],
      }])
      .select()
      .single();
    if (error) { handleError('billService.add', error); return null; }
    return result;
  },

  updateStatus: async (id, status) => {
    const { error } = await supabase.from('bills').update({ status }).eq('id', id);
    if (error) { handleError('billService.updateStatus', error); return false; }
    await logActivity('Memperbarui status pembayaran tagihan', { billId: id, status });
    return true;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// POINT SERVICE (Membership Points)
// ─────────────────────────────────────────────────────────────────────────────
export const pointService = {
  /** Get current points and tier for a user */
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('total_poin, tier, created_at')
      .eq('user_id', userId)
      .single();
    if (error) { handleError('pointService.getProfile', error); return { total_poin: 0, tier: 'Bronze' }; }
    return { total_poin: data.total_poin || 0, tier: data.tier || 'Bronze', created_at: data.created_at };
  },

  /** Get point transaction history for a user */
  getHistory: async (userId, limit = 10) => {
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) { handleError('pointService.getHistory', error); return []; }
    return data.map(p => ({
      id: p.id,
      poin: p.poin,
      jenis: p.jenis,
      sumber: p.sumber,
      keterangan: p.keterangan,
      nominalTransaksi: p.nominal_transaksi,
      createdAt: p.created_at,
    }));
  },

  /** Manually add points (e.g., registration bonus) */
  addPoints: async (userId, poin, sumber, keterangan) => {
    // Add point transaction record
    const { error: txError } = await supabase
      .from('point_transactions')
      .insert([{
        user_id: userId,
        poin,
        jenis: 'earn',
        sumber,
        keterangan,
      }]);
    if (txError) { handleError('pointService.addPoints.tx', txError); return false; }

    // Update user's total points
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_poin')
      .eq('user_id', userId)
      .single();

    const currentPoints = profile?.total_poin || 0;
    const newPoints = currentPoints + poin;

    // Calculate tier
    let tier = 'Bronze';
    if (newPoints >= 1000) tier = 'Gold';
    else if (newPoints >= 500) tier = 'Silver';

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ total_poin: newPoints, tier })
      .eq('user_id', userId);

    if (updateError) { handleError('pointService.addPoints.update', updateError); return false; }
    return true;
  },

  /** Get tier configuration */
  getTierInfo: (points) => {
    if (points >= 1000) return { name: 'Gold', minPoints: 1000, nextTier: null };
    if (points >= 500) return { name: 'Silver', minPoints: 500, nextTier: 'Gold', pointsToNext: 1000 - points };
    return { name: 'Bronze', minPoints: 0, nextTier: 'Silver', pointsToNext: 500 - points };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MEMBER PROFILE SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const memberProfileService = {
  getById: async (id) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    if (error) { handleError('memberProfileService.getById', error); return null; }
    return data;
  },

  update: async (id, data) => {
    const { error } = await supabase
      .from('profiles')
      .update({ name: data.name, email: data.email })
      .eq('user_id', id);
    if (error) { handleError('memberProfileService.update', error); return false; }
    return true;
  },

  changePassword: async (id, newPassword) => {
    // Password updates are managed directly via supabase.auth.updateUser in the UI
    return true;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const dashboardService = {
  getStats: async () => {
    const [
      { count: totalMembers },
      { count: totalPasien },
      { data: todayAppts },
      { data: pendingVaccines },
      { data: newTickets },
      { data: waitingQueues },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'member'),
      supabase.from('pasien').select('*', { count: 'exact', head: true }),
      supabase.from('jadwal_temu').select('id, pet_name, pemilik, spesies, layanan, waktu, status').eq('tanggal', new Date().toISOString().split('T')[0]).order('waktu'),
      supabase.from('vaksin').select('id').eq('status', 'Belum Diingatkan').lte('due_date', new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]),
      supabase.from('tickets').select('id').eq('status', 'Baru'),
      supabase.from('queues').select('id').eq('status', 'Menunggu'),
    ]);

    return {
      totalMembers: totalMembers || 0,
      totalPasien: totalPasien || 0,
      todayAppointments: (todayAppts || []).map(a => ({
        id: a.id,
        pemilik: a.pemilik,
        hewan: a.pet_name,
        spesies: a.spesies,
        jenis: a.layanan,
        waktu: a.waktu?.substring(0, 5),
        status: a.status,
      })),
      pendingVaccines: (pendingVaccines || []).length,
      newTickets: (newTickets || []).length,
      waitingQueue: (waitingQueues || []).length,
    };
  },
};
