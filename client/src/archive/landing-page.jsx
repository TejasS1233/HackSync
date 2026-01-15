import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';



const Logo = ({ className }) => (
  <svg viewBox="0 0 20 20" className={className} fill="none">
    <path d="M19.973 10.75L16.4 10.75C13.28 10.75 10.75 13.28 10.75 16.4L10.75 19.972C15.675 19.607 19.607 15.675 19.973 10.75Z" fill="currentColor" />
    <path d="M9.25 19.972L9.25 16.4C9.25 13.28 6.721 10.75 3.6 10.75L0.028 10.75C0.393 15.675 4.325 19.607 9.25 19.972Z" fill="currentColor" />
    <path d="M19.973 9.25C19.607 4.325 15.675 0.393 10.75 0.028L10.75 3.6C10.75 6.72 13.28 9.25 16.4 9.25Z" fill="currentColor" />
    <path d="M9.25 0.028C4.325 0.393 0.393 4.325 0.028 9.25L3.6 9.25C6.721 9.25 9.25 6.72 9.25 3.6Z" fill="currentColor" />
  </svg>
);

const SecurityIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const GlobeIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const UserCheckIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <polyline points="17 11 19 13 23 9" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const QuoteIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M14.017 21L14.017 18.009C14.017 16.882 14.084 15.867 14.218 14.964C14.385 14.032 14.654 13.213 15.025 12.507C15.426 11.773 15.936 11.161 16.555 10.671C17.205 10.153 18.031 9.894 19.033 9.894L19.033 6C17.397 6 15.952 6.533 14.698 7.6C13.444 8.639 12.518 10.038 11.92 11.797L12.553 11.797C11.551 11.797 10.741 12.064 10.123 12.598C9.505 13.104 9.196 13.791 9.196 14.659C9.196 15.556 9.505 16.271 10.123 16.805C10.741 17.311 11.551 17.564 12.553 17.564C13.253 17.564 13.846 17.377 14.331 17.003C14.816 16.601 15.059 16.036 15.059 15.309C15.059 14.73 14.922 14.248 14.648 13.863C14.374 13.45 13.993 13.243 13.505 13.243C13.14 13.243 12.83 13.333 12.575 13.513C12.332 13.676 12.21 13.91 12.21 14.215C12.21 14.42 12.271 14.603 12.393 14.764C12.515 14.925 12.728 15.006 13.033 15.006C13.367 15.006 13.626 14.896 13.809 14.677C13.991 14.43 14.082 14.12 14.082 13.746L14.017 21ZM4.983 21L4.983 18.009C4.983 16.882 5.05 15.867 5.184 14.964C5.351 14.032 5.62 13.213 5.991 12.507C6.392 11.773 6.902 11.161 7.521 10.671C8.171 10.153 8.997 9.894 9.999 9.894L9.999 6C8.363 6 6.918 6.533 5.664 7.6C4.41 8.639 3.484 10.038 2.886 11.797L3.519 11.797C2.517 11.797 1.707 12.064 1.089 12.598C0.471 13.104 0.162 13.791 0.162 14.659C0.162 15.556 0.471 16.271 1.089 16.805C1.707 17.311 2.517 17.564 3.519 17.564C4.219 17.564 4.812 17.377 5.297 17.003C5.782 16.601 6.025 16.036 6.025 15.309C6.025 14.73 5.888 14.248 5.614 13.863C5.34 13.45 4.959 13.243 4.471 13.243C4.106 13.243 3.796 13.333 3.541 13.513C3.298 13.676 3.176 13.91 3.176 14.215C3.176 14.42 3.237 14.603 3.359 14.764C3.481 14.925 3.694 15.006 3.999 15.006C4.333 15.006 4.592 14.896 4.775 14.677C4.957 14.43 5.048 14.12 5.048 13.746L4.983 21Z" />
  </svg>
);

const ChevronDown = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);



const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 py-3' : 'bg-white py-4'
        }`}
    >
      <div className="max-w-[1248px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-2 group">
          <Logo className="w-6 h-6 text-black" />
          <span className="font-brand font-semibold text-2xl tracking-tighter text-black lowercase">novera</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {['About', 'Pricing', 'Blog', 'Updates', 'Careers'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-black/60 hover:text-black font-medium text-sm transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <a href="#contact" className="text-black font-semibold text-sm hover:underline">Contact</a>
          <a
            href="#get-started"
            className="bg-[#212121] text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-black transition-colors"
          >
            Get Started
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden flex flex-col gap-1.5 w-8 h-8 justify-center items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`w-6 h-0.5 bg-black transition-transform ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-6 h-0.5 bg-black transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-0.5 bg-black transition-transform ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-t border-gray-100 p-6 flex flex-col gap-6 lg:hidden shadow-xl h-screen">
          {['About', 'Pricing', 'Blog', 'Updates', 'Careers'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-3xl font-serif text-black font-medium"
              onClick={() => setIsOpen(false)}
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section id="hero" className="relative w-full min-h-screen flex flex-col lg:flex-row bg-black overflow-hidden">

      {/* Mobile Image */}
      <div className="lg:hidden w-full h-[50vh] relative overflow-hidden bg-neutral-900 border-b border-white/10 flex items-center justify-center">
        <span className="text-white/20 font-medium tracking-widest uppercase text-sm">Visual Placeholder</span>
      </div>

      {/* Left Image (Desktop) - Swapped for Novera Layout */}
      <div className="hidden lg:block lg:w-1/2 h-screen relative overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="w-full h-full bg-neutral-900 flex items-center justify-center border-r border-white/10"
        >
          <div className="text-white/10">
            {/* Abstract Legal/Document Graphic */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-64 h-64">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="8" y1="14" x2="12" y2="14" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20"></div>
        </motion.div>
      </div>

      {/* Right Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:p-16 lg:pl-24 bg-black z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-[580px]"
        >
          <div className="inline-block mb-6">
            <span className="text-white/60 text-sm font-medium tracking-wide uppercase">AI-Powered LegalTech</span>
          </div>
          <h1 className="font-serif text-5xl lg:text-7xl leading-[1.1] lg:leading-[1] tracking-tight mb-8">
            A smarter way <br /> to work with <span className="text-lime">law.</span>
          </h1>
          <p className="text-lg lg:text-xl text-white/80 leading-relaxed mb-10 max-w-md">
            An AI-powered platform built to read, understand, and safeguard your contracts. Streamline your workflow with precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#"
              className="inline-flex justify-center items-center px-8 py-4 bg-lime text-black font-semibold rounded-md hover:bg-white transition-colors"
            >
              Try Novera
            </a>
            <a
              href="#features-overview"
              className="inline-flex justify-center items-center px-8 py-4 bg-[#212121] text-white font-semibold rounded-md hover:bg-[#333] transition-colors"
            >
              Discover Product
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};


const LOGOS = Array(5).fill(0).map((_, i) => (
  <div key={i} className="h-8 w-32 bg-white/20 rounded flex items-center justify-center text-white/10 text-xs uppercase font-bold tracking-widest">
    Client {i + 1}
  </div>
));

const SocialProof = () => {
  return (
    <section id="social-proof" className="py-24 bg-black border-b border-white/10">
      <div className="max-w-[1248px] mx-auto px-6 text-center">
        <p className="text-white/60 mb-12 text-lg">Trusted by 100+ lawyers and teams</p>
        <div className="flex flex-wrap gap-12 justify-center items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {LOGOS}
        </div>
      </div>
    </section>
  );
};

const FeaturesOverview = () => {
  return (
    <section id="features-overview" className="py-32 bg-black px-6">
      <div className="max-w-[1248px] mx-auto">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
            <div className="w-2 h-2 rounded-full bg-lime"></div>
            <span className="text-sm font-medium">Core Capabilities</span>
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl mb-6">Smarter tools for faster, safer legal work.</h2>
          <p className="text-xl text-white/60">Streamline your workflow with intelligent features designed to make every contract more accurate, compliant, and effortless.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "AI Contract Review",
              desc: "Instantly detect risks, missing clauses, and inconsistencies — powered by legal-grade AI.",
            },
            {
              title: "Drafting Automation",
              desc: "Generate and edit contracts in minutes with AI-assisted templates tailored to your needs.",
            },
            {
              title: "Compliance Insights",
              desc: "Ensure regulatory alignment with automated checks and clear audit trails.",
            }
          ].map((feature, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="overflow-hidden rounded-lg mb-4 h-64 border border-white/10 bg-white/5 relative">
                <div className="absolute inset-0 flex items-center justify-center text-white/20 transition-transform duration-700 group-hover:scale-105">
                  {/* Placeholder Graphic */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-20 border-2 border-current rounded-md opacity-30"></div>
                    <span className="text-xs uppercase tracking-widest opacity-50">Visual</span>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-lime transition-colors underline decoration-lime underline-offset-4 decoration-2">{feature.title}</h3>
              <p className="text-white/60">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FEATURE_SECTIONS = [
  {
    id: "contract-review",
    title: "Contract Review",
    desc: "Instantly analyze complex contracts and detect missing clauses, inconsistencies, or potential risks using advanced legal AI models trained on real-world data.",
  },
  {
    id: "drafting-assistant",
    title: "Drafting Assistant",
    desc: "Speed up document creation with intelligent suggestions. The AI learns your preferred clauses and terminology, ensuring consistency across all your legal documents.",
  },
  {
    id: "compliance-monitoring",
    title: "Compliance Monitoring",
    desc: "Stay compliant effortlessly — Novera continuously checks your contracts against the latest regulations, alerting you to risks before they become issues.",
  },
  {
    id: "collaboration-hub",
    title: "Collaboration Hub",
    desc: "Bring legal teams and stakeholders together in one secure space. Add comments, suggest edits, and approve documents with complete transparency and control.",
  },
  {
    id: "integrations",
    title: "Integrations",
    desc: "Connect Novera to your daily tools — from SignFlow to CalendarLink — to automate approvals, streamline document sharing, and reduce manual work.",
  }
];

const FeatureAccordionItem = ({ feature, isOpen, onToggle }) => {
  return (
    <div className="border-b border-black/10">
      <button
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
        onClick={onToggle}
      >
        <span className="text-lg font-bold font-serif group-hover:text-gray-600 transition-colors">{feature.title}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-6">
              <p className="text-gray-600 leading-relaxed mb-6">{feature.desc}</p>
              {/* Image Placeholder */}
              <div className="bg-white border border-black/5 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow aspect-[1.40625] flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4 text-gray-300">
                  <div className="w-32 h-20 border-2 border-dashed border-current rounded flex items-center justify-center">
                    <span className="text-2xl font-bold opacity-50">{feature.title[0]}</span>
                  </div>
                  <span className="font-mono text-xs uppercase tracking-widest">Interface Preview</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DeepDiveFeatures = () => {
  const [openId, setOpenId] = useState(FEATURE_SECTIONS[0].id);

  const handleToggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="detailed-features" className="bg-cream text-black py-20 lg:py-32">
      <div className="max-w-[900px] mx-auto px-6">
        <div className="text-center mb-12">
          <h3 className="font-serif text-4xl lg:text-5xl font-bold mb-4">Everything you need.</h3>
          <p className="text-gray-600 text-lg">From drafting to compliance, every step of your legal process is powered by precision.</p>
        </div>

        <div className="flex flex-col">
          {FEATURE_SECTIONS.map((feat) => (
            <FeatureAccordionItem
              key={feat.id}
              feature={feat}
              isOpen={openId === feat.id}
              onToggle={() => handleToggle(feat.id)}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="#" className="inline-block px-8 py-4 bg-lime text-black font-bold rounded-lg hover:bg-[#c2ef2e] transition-colors shadow-sm">
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
};

const TrustSafety = () => {
  return (
    <section id="trust-safety" className="py-32 bg-[#faefe8] text-black">
      <div className="max-w-[1248px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-20">
          <div className="lg:w-1/3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-white mb-6">
              <div className="w-2 h-2 rounded-full bg-lime"></div>
              <span className="text-sm font-medium">Trust & Safety</span>
            </div>
            <h2 className="font-serif text-4xl lg:text-5xl mb-6">Enterprise-grade protection for every contract.</h2>
            <p className="text-xl text-gray-600">Novera ensures your legal data remains private, encrypted, and compliant with international standards.</p>
            <div className="mt-8">
              <a href="#" className="inline-flex justify-center items-center px-6 py-3 bg-[#212121] text-white font-semibold rounded-md hover:bg-black transition-colors">
                Contact Novera
              </a>
            </div>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: SecurityIcon,
                title: "GDPR & ISO Compliance",
                desc: "Built to align with GDPR and ISO 27001 principles for reliable data privacy."
              },
              {
                icon: LockIcon,
                title: "End-to-End Encryption",
                desc: "All data is encrypted in transit and at rest to prevent unauthorized access."
              },
              {
                icon: UserCheckIcon,
                title: "Access Control & Audit Logs",
                desc: "Manage user roles and track activity with detailed audit logs."
              },
              {
                icon: GlobeIcon,
                title: "Regional Data Hosting",
                desc: "Choose EU or US hosting to match compliance and client needs."
              }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-white rounded-lg border border-black/5 hover:border-black/10 transition-colors">
                <item.icon className="w-8 h-8 mb-6 text-black" />
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturedTestimonial = () => {
  return (
    <section id="testimonials" className="py-32 bg-black text-white px-6">
      <div className="max-w-[1248px] mx-auto">
        <div className="bg-[#fffffc] text-black rounded-xl p-8 lg:p-16 mb-24 flex flex-col lg:flex-row gap-12 items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#141414] opacity-[0.03] pointer-events-none"></div>
          <div className="lg:w-1/2 relative w-full h-64 lg:h-auto min-h-[300px] bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
            <span className="text-gray-400 font-medium uppercase tracking-widest">Client Photo</span>
          </div>
          <div className="lg:w-1/2 relative z-10">
            <QuoteIcon className="w-10 h-10 text-lime mb-6" />
            <h3 className="font-serif text-2xl lg:text-3xl leading-tight mb-8">
              "The audit logs and AI-assisted reviews save us days every month. Novera sets a new standard for legal tech transparency."
            </h3>
            <div className="flex flex-col gap-1 border-t border-black/10 pt-6">
              <span className="font-bold text-lg">Amina Patel</span>
              <span className="text-gray-600">Head of Compliance, Finora Capital</span>
            </div>
          </div>
        </div>

        {/* More Testimonials Grid */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
            <div className="w-2 h-2 rounded-full bg-lime"></div>
            <span className="text-sm font-medium">What legal teams say</span>
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl">More words from legal teams who trust Novera.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "Novera has completely changed how our team handles contracts. What used to take hours is now done in minutes.",
              author: "Sarah Thompson",
              role: "Legal Counsel, Veridex Group"
            },
            {
              quote: "The accuracy of Novera’s AI analysis is outstanding. It consistently spots gaps and inconsistencies.",
              author: "Louis Morel",
              role: "Partner, Brevia & Co"
            },
            {
              quote: "We replaced three different tools with Novera. It’s fast, reliable, and built for teams who care about compliance.",
              author: "Daniel Ruiz",
              role: "Founder, LexEdge"
            }
          ].map((t, i) => (
            <div key={i} className="bg-[#faf6f0] text-black p-8 rounded-lg flex flex-col h-full border border-white/10">
              <div className="flex gap-1 mb-6 text-lime">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                ))}
              </div>
              <p className="flex-grow text-lg mb-8">"{t.quote}"</p>
              <div className="flex items-center gap-4 pt-6 border-t border-black/10">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                  {t.author.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{t.author}</span>
                  <span className="text-xs text-gray-600">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-black/10">
      <button
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-bold font-serif">{question}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-600 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection = () => {
  return (
    <section id="faq" className="py-32 bg-cream text-black">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-white mb-6">
            <div className="w-2 h-2 rounded-full bg-lime"></div>
            <span className="text-sm font-medium">FAQ</span>
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl mb-6">Everything you need to know.</h2>
          <p className="text-xl text-gray-600">Still can't find what you're looking for? Contact our support team.</p>
        </div>

        <div className="flex flex-col">
          <FAQItem
            question="What is Novera?"
            answer="Novera is an AI-powered legal platform that helps teams review, draft, and manage contracts with greater speed and accuracy."
          />
          <FAQItem
            question="Can Novera integrate with our existing tools?"
            answer="Yes, Novera connects with popular tools like SignFlow, CalendarLink, and major CRM platforms to streamline your workflow."
          />
          <FAQItem
            question="How secure is the platform?"
            answer="We use enterprise-grade encryption (AES-256), obtain regular ISO 27001 audits, and are fully GDPR compliant."
          />
          <FAQItem
            question="Does Novera require technical setup?"
            answer="No, Novera is cloud-based and requires no complex installation. You can get started immediately after signing up."
          />
          <FAQItem
            question="Who can use Novera?"
            answer="Novera is designed for legal teams, compliance officers, and business owners who want to handle contracts more efficiently."
          />
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="bg-cream py-16 px-6 border-t border-black/5">
      <div className="max-w-[800px] mx-auto text-center">
        <h2 className="font-serif text-3xl lg:text-4xl text-black mb-4">Ready to get started?</h2>
        <p className="text-lg text-gray-600 mb-8">Join legal teams using Novera to work smarter.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#" className="px-8 py-4 bg-lime text-black font-bold rounded-lg hover:bg-opacity-80 transition-colors">Try Novera</a>
          <a href="#" className="px-8 py-4 bg-[#212121] text-white font-bold rounded-lg hover:bg-black transition-colors">Book a demo</a>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-cream text-black py-20 px-6 border-t border-black/5">
      <div className="max-w-[1248px] mx-auto flex flex-col lg:flex-row justify-between gap-12 lg:gap-24">

        {/* Brand */}
        <div className="lg:w-1/3">
          <a href="#hero" className="flex items-center gap-2 mb-6">
            <Logo className="w-6 h-6 text-black" />
            <span className="font-brand font-semibold text-2xl tracking-tighter lowercase">novera</span>
          </a>
          <p className="text-gray-600 mb-8 max-w-sm">Novera helps modern legal teams work smarter with AI-driven contract intelligence.</p>
          <div className="flex gap-4 text-gray-400">
            {/* Social Icons Placeholder */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-10 bg-white rounded-md flex items-center justify-center cursor-pointer hover:text-black hover:scale-105 transition-all shadow-sm">
                <div className="w-5 h-5 bg-current rounded-full opacity-20"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="lg:w-2/3 flex flex-wrap gap-12 lg:gap-24">
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wide">Product</h4>
            <ul className="flex flex-col gap-3 text-gray-600">
              <li><a href="#" className="hover:text-black">Home</a></li>
              <li><a href="#pricing" className="hover:text-black">Pricing</a></li>
              <li><a href="#blog" className="hover:text-black">Blog</a></li>
              <li><a href="#updates" className="hover:text-black">Updates</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wide">Navigation</h4>
            <ul className="flex flex-col gap-3 text-gray-600">
              <li><a href="#about" className="hover:text-black">About</a></li>
              <li><a href="#careers" className="hover:text-black">Careers</a></li>
              <li><a href="#contact" className="hover:text-black">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wide">Legal</h4>
            <ul className="flex flex-col gap-3 text-gray-600">
              <li><a href="#" className="hover:text-black">Terms & conditions</a></li>
              <li><a href="#" className="hover:text-black">Privacy policy</a></li>
            </ul>
          </div>
        </div>

      </div>

      <div className="max-w-[1248px] mx-auto mt-20 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-center items-center gap-2 text-sm text-gray-500">
        <span>&copy; {new Date().getFullYear()} Novera. All rights reserved. Created by Arthur.</span>
      </div>
    </footer>
  );
};

const LandingPage = () => {
  return (
    <div className="w-full min-h-screen bg-black text-white font-sans selection:bg-lime selection:text-black">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <FeaturesOverview />
        <DeepDiveFeatures />
        <TrustSafety />
        <FeaturedTestimonial />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />

      {/* Sticky Badge Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 hidden md:block">
        <a
          href="#"
          className="bg-white text-black px-4 py-2 rounded-lg font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 text-sm border border-black/10"
        >
          Buy Template
        </a>
      </div>
    </div>
  );
};

export default LandingPage;