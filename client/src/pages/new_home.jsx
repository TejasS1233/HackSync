import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactLenis, useLenis } from 'lenis/react';
import Prism from '@/components/Prism';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiBeautifyIcon,
  BrainIcon,
  Mic01Icon,
  BubbleChatIcon,
  SparklesIcon,
  ArrowRight01Icon,
  PlayIcon,
  StarIcon,
  Tick01Icon
} from '@hugeicons/core-free-icons';

gsap.registerPlugin(ScrollTrigger);

const Navbar = () => (
  <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90vw] lg:w-auto lg:min-w-[60vw]">
    <div className="flex items-center justify-between px-8 py-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={AiBeautifyIcon} size={22} strokeWidth={1.5} className="text-base-100" />
        <span className="font-semibold text-base-100 tracking-tight text-lg">mirage</span>
      </div>
      <div className="flex items-center gap-8">
        <Link to="/" className="text-sm font-medium text-base-200 hover:text-white transition-colors">Home</Link>
        <Link to="/chat" className="text-sm font-medium text-base-200 hover:text-white transition-colors">Chat</Link>
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
          <span className="text-sm font-medium text-white">New Background</span>
        </div>

        <h1 className="hero-title font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.15] tracking-tight text-white mb-12 max-w-3xl">
          A spectrum of colors that<br />
          <span className="font-sans font-bold">spark creativity</span>
        </h1>

        <div className="flex flex-row gap-3 hero-cta">
          <Button asChild size="sm" className="rounded-full px-6 bg-white text-black hover:bg-white/90">
            <Link to="/chat">Get Started</Link>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full px-6 border-white/30 text-white bg-transparent hover:bg-white/10">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from('.feature-card', {
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%'
      }
    });
  }, { scope: containerRef });

  const features = [
    {
      icon: BrainIcon,
      title: 'Emotion Recognition',
      description: 'Real-time sentiment analysis adapts responses to match your emotional state with empathy.',
      gradient: 'from-rose-500 to-orange-400'
    },
    {
      icon: Mic01Icon,
      title: 'Natural Voice',
      description: 'Lifelike speech synthesis with emotional inflection creates genuinely human conversations.',
      gradient: 'from-violet-500 to-fuchsia-400'
    },
    {
      icon: BubbleChatIcon,
      title: 'Contextual Memory',
      description: 'Avatars remember your preferences and past conversations for personalized experiences.',
      gradient: 'from-cyan-500 to-blue-400'
    }
  ];

  return (
    <section ref={containerRef} className="py-32 bg-base-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-950/20 via-transparent to-transparent" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-base-800 bg-base-900/80 mb-6">
            <HugeiconsIcon icon={SparklesIcon} size={16} strokeWidth={1.5} className="text-[#5227ff]" />
            <span className="text-sm font-medium text-base-300">Core Capabilities</span>
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl text-base-50 mb-6">
            Intelligence that understands you.
          </h2>
          <p className="text-xl text-base-400 max-w-2xl mx-auto">
            Beyond basic chat — experience AI companions designed to connect on a deeper level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="feature-card group relative p-8 rounded-2xl bg-base-900/60 border border-base-800/50 backdrop-blur-sm hover:border-primary-700/50 transition-all duration-500"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}>
                <HugeiconsIcon icon={feature.icon} size={28} strokeWidth={1.5} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-base-100 mb-3">{feature.title}</h3>
              <p className="text-base-400 leading-relaxed">{feature.description}</p>

              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-2xl bg-[#5227ff] opacity-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from('.step-item', {
      x: -30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.2,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 70%'
      }
    });
  }, { scope: containerRef });

  const steps = [
    { number: '01', title: 'Start a conversation', description: 'Jump right in — no complex setup. Just start chatting with your AI companion.' },
    { number: '02', title: 'Express yourself naturally', description: 'Speak freely. Our emotion detection understands context, tone, and sentiment.' },
    { number: '03', title: 'Experience genuine connection', description: 'Receive thoughtful, empathetic responses that adapt to how you feel.' }
  ];

  return (
    <section ref={containerRef} className="py-32 bg-base-900 border-y border-base-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-base-700 bg-base-800/80 mb-6">
              <span className="text-sm font-medium text-base-300">How It Works</span>
            </div>
            <h2 className="font-serif text-4xl lg:text-5xl text-base-50 mb-8">
              Three steps to meaningful AI interaction.
            </h2>

            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="step-item flex gap-6 group">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5227ff] to-[#7c5cff] flex items-center justify-center text-2xl font-bold text-white font-serif shadow-lg group-hover:scale-105 transition-transform">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-base-100 mb-2">{step.title}</h3>
                    <p className="text-base-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-3xl bg-base-800/50 border border-base-700/50 overflow-hidden flex items-center justify-center">
              <div className="text-base-600 flex flex-col items-center gap-4">
                <HugeiconsIcon icon={AiBeautifyIcon} size={80} strokeWidth={0.8} />
                <span className="text-sm uppercase tracking-widest font-medium">Interactive Demo</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl bg-gradient-to-br from-[#5227ff] to-[#7c5cff] opacity-20 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from('.testimonial-main', {
      scale: 0.95,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 70%'
      }
    });
    gsap.from('.testimonial-card', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.testimonial-grid',
        start: 'top 80%'
      }
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-32 bg-base-950">
      <div className="max-w-6xl mx-auto px-6">
        <div className="testimonial-main bg-gradient-to-br from-base-900 to-base-900/50 rounded-3xl p-10 lg:p-16 mb-16 border border-base-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-950/20 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="flex gap-1 mb-8">
              {[...Array(5)].map((_, j) => (
                <HugeiconsIcon key={j} icon={StarIcon} size={24} strokeWidth={1.5} className="text-[#5227ff] fill-[#5227ff]" />
              ))}
            </div>
            <blockquote className="font-serif text-2xl lg:text-4xl text-base-100 leading-snug mb-10">
              "Mirage completely changed how I think about AI. The emotional intelligence is remarkable — it genuinely feels like talking to someone who understands."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#5227ff] to-[#7c5cff] flex items-center justify-center text-white font-bold text-xl">
                S
              </div>
              <div>
                <div className="font-bold text-base-100">Sarah Chen</div>
                <div className="text-base-400">Product Designer at Vercel</div>
              </div>
            </div>
          </div>
        </div>

        <div className="testimonial-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { quote: "The emotion detection is incredible. It actually understands context.", author: "James M.", role: "Developer" },
            { quote: "Finally, AI that doesn't feel robotic. Highly recommended.", author: "Elena K.", role: "Content Creator" },
            { quote: "My go-to for brainstorming. The conversations flow naturally.", author: "Marcus T.", role: "Founder" }
          ].map((t, i) => (
            <div key={i} className="testimonial-card p-6 rounded-2xl bg-base-900/60 border border-base-800/50">
              <p className="text-base-300 mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-base-800 flex items-center justify-center text-sm font-bold text-base-400">
                  {t.author[0]}
                </div>
                <div>
                  <div className="font-medium text-base-200 text-sm">{t.author}</div>
                  <div className="text-base-500 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from('.cta-content', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%'
      }
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 bg-base-900 border-t border-base-800">
      <div className="max-w-4xl mx-auto px-6 text-center cta-content">
        <h2 className="font-serif text-4xl lg:text-6xl text-base-50 mb-6">
          Ready to experience the future?
        </h2>
        <p className="text-xl text-base-400 mb-10 max-w-2xl mx-auto">
          Join thousands of users having meaningful conversations with AI that truly understands.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/chat"
            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#5227ff] hover:bg-[#6b42ff] text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-[#5227ff]/30 text-lg"
          >
            <span>Get Started Free</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} strokeWidth={2} />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-base-800 hover:bg-base-700 text-base-100 font-bold rounded-xl border border-base-700 transition-all duration-300 text-lg"
          >
            <span>Sign In</span>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-base-400 text-sm">
          {['No credit card required', 'Free tier available', 'Cancel anytime'].map(item => (
            <div key={item} className="flex items-center gap-2">
              <HugeiconsIcon icon={Tick01Icon} size={16} strokeWidth={2} className="text-[#5227ff]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-8 bg-base-950 border-t border-base-800">
    <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-base-500 text-sm">
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={AiBeautifyIcon} size={20} strokeWidth={1.5} />
        <span className="font-semibold text-base-300">mirage</span>
      </div>
      <span>© {new Date().getFullYear()} Mirage. All rights reserved.</span>
      <div className="flex gap-6">
        <a href="#" className="hover:text-base-300 transition-colors">Privacy</a>
        <a href="#" className="hover:text-base-300 transition-colors">Terms</a>
      </div>
    </div>
  </footer>
);

const NewHomePage = () => {
  useLenis(({ scroll }) => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    const lenisTicker = () => {
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
      <div className="w-full min-h-screen bg-base-950 text-base-200 font-sans selection:bg-primary-500 selection:text-white">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
    </ReactLenis>
  );
};

export default NewHomePage;
