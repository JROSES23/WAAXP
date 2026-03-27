'use client'
// v2 landing — white + teal redesign
// TO REVERT: change imports back to '@/components/landing/...'

import { useState } from 'react'
// v2 imports:
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
import BottomNav from '@/components/landing-v2/BottomNav'
// Modals reused from v1:
import VideoModal from '@/components/landing/VideoModal'
import ContactModal from '@/components/landing/ContactModal'

export default function LandingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
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
      <BottomNav />
      <VideoModal open={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
      <ContactModal open={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  )
}
