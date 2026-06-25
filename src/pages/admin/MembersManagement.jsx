import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit2, Plus, X } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function MembersManagement() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('members').select('*').order('id', { ascending: false });
    if (error) setError(error.message);
    else setMembers(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus member ini?')) return;
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchMembers();
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({ name: member.name || '', email: member.email || '', password: member.password || '' });
    } else {
      setEditingMember(null);
      setFormData({ name: '', email: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (editingMember) {
      // Update
      const { error } = await supabase.from('members').update(formData).eq('id', editingMember.id);
      if (error) alert(error.message);
      else {
        handleCloseModal();
        fetchMembers();
      }
    } else {
      // Create
      const { error } = await supabase.from('members').insert([formData]);
      if (error) alert(error.message);
      else {
        handleCloseModal();
        fetchMembers();
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
      <PageHeader title="Kelola Member" subtitle="Data member dari Supabase" />
      
      <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Daftar Member</h3>
          <button 
            onClick={() => handleOpenModal()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#3b5bdb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
          >
            <Plus size={16} /> Tambah Member
          </button>
        </div>

        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: 12 }}>Name</th>
                <th style={{ padding: 12 }}>Email</th>
                <th style={{ padding: 12 }}>Password</th>
                <th style={{ padding: 12, width: 100 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: 12 }}>{member.name}</td>
                  <td style={{ padding: 12 }}>{member.email}</td>
                  <td style={{ padding: 12, color: '#9ca3af' }}>{member.password ? '••••••••' : '-'}</td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleOpenModal(member)} style={{ border: 'none', background: 'none', color: '#3b5bdb', cursor: 'pointer' }}><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(member.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan="4" style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>Belum ada data member.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 12, width: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>{editingMember ? 'Edit Member' : 'Tambah Member'}</h3>
              <button onClick={handleCloseModal} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Nama Lengkap</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Password</label>
                <input required={!editingMember} type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={editingMember ? "Kosongkan jika tidak ingin diubah" : ""} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, boxSizing: 'border-box' }} />
              </div>
              <button type="submit" disabled={loading} style={{ background: '#3b5bdb', color: 'white', border: 'none', padding: 10, borderRadius: 6, fontWeight: 600, cursor: 'pointer', marginTop: 10 }}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
