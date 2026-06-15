import React, { useEffect } from 'react';
import './guest.css';
import GuestNavbar from './components/GuestNavbar';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import MembershipSection from './components/MembershipSection';
import WhyUsSection from './components/WhyUsSection';
import CtaBanner from './components/CtaBanner';
import GuestFooter from './components/GuestFooter';

export default function GuestPage() {
  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="guest-page">
      <GuestNavbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <MembershipSection />
        <WhyUsSection />
        <CtaBanner />
      </main>
      <GuestFooter />
    </div>
  );
}
