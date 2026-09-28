import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Github,
  Twitter,
  Youtube,
  Globe,
  Mail,
  Phone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedDock } from '@/components/ui/animated-dock';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: 'What is the maximum amount I can send?',
    answer:
      'Transfer limits depend on your verification level and country. You can check your limits inside your account settings.',
  },
  {
    question: 'Does my recipient need an account?',
    answer:
      "No, your recipient doesn't need an account. Funds can be sent directly to their bank account or mobile wallet.",
  },
  {
    question: 'Is there a mobile app available?',
    answer:
      'Yes, our mobile app is available on both iOS and Android for easy transfers on the go.',
  },
  {
    question: 'Can I cancel a transfer?',
    answer:
      'Transfers can be cancelled if they have not yet been processed by the receiving bank. Check your transfer status for options.',
  },
  {
    question: 'What currencies are supported?',
    answer:
      'We support over 50 currencies worldwide. You can view the full list of supported currencies in our app or website.',
  },
];

export default function CtaFaqFooterSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [buttonHovered, setButtonHovered] = useState(false);

  const toggleFaq = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div
      id="cta-faq-footer-section"
      className="bg-white text-neutral-900 w-full"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Main CTA + FAQ Section with expanded container width */}
      <main id="cta-section" className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 md:px-8 py-20 max-[900px]:py-[60px]">
        <div className="grid grid-cols-[1.6fr_1fr] gap-[30px] items-stretch max-[900px]:grid-cols-1 max-[900px]:gap-[60px]">
          {/* Left column — Animated Gradient CTA card */}
          <div
            id="cta-card"
            className="c5-animated-gradient rounded-[24px] py-20 px-6 sm:px-10 text-white flex flex-col justify-center items-center text-center"
            style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)' }}
          >
            <h2
              className="font-normal leading-[1.1] mb-[15px]"
              style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)', letterSpacing: '-0.03em' }}
            >
              Ready to Transfer
              <br />
              Without Borders?
            </h2>

            <p className="text-[0.9rem] sm:text-[1rem] mb-[30px] font-normal opacity-85 max-w-md">
              Send Money Worldwide at the Best Rates
            </p>

            <button
              id="cta-get-started-btn"
              type="button"
              className="bg-neutral-900 text-white font-semibold cursor-pointer border-none text-[0.95rem] transition-all duration-200 hover:-translate-y-0.5 select-none"
              style={{
                padding: '14px 32px',
                borderRadius: '12px',
                boxShadow: buttonHovered
                  ? '0 14px 30px rgba(0,0,0,0.4)'
                  : '0 10px 20px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
            >
              Get Started Today
            </button>
          </div>

          {/* Right column — Premium animated FAQ accordion */}
          <div id="faq-section" className="flex flex-col justify-center gap-3">
            {FAQ_DATA.map((item, index) => {
              const isActive = activeIndex === index;
              return (
                <div
                  key={index}
                  id={`faq-item-${index}`}
                  onClick={() => toggleFaq(index)}
                  className="bg-white border rounded-[12px] py-[18px] px-5 sm:px-6 cursor-pointer transition-all duration-300 hover:border-[#eaeaea] select-none"
                  style={{
                    borderColor: isActive ? '#eaeaea' : '#f0f0f0',
                    boxShadow: isActive
                      ? '0 6px 16px rgba(0,0,0,0.04)'
                      : '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div className="flex justify-between items-center font-normal text-[0.92rem] text-neutral-900 gap-3">
                    <span className="leading-snug">{item.question}</span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isActive ? 'rotate-180 text-neutral-900' : 'rotate-0 text-neutral-400'
                      }`}
                    />
                  </div>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0, y: -6 }}
                        animate={{ height: 'auto', opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -6 }}
                        transition={{
                          duration: 0.45,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 text-[0.9rem] text-[#666] leading-[1.6]">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer with matched max-width */}
      <footer className="bg-[#fafafa] pt-20 pb-6 max-[900px]:pt-[60px]">
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-[2fr_1fr_1fr_2fr] gap-10 mb-[50px] max-[900px]:grid-cols-2 max-[480px]:grid-cols-1">
            {/* Logo column & Follow on social dock */}
            <div className="flex flex-col justify-between">
              <div>
                <img
                  src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg"
                  alt="Logo"
                  className="h-6 mb-[15px]"
                  style={{ filter: 'brightness(0)' }}
                />
                <p className="text-[0.85rem] text-[#888] leading-[1.6] max-w-[220px]">
                  Reliable transfers that always reach their destination on time.
                </p>
              </div>

              {/* Follow on section */}
              <div className="mt-6 pt-4">
                <span className="text-[0.78rem] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Follow Us
                </span>
                <div className="flex items-center">
                  <AnimatedDock
                    className="mx-0 h-14 px-3 pb-2.5 gap-2.5 bg-white/95 border border-[#F26522]/25 hover:border-[#F26522]/45 shadow-[0_4px_16px_-4px_rgba(242,101,34,0.15)] rounded-2xl"
                    itemClassName="bg-[#F26522] hover:bg-[#d85213] text-white shadow-[0_2px_8px_rgba(242,101,34,0.35)]"
                    items={[
                      {
                        link: "https://github.com",
                        target: "_blank",
                        Icon: <Github size={18} className="text-white" />,
                      },
                      {
                        link: "https://x.com",
                        target: "_blank",
                        Icon: <Twitter size={18} className="text-white" />,
                      },
                      {
                        link: "https://youtube.com",
                        target: "_blank",
                        Icon: <Youtube size={18} className="text-white" />,
                      },
                      {
                        link: "https://autoreplyex.com",
                        target: "_blank",
                        Icon: <Globe size={18} className="text-white" />,
                      },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold mb-5 text-[0.95rem] text-neutral-900">
                Navigation
              </h4>
              <ul className="list-none p-0 m-0">
                {['Features', 'Benefits', 'Testimonials', 'Pricing'].map((item) => (
                  <li key={item} className="mb-3">
                    <a
                      href="#"
                      className="text-[#888] no-underline text-[0.85rem] transition-colors duration-200 hover:text-neutral-900"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pages */}
            <div>
              <h4 className="font-semibold mb-5 text-[0.95rem] text-neutral-900">
                Pages
              </h4>
              <ul className="list-none p-0 m-0">
                {['Home', 'Contact', '404'].map((item) => (
                  <li key={item} className="mb-3">
                    <a
                      href="#"
                      className="text-[#888] no-underline text-[0.85rem] transition-colors duration-200 hover:text-neutral-900"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Us */}
            <div id="contact-section">
              <h4 className="font-semibold text-[0.95rem] text-neutral-900 mb-[15px]">
                Contact Us
              </h4>
              <p className="text-[0.85rem] text-[#888] mb-4 leading-relaxed">
                Have questions or need assistance? Our support engineers are available 24/7.
              </p>

              {/* Direct channels */}
              <div className="flex flex-col gap-2 text-[0.82rem] text-slate-600">
                <a
                  href="mailto:support@autoreplyex.com"
                  className="flex items-center gap-2 hover:text-[#F26522] transition-colors group"
                >
                  <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center group-hover:bg-[#F26522]/10 transition-colors">
                    <Mail size={13} className="text-[#F26522]" />
                  </div>
                  <span>support@autoreplyex.com</span>
                </a>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
                    <Phone size={13} className="text-[#F26522]" />
                  </div>
                  <span>+1 (800) 555-0199</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-[#f0f0f0] pt-[25px] pb-[10px] flex justify-between text-[0.85rem] text-[#888] max-[480px]:flex-col max-[480px]:gap-[15px] max-[480px]:items-center">
            <span>All rights reserved. © 2025</span>
            <span>Designed by Peter Design</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
