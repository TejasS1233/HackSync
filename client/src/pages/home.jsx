import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactLenis, useLenis } from 'lenis/react';
import Prism from '@/components/Prism';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiBeautifyIcon,
  SecurityIcon,
  SecurityLockIcon,
  Globe02Icon,
  UserCheck01Icon,
  QuoteUpIcon,
  ArrowDownBigIcon,
  Menu01Icon,
  SparklesIcon
} from '@hugeicons/core-free-icons';
import { 
  VisualCore, 
  VisualEmotion, 
  VisualVoice, 
  VisualMemory,
  FEATURE_VISUAL_MAP
} from '@/components/blocks/Home/feature-visuals';

const Navbar = () => (
  <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90vw] lg:w-auto lg:min-w-[60vw]">
    <div className="flex items-center justify-between px-8 py-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={AiBeautifyIcon} size={22} strokeWidth={1.5} className="text-white" />
        <span className="font-semibold text-white tracking-tight text-lg">mirage</span>
      </div>
      <div className="flex items-center gap-8">
        <Link to="/" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Home</Link>
        <Link to="/dashboard/chat" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Chat</Link>
      </div>
    </div>
  </nav>
);

const Hero = () => {
  const heroRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    tl.from('.hero-badge', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    })
      .from('.hero-title', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.3')
      .from('.hero-cta', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out'
      }, '-=0.4');
  }, { scope: heroRef });

  return (
    <section ref={heroRef} className="relative w-full h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 w-full h-full">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={2.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0.2}
          glow={1}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 mb-10 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
          <HugeiconsIcon icon={SparklesIcon} size={14} strokeWidth={1.5} className="text-white" />
          <span className="text-sm font-medium text-white">AI Avatar Platform</span>
        </div>

        <h1 className="hero-title font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.15] tracking-tight text-white mb-12 max-w-3xl">
          Lifelike AI avatars that<br />
          understand.
        </h1>

        <div className="flex flex-row gap-3 hero-cta">
          <Button asChild size="sm" className="rounded-full px-6 bg-white text-black hover:bg-white/90">
            <Link to="/dashboard/chat">Try Mirage</Link>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full px-6 border-white/30 text-white bg-transparent hover:bg-white/10">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};


const LOGOS = Array(5).fill(0).map((_, i) => (
  <div key={i} className="h-8 w-32 bg-secondary rounded flex items-center justify-center text-muted-foreground text-xs uppercase font-bold tracking-widest">
    Client {i + 1}
  </div>
));

const SocialProof = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from(containerRef.current.children, {
      opacity: 0,
      y: 20,
      duration: 1,
      stagger: 0.1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
      }
    });
  }, { scope: containerRef });

  return (
    <section id="social-proof" className="py-24 bg-background border-b border-border">
      <div ref={containerRef} className="max-w-[1248px] mx-auto px-6 text-center">
        <p className="text-muted-foreground mb-12 text-lg">Trusted by 100+ creators and teams</p>
        <div className="flex flex-wrap gap-12 justify-center items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {LOGOS}
        </div>
      </div>
    </section>
  );
};

const FeaturesOverview = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from(".feature-card", {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.2,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 70%",
      }
    });
  }, { scope: containerRef });

  return (
    <section id="features-overview" ref={containerRef} className="py-32 bg-background px-6">
      <div className="max-w-[1248px] mx-auto">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted mb-6">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-sm font-medium">Core Capabilities</span>
          </div>
          <h2 className="font-bold text-4xl lg:text-5xl mb-6">Smarter avatars for natural conversations.</h2>
          <p className="text-xl text-muted-foreground">Experience AI companions that understand context, emotion, and nuance — designed to feel genuinely human.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Emotion Recognition",
              desc: "Real-time sentiment analysis detects your mood and adapts responses with empathy and understanding.",
            },
            {
              title: "Natural Speech",
              desc: "Lifelike voice synthesis and lip-sync create seamless, human-like conversations.",
            },
            {
              title: "Contextual Memory",
              desc: "Avatars remember your preferences and past conversations for personalized interactions.",
            }
          ].map((feature, i) => (
            <div key={i} className="feature-card group cursor-pointer">
              <div className="overflow-hidden rounded-lg mb-4 h-80 border border-border bg-card relative">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-100">
                    {i === 0 && <VisualEmotion />}
                    {i === 1 && <VisualVoice />}
                    {i === 2 && <VisualMemory />}
                  </div>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors underline decoration-primary underline-offset-4 decoration-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FEATURE_SECTIONS = [
  {
    id: "emotion-detection",
    title: "Emotion Detection",
    desc: "Advanced sentiment analysis understands your emotional state in real-time, allowing avatars to respond with appropriate empathy and tone.",
  },
  {
    id: "voice-synthesis",
    title: "Voice Synthesis",
    desc: "Natural text-to-speech with multiple voice options and emotional inflection creates conversations that feel genuinely human.",
  },
  {
    id: "avatar-customization",
    title: "Avatar Customization",
    desc: "Create unique AI companions with customizable appearances, personalities, and conversation styles tailored to your preferences.",
  },
  {
    id: "analytics-dashboard",
    title: "Analytics Dashboard",
    desc: "Track conversation insights, sentiment trends, and engagement metrics to understand your interactions better.",
  },
  {
    id: "offline-mode",
    title: "Offline Mode",
    desc: "Continue conversations even without internet — Mirage works seamlessly offline with local AI processing.",
  }
];

const DeepDiveFeatures = () => {
  const [activeId, setActiveId] = useState(FEATURE_SECTIONS[0].id);
  const containerRef = useRef(null);

  useGSAP(() => {

    gsap.utils.toArray('.feature-wrapper').forEach((wrapper) => {
      const image = wrapper.querySelector('.feature-image');
      gsap.from(image, {
        x: 100,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top 85%",
          end: "center center",
          scrub: 1,
        }
      });
    });
  }, { scope: containerRef });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('ft-', '');
            setActiveId(id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -50% 0px',
        threshold: 0.1
      }
    );

    FEATURE_SECTIONS.forEach((section) => {
      const element = document.getElementById(`ft-${section.id}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(`ft-${id}`);
    if (element) {
      setActiveId(id);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section id="detailed-features" ref={containerRef} className="bg-muted text-foreground py-20 lg:py-32">
      <div className="max-w-[1248px] mx-auto px-6 flex flex-col lg:flex-row gap-12 lg:gap-24">


        <div className="hidden lg:flex flex-col w-1/3 h-fit sticky top-32 gap-4">
          <div className="mb-8">
            <h3 className="text-3xl font-bold mb-2">Everything you need.</h3>
            <p className="text-muted-foreground">From drafting to compliance, every step of your legal process is powered by precision.</p>
          </div>
          <div className="flex flex-col gap-2 border-l border-border">
            {FEATURE_SECTIONS.map((feat) => {
              const isActive = activeId === feat.id;
              return (
                <a
                  key={feat.id}
                  href={`#ft-${feat.id}`}
                  onClick={(e) => handleNavClick(e, feat.id)}
                  className={`pl-6 py-4 transition-all text-left group border-l-2 -ml-[1px] ${isActive
                    ? 'border-primary'
                    : 'border-transparent hover:border-border'
                    }`}
                >
                  <h4 className={`font-bold mb-1 text-lg transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {feat.title}
                  </h4>
                  <p className={`text-sm leading-relaxed transition-opacity duration-300 ${isActive ? 'opacity-100 text-muted-foreground' : 'opacity-0 h-0 overflow-hidden'}`}>
                    {feat.desc}
                  </p>
                </a>
              );
            })}
          </div>
          <Link to="/dashboard/chat" className="mt-8 px-6 py-3 bg-primary text-primary-foreground font-bold text-center rounded-lg hover:bg-primary/90 transition-colors shadow-sm w-fit">
            Get Started
          </Link>
        </div>


        <div className="w-full lg:w-2/3 flex flex-col gap-24 lg:gap-40">
          {FEATURE_SECTIONS.map((feat) => (
            <div key={feat.id} id={`ft-${feat.id}`} className="feature-wrapper scroll-mt-32 overflow-hidden py-4 px-1">

              <div className="lg:hidden mb-6">
                <h3 className="text-2xl font-bold mb-2">{feat.title}</h3>
                <p className="text-muted-foreground">{feat.desc}</p>
              </div>


              <div className="feature-image bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow aspect-[1.40625] flex items-center justify-center bg-muted/50 relative">
                 {(() => {
                    const VisualComponent = FEATURE_VISUAL_MAP[feat.id];
                    return VisualComponent ? <VisualComponent /> : null;
                 })()}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

const TrustSafety = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from(".trust-item", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 75%",
      }
    });
  }, { scope: containerRef });

  return (
    <section id="trust-safety" ref={containerRef} className="py-32 bg-background text-foreground">
      <div className="max-w-[1248px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-20">
          <div className="lg:w-1/3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card mb-6">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm font-medium">Trust & Safety</span>
            </div>
            <h2 className="font-bold text-4xl lg:text-5xl mb-6">Enterprise-grade protection for every conversation.</h2>
            <p className="text-xl text-muted-foreground">Mirage ensures your conversations remain private, encrypted, and secure with industry-leading standards.</p>
            <div className="mt-8">
              <Link to="/dashboard/chat" className="inline-flex justify-center items-center px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/80 transition-colors">
                Contact Mirage
              </Link>
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
                icon: SecurityLockIcon,
                title: "End-to-End Encryption",
                desc: "All data is encrypted in transit and at rest to prevent unauthorized access."
              },
              {
                icon: UserCheck01Icon,
                title: "Access Control & Audit Logs",
                desc: "Manage user roles and track activity with detailed audit logs."
              },
              {
                icon: Globe02Icon,
                title: "Regional Data Hosting",
                desc: "Choose EU or US hosting to match compliance and client needs."
              }
            ].map((item, i) => (
              <div key={i} className="trust-item p-8 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors">
                <HugeiconsIcon icon={item.icon} size={32} strokeWidth={1.5} className="mb-6 text-foreground" />
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturedTestimonial = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from(containerRef.current.children, {
      opacity: 0,
      y: 30,
      duration: 1,
      stagger: 0.2,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 75%",
      }
    });
  }, { scope: containerRef });

  return (
    <section id="testimonials" ref={containerRef} className="py-32 bg-muted text-foreground px-6">
      <div className="max-w-[1248px] mx-auto">
        <div className="bg-card text-foreground rounded-xl p-8 lg:p-16 mb-24 flex flex-col lg:flex-row gap-12 items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-background opacity-[0.03] pointer-events-none"></div>
          <div className="lg:w-1/2 relative w-full h-64 lg:h-auto min-h-[300px] bg-muted/50 rounded-lg overflow-hidden flex items-center justify-center">
            <span className="text-muted-foreground font-medium uppercase tracking-widest">Client Photo</span>
          </div>
          <div className="lg:w-1/2 relative z-10">
            <HugeiconsIcon icon={QuoteUpIcon} size={40} strokeWidth={1.5} className="text-primary mb-6" />
            <h3 className="font-bold text-2xl lg:text-3xl leading-tight mb-8">
              "Mirage's emotion detection is incredible. The avatar actually understands how I'm feeling and responds with genuine empathy."
            </h3>
            <div className="flex flex-col gap-1 border-t border-border pt-6">
              <span className="font-bold text-lg">Amina Patel</span>
              <span className="text-muted-foreground">Product Designer, Creative Labs</span>
            </div>
          </div>
        </div>


        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted mb-6">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-sm font-medium">What creators say</span>
          </div>
          <h2 className="font-bold text-4xl lg:text-5xl">More words from creators who trust Mirage.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "Mirage has completely changed how I interact with AI. The conversations feel natural and genuinely engaging.",
              author: "Sarah Thompson",
              role: "Content Creator"
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
            <div key={i} className="bg-card text-foreground p-8 rounded-lg flex flex-col h-full border border-border">
              <div className="flex gap-1 mb-6 text-primary">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                ))}
              </div>
              <p className="flex-grow text-lg mb-8">"{t.quote}"</p>
              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {t.author.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{t.author}</span>
                  <span className="text-xs text-muted-foreground">{t.role}</span>
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
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(contentRef.current, { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" });
    } else {
      gsap.to(contentRef.current, { height: 0, opacity: 0, duration: 0.3, ease: "power2.in" });
    }
  }, [isOpen]);

  return (
    <div className="border-b border-border">
      <button
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-bold">{question}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <HugeiconsIcon icon={ArrowDownBigIcon} size={20} strokeWidth={1.5} className="text-muted-foreground" />
        </span>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden h-0 opacity-0"
      >
        <p className="pb-6 text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const FAQSection = () => {
  return (
    <section id="faq" className="py-32 bg-background text-foreground">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card mb-6">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-sm font-medium">FAQ</span>
          </div>
          <h2 className="font-bold text-4xl lg:text-5xl mb-6">Everything you need to know.</h2>
          <p className="text-xl text-muted-foreground">Still can't find what you're looking for? Contact our support team.</p>
        </div>

        <div className="flex flex-col">
          <FAQItem
            question="What is Mirage?"
            answer="Mirage is an AI-powered avatar platform that creates lifelike companions capable of natural conversations with emotion recognition and real-time responses."
          />
          <FAQItem
            question="How does emotion detection work?"
            answer="Mirage uses advanced sentiment analysis to understand your emotional state from text, allowing avatars to respond with appropriate empathy and tone."
          />
          <FAQItem
            question="How secure is the platform?"
            answer="We use enterprise-grade encryption (AES-256), obtain regular ISO 27001 audits, and are fully GDPR compliant. Your conversations stay private."
          />
          <FAQItem
            question="Does Mirage work offline?"
            answer="Yes, Mirage supports offline mode with local AI processing, so you can continue conversations even without internet access."
          />
          <FAQItem
            question="Who can use Mirage?"
            answer="Mirage is designed for anyone seeking meaningful AI interactions — from creators and developers to businesses looking for innovative customer engagement."
          />
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from(".cta-content", {
      opacity: 0,
      y: 20,
      duration: 0.8,
      delay: 0.2,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
      }
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-background py-20 px-6 border-t border-border">
      <div className="cta-content max-w-[1200px] mx-auto bg-card rounded-2xl overflow-hidden flex flex-col lg:flex-row items-center border border-border shadow-sm p-12 lg:p-24">
        <div className="lg:w-1/2 flex flex-col justify-center text-left">
          <h2 className="font-bold text-4xl lg:text-5xl text-foreground mb-6">Step into the future, guided by AI clarity.</h2>
          <p className="text-xl text-muted-foreground mb-8">Join creators and teams using Mirage to build meaningful AI connections — with emotional intelligence and natural conversations.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/dashboard/chat" className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-opacity-80 transition-colors text-center">Try Mirage</Link>
            <Link to="/dashboard/home" className="px-8 py-4 bg-secondary text-secondary-foreground font-bold rounded-lg hover:bg-secondary/80 transition-colors text-center">Book a demo</Link>
          </div>
        </div>
        <div className="lg:w-1/2 w-full mt-12 lg:mt-0 lg:pl-12">
          <div className="aspect-square bg-muted/20 rounded-xl flex items-center justify-center text-muted-foreground overflow-hidden">
             <VisualCore className="scale-125" />
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-background text-foreground py-6 px-6 border-t border-border">
      <div className="max-w-[1248px] mx-auto flex justify-between items-center text-sm text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} Mirage. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
        </div>
      </div>
    </footer>
  );
};

const LandingPage = () => {
  useLenis(({ scroll }) => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    const lenisTicker = (time) => {
      ScrollTrigger.update();
    };
    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(lenisTicker);
    };
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      <div className="w-full min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
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
      </div>
    </ReactLenis>
  );
};

export default LandingPage;