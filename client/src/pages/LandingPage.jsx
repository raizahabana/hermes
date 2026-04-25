import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient.js';

const services = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
    title: 'Hermes Inbox',
    desc: 'AI-powered unified inbox across Facebook, Instagram, TikTok, Shopee, Lazada & more — reply at godspeed.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    title: 'Hermes CRM',
    desc: '360-degree customer profiles, lead scoring, pipeline management, and lifetime value tracking across all brands.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
    ),
    title: 'Hermes ERP',
    desc: 'Real-time stock management, automated reorder alerts, margin analysis, and multi-brand product catalog.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    ),
    title: 'Hermes Advance Analytics',
    desc: 'AI-powered revenue forecasting, cohort analysis, funnel metrics, cross-platform performance dashboards.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
    title: 'Hermes AI Chatbot',
    desc: 'Smart auto-replies in Taglish — trained on your brand voice, products, and FAQs. Live 24/7 across all platforms.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
    title: 'Hermes Social Ads',
    desc: 'Track ROAS, optimize ad creatives, and attribute revenue across Facebook, TikTok, and Shopee Ads.',
  },
];

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
const platforms = [{ id: 'google-meet', label: 'Google Meet' }];

function LandingPage() {
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '',
    service: '', platform: '', date: '', time: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (authSuccess || authError) {
      const timer = setTimeout(() => { setAuthSuccess(''); setAuthError(''); }, 8000);
      return () => clearTimeout(timer);
    }
  }, [authSuccess, authError]);

  const handleSignUp = async (formData) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailConfirmTo: false,
          data: { full_name: `${formData.firstName} ${formData.lastName}`, role: 'Admin' }
        }
      });
      if (authErr) throw authErr;
      const { data: profileData, error: profileError } = await supabase
        .from('profiles').select('*').eq('id', authData.user.id).single();
      if (profileError) throw new Error('Profile was not created. Please try signing in again.');
      console.log('Profile created:', profileData);
      setAuthSuccess('Account created successfully! You can now log in.');
    } catch (error) {
      setAuthError(error.message || 'Failed to create account');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignIn = async (formData) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email, password: formData.password,
      });
      if (error) throw error;
      const { data: userData, error: userError } = await supabase
        .from('profiles').select('role').eq('id', data.user.id).single();
      let userRole = 'Client';
      if (userError) {
        await supabase.from('profiles').insert({
          id: data.user.id, email: data.user.email,
          full_name: data.user.user_metadata?.full_name || '', role: 'Client'
        });
      } else if (userData?.role) {
        userRole = userData.role;
      }
      setAuthModal(null);
      navigate(userRole === 'Admin' ? '/AdminDashboard' : '/ClientDashboard');
    } catch (error) {
      setAuthError(error.message || 'Failed to sign in');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] text-white font-sans min-h-screen">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            Exponify<span className="text-amber-400">PH</span>
          </span>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8 list-none">
            <li><button onClick={() => scrollTo('services')} className="text-white/70 hover:text-white transition-colors text-sm">Services</button></li>
            <li><button onClick={() => scrollTo('about')} className="text-white/70 hover:text-white transition-colors text-sm">About</button></li>
            <li>
              <button onClick={() => scrollTo('booking')} className="bg-amber-400 text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-amber-300 transition-colors">
                Book a Demo
              </button>
            </li>
          </ul>

          {/* Auth buttons */}
          <ul className="hidden md:flex items-center gap-3 list-none">
            <li>
              <button onClick={() => setAuthModal('signin')} className="text-sm text-white/70 hover:text-white border border-white/20 px-4 py-2 rounded-full transition-colors">
                Sign In
              </button>
            </li>
            <li>
              <button onClick={() => setAuthModal('signup')} className="text-sm bg-white text-black font-semibold px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
                Sign Up
              </button>
            </li>
          </ul>

          {/* Mobile toggle */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className={`block w-6 h-0.5 bg-white transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#111] border-t border-white/10 px-6 py-4 flex flex-col gap-4">
            <button onClick={() => { scrollTo('services'); setMobileMenuOpen(false); }} className="text-left text-white/70 hover:text-white text-sm">Services</button>
            <button onClick={() => { scrollTo('about'); setMobileMenuOpen(false); }} className="text-left text-white/70 hover:text-white text-sm">About</button>
            <button onClick={() => { scrollTo('booking'); setMobileMenuOpen(false); }} className="text-left text-amber-400 font-semibold text-sm">Book a Demo</button>
            <div className="flex gap-3 pt-2 border-t border-white/10">
              <button onClick={() => { setAuthModal('signin'); setMobileMenuOpen(false); }} className="flex-1 text-sm border border-white/20 py-2 rounded-full text-white/70 hover:text-white">Sign In</button>
              <button onClick={() => { setAuthModal('signup'); setMobileMenuOpen(false); }} className="flex-1 text-sm bg-white text-black font-semibold py-2 rounded-full hover:bg-white/90">Sign Up</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-6">Premium Digital Services</p>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Elevate Your<br />
            <span className="text-amber-400">Business Online</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            We craft bespoke digital strategies that position your brand at the apex of your industry.
            Strategy. Design. Growth — delivered with precision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button onClick={() => scrollTo('booking')} className="bg-amber-400 text-black font-bold px-8 py-4 rounded-full hover:bg-amber-300 transition-colors text-sm">
              Schedule a Consultation
            </button>
            <button onClick={() => scrollTo('services')} className="border border-white/20 text-white px-8 py-4 rounded-full hover:bg-white/5 transition-colors text-sm">
              Explore Services
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            {[
              { num: '120+', label: 'Clients Served' },
              { num: '98%', label: 'Satisfaction Rate' },
              { num: '5+', label: 'Years of Excellence' },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-400">{stat.num}</div>
                  <div className="text-white/50 text-sm mt-1">{stat.label}</div>
                </div>
                {i < 2 && <div className="hidden sm:block w-px h-10 bg-white/20" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase text-center mb-4">What We Offer</p>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Digital Services <span className="text-amber-400">Designed for Growth</span>
          </h2>
          <p className="text-white/50 text-center max-w-2xl mx-auto mb-16 text-lg">
            From concept to conversion, our full-suite digital services give your business the competitive edge it deserves.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-amber-400/40 hover:bg-white/8 transition-all duration-300 group">
                <div className="w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center mb-4 text-amber-400 group-hover:bg-amber-400/20 transition-colors">
                  {s.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
                <div className="mt-4 h-px bg-gradient-to-r from-amber-400/40 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-4">About Exponify</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Where Strategy Meets <span className="text-amber-400">Excellence</span>
            </h2>
            <p className="text-white/60 mb-4 leading-relaxed">
              Exponify is a premier digital services firm based in the Philippines, serving businesses
              across industries who demand more than the ordinary. We don't just deliver services —
              we build lasting digital foundations.
            </p>
            <p className="text-white/60 mb-8 leading-relaxed">
              Our team of specialists combines creative vision with analytical rigor to produce
              outcomes that are not only beautiful but measurably effective. Every engagement begins
              with listening, and ends with results that speak for themselves.
            </p>
            <button onClick={() => scrollTo('booking')} className="bg-amber-400 text-black font-bold px-8 py-4 rounded-full hover:bg-amber-300 transition-colors text-sm">
              Work With Us
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { num: '01', title: 'Discovery', body: 'We audit your current presence and align on goals.' },
              { num: '02', title: 'Strategy', body: 'A tailored roadmap built for your specific market.' },
              { num: '03', title: 'Execution', body: 'Our experts deliver with precision and speed.' },
              { num: '04', title: 'Growth', body: 'Continuous optimization to scale your results.' },
            ].map((p) => (
              <div key={p.num} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-5 hover:border-amber-400/30 transition-colors">
                <span className="text-amber-400 font-bold text-lg min-w-[32px]">{p.num}</span>
                <div>
                  <h4 className="font-semibold mb-1">{p.title}</h4>
                  <p className="text-white/50 text-sm">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOKING ── */}
      <section id="booking" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase text-center mb-4">Get Started</p>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Book a <span className="text-amber-400">Demo</span>
          </h2>
          <p className="text-white/50 text-center mb-12 text-lg">
            Reserve your preferred date and time. We'll connect via your chosen platform and come fully prepared for a meaningful conversation.
          </p>

          {submitted ? (
            <div className="bg-white/5 border border-amber-400/30 rounded-2xl p-10 text-center">
              <div className="w-14 h-14 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Your Booking is Confirmed</h3>
              <p className="text-white/60">
                Thank you, <strong className="text-white">{form.name}</strong>. We'll send a calendar invite to{' '}
                <strong className="text-white">{form.email}</strong> shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { label: 'Full Name', name: 'name', placeholder: 'Juan dela Cruz', required: true },
                  { label: 'Company / Business', name: 'company', placeholder: 'Your Company, Inc.' },
                  { label: 'Email Address', name: 'email', placeholder: 'you@company.com', type: 'email', required: true },
                  { label: 'Phone Number', name: 'phone', placeholder: '+63 9XX XXX XXXX' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm text-white/70 mb-2">
                      {field.label} {field.required && <span className="text-amber-400">*</span>}
                    </label>
                    <input
                      type={field.type || 'text'}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400/60 transition-colors"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm text-white/70 mb-2">Preferred Date <span className="text-amber-400">*</span></label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/60 transition-colors [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">Preferred Time <span className="text-amber-400">*</span></label>
                  <select
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    required
                    className="w-full bg-[#1a1a1a] border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/60 transition-colors"
                  >
                    <option value="">Select a time</option>
                    {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm text-white/70 mb-2">Preferred Platform <span className="text-amber-400">*</span></label>
                  <div className="flex gap-3">
                    {platforms.map((p) => (
                      <label
                        key={p.id}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-sm transition-colors ${
                          form.platform === p.id
                            ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                            : 'border-white/15 text-white/60 hover:border-white/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="platform"
                          value={p.id}
                          checked={form.platform === p.id}
                          onChange={handleChange}
                          required
                          className="hidden"
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm text-white/70 mb-2">Message / Additional Details</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your business and what you'd like to achieve…"
                    rows={4}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400/60 transition-colors resize-none"
                  />
                </div>
              </div>

              <button type="submit" className="w-full mt-6 bg-amber-400 text-black font-bold py-4 rounded-xl hover:bg-amber-300 transition-colors text-sm">
                Confirm Booking
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xl font-bold">Exponify<span className="text-amber-400">PH</span></span>
            <p className="text-white/40 text-sm mt-1">Premium digital services for businesses that demand the best.</p>
          </div>
          <div className="flex gap-6">
            <button onClick={() => scrollTo('services')} className="text-white/50 hover:text-white text-sm transition-colors">Services</button>
            <button onClick={() => scrollTo('about')} className="text-white/50 hover:text-white text-sm transition-colors">About</button>
            <button onClick={() => scrollTo('booking')} className="text-white/50 hover:text-white text-sm transition-colors">Book a Demo</button>
          </div>
          <p className="text-white/30 text-sm">© {new Date().getFullYear()} ExponifyPH. All rights reserved.</p>
        </div>
      </footer>

      {/* ── AUTH MODAL ── */}
      {authModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setAuthModal(null)}
        >
          <div
            className="bg-[#111] border border-white/15 rounded-2xl p-8 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAuthModal(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-6">
              {authModal === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                {authError}
              </div>
            )}
            {authSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-xl mb-4">
                {authSuccess}
              </div>
            )}

            <form
              className="flex flex-col gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.target));
                if (authModal === 'signup') {
                  await handleSignUp({ firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password, phone: data.phone });
                } else {
                  await handleSignIn({ email: data.email, password: data.password });
                }
              }}
            >
              {authModal === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="firstName" placeholder="First Name" required
                    className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400/60 transition-colors" />
                  <input type="text" name="lastName" placeholder="Last Name" required
                    className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400/60 transition-colors" />
                </div>
              )}
              <input type="email" name="email" placeholder="Email" required
                className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400/60 transition-colors" />
              {authModal === 'signup' && (
                <input type="tel" name="phone" placeholder="+63 9123456789 (Optional)"
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400/60 transition-colors" />
              )}
              <input type="password" name="password" placeholder="Password" required
                className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400/60 transition-colors" />
              {authModal === 'signup' && (
                <input type="password" name="confirmPassword" placeholder="Confirm Password" required
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400/60 transition-colors" />
              )}
              <button type="submit" disabled={authLoading}
                className="mt-2 bg-amber-400 text-black font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors text-sm disabled:opacity-60">
                {authLoading ? 'Processing...' : authModal === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <p className="text-center text-white/40 text-sm mt-4">
              {authModal === 'signin' ? (
                <>Don't have an account?{' '}<span onClick={() => setAuthModal('signup')} className="text-amber-400 cursor-pointer hover:underline">Sign up</span></>
              ) : (
                <>Already have an account?{' '}<span onClick={() => setAuthModal('signin')} className="text-amber-400 cursor-pointer hover:underline">Sign in</span></>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;