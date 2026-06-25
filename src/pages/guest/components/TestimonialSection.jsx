import React, { useEffect, useState } from 'react';
import { pipelineService } from '../../../lib/supabaseService';

export default function TestimonialSection() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const pipeline = await pipelineService.getAll();
        const allMembers = [
          ...(pipeline.BARU || []),
          ...(pipeline.AKTIF || []),
          ...(pipeline.SETIA || []),
          ...(pipeline.TIDAK_AKTIF || [])
        ];
        setMembers(allMembers);
      } catch (e) {
        console.error("Failed to load members for testimonials:", e);
      }
    };
    loadMembers();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'V';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const findMemberName = (targetId, defaultName) => {
    const member = members.find(m => m.id === targetId || m.name.toLowerCase() === defaultName.toLowerCase());
    return member ? member.name : defaultName;
  };

  const name1 = findMemberName('MB-005', 'Budi Santoso');
  const name2 = findMemberName('MB-003', 'Siti Rahayu');
  const name3 = findMemberName('MB-006', 'Dewi Kusuma');

  const testimonials = [
    {
      stars: 5,
      text: 'Pelayanan sangat profesional! Buddy sembuh lebih cepat dari yang diperkirakan. Dokternya ramah dan informatif.',
      name: name1,
      initial: getInitials(name1),
      role: 'Pemilik Golden Retriever'
    },
    {
      stars: 5,
      text: 'Sistem booking online sangat memudahkan. Tidak perlu antri lama, langsung dilayani sesuai jadwal.',
      name: name2,
      initial: getInitials(name2),
      role: 'Pemilik Kucing Persia'
    },
    {
      stars: 5,
      text: 'Grooming Mochi selalu di sini, hasilnya selalu rapi dan Mochi senang. Staff-nya sayang sama hewan!',
      name: name3,
      initial: getInitials(name3),
      role: 'Pemilik Kelinci Mini'
    }
  ];

  return (
    <section className="testi-new-section scroll-animate">
      <div className="guest-container">
        {/* Section Header */}
        <div className="section-header" style={{ marginBottom: '40px' }}>
          <div className="section-eyebrow">
            <div className="section-eyebrow__dot" aria-hidden="true" />
            Ulasan Member
          </div>
          <h2 className="section-title">
            Apa Kata Member Kami
          </h2>
          <p className="section-subtitle">
            Lebih dari 5000 pemilik hewan mempercayai Veterinario
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="testi-new-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testi-new-card">
              {/* Stars */}
              <div className="testi-new-stars">
                {Array.from({ length: t.stars }).map((_, idx) => (
                  <span key={idx}>★</span>
                ))}
              </div>
              
              {/* Quote */}
              <p className="testi-new-quote">
                "{t.text}"
              </p>
              
              {/* Author footer */}
              <div className="testi-new-author">
                <div className="testi-new-avatar">
                  {t.initial}
                </div>
                <div>
                  <div className="testi-new-name">{t.name}</div>
                  <div className="testi-new-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
