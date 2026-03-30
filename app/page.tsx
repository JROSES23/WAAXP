'use client'
// v3 landing — dark premium redesign

import { useState } from 'react'
import Navbar from '@/components/landing-v2/Navbar'
import HeroSection from '@/components/landing-v2/HeroSection'
import ProblemSection from '@/components/landing-v2/ProblemSection'
import HowItWorks from '@/components/landing-v2/HowItWorks'
import FeaturesGrid from '@/components/landing-v2/FeaturesGrid'
import PricingSection from '@/components/landing-v2/PricingSection'
import TestimonialsSection from '@/components/landing-v2/TestimonialsSection'
import FAQSection from '@/components/landing-v2/FAQSection'
import FinalCTA from '@/components/landing-v2/FinalCTA'
import Footer from '@/components/landing-v2/Footer'
import VideoModal from '@/components/landing/VideoModal'
import ContactModal from '@/components/landing/ContactModal'

export default function LandingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: '#060a10' }}>
      <Navbar />
      <HeroSection onOpenVideo={() => setIsVideoOpen(true)} />
      <ProblemSection />
      <HowItWorks />
      <FeaturesGrid />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTA onContact={() => setIsContactOpen(true)} />
      <Footer onContact={() => setIsContactOpen(true)} />
      <VideoModal open={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
      <ContactModal open={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  )
}
