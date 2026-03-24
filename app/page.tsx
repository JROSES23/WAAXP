'use client'

import { useState } from 'react'
import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import ProblemSection from '@/components/landing/ProblemSection'
import HowItWorks from '@/components/landing/HowItWorks'
import FeaturesGrid from '@/components/landing/FeaturesGrid'
import SavingsCalculator from '@/components/landing/SavingsCalculator'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import PricingSection from '@/components/landing/PricingSection'
import FAQSection from '@/components/landing/FAQSection'
import FinalCTA from '@/components/landing/FinalCTA'
import Footer from '@/components/landing/Footer'
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
      <SavingsCalculator />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <FinalCTA onContact={() => setIsContactOpen(true)} />
      <Footer onContact={() => setIsContactOpen(true)} />

      <VideoModal open={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
      <ContactModal open={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  )
}
