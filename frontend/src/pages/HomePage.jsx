/* Updated full code with non-clickable cards when `to` is undefined */

import React from 'react';
import { MapPin, ShieldHalf, Zap, Clock, Router, Target, ArrowRight, Activity, TrendingUp } from 'lucide-react';

// Color mapping for accent colors
const colorClasses = {
  red: {
    border: 'border-red-600 hover:border-red-500',
    shadow: 'hover:shadow-red-800/60',
    text: 'text-red-400',
    glow: 'via-red-500',
  },
  blue: {
    border: 'border-blue-600 hover:border-blue-500',
    shadow: 'hover:shadow-blue-800/60',
    text: 'text-blue-400',
    glow: 'via-blue-500',
  },
  amber: {
    border: 'border-amber-600 hover:border-amber-500',
    shadow: 'hover:shadow-amber-800/60',
    text: 'text-amber-400',
    glow: 'via-amber-500',
  },
  emerald: {
    border: 'border-emerald-600 hover:border-emerald-500',
    shadow: 'hover:shadow-emerald-800/60',
    text: 'text-emerald-400',
    glow: 'via-emerald-500',
  },
  violet: {
    border: 'border-violet-600 hover:border-violet-500',
    shadow: 'hover:shadow-violet-800/60',
    text: 'text-violet-400',
    glow: 'via-violet-500',
  },
  cyan: {
    border: 'border-cyan-600 hover:border-cyan-500',
    shadow: 'hover:shadow-cyan-800/60',
    text: 'text-cyan-400',
    glow: 'via-cyan-500',
  },
};

/* =============================================================
   UPDATED CardComponent (non-clickable when `to` is undefined)
   ============================================================= */

const CardComponent = React.forwardRef(
  ({ icon: Icon, title, description, accentColor, to, className }, ref) => {
    const colors = colorClasses[accentColor] || colorClasses.blue;
    const Wrapper = to ? 'a' : 'div'; // clickable only if `to` exists

    return (
      <Wrapper
        href={to || undefined}
        ref={ref}
        className={`
          group p-6 bg-gray-900/80 backdrop-blur-sm rounded-xl border-t border-l
          shadow-2xl shadow-black/80 transition-all duration-500
          ${colors.border} ${colors.shadow}
          cursor-pointer relative overflow-hidden block hover:bg-gray-800/90
          ${className}
        `}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/sprite@2x.png')] opacity-[0.02] mix-blend-overlay"></div>

        {/* Glow strip */}
        <span
          className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${colors.glow} to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
        ></span>

        {/* Header */}
        <div className="flex items-start space-x-4 mb-4 z-10 relative">
          <div className={`p-3 rounded-full bg-gray-800/50 border ${colors.border}`}>
            <Icon className={`w-6 h-6 ${colors.text} group-hover:text-white transition duration-300`} />
          </div>
          <h3 className="text-xl font-bold text-gray-50 pt-2">{title}</h3>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm z-10 relative mt-2">{description}</p>

        {/* Button visible only if card is clickable */}
        {to && (
          <div className="mt-6 flex justify-end z-10 relative">
            <span
              className={`${colors.text} group-hover:text-white flex items-center text-sm font-semibold transition duration-300 hover:underline`}
            >
              Access System{' '}
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        )}
      </Wrapper>
    );
  }
);

/* =============================================================
   Animated Card Wrapper
   ============================================================= */

const AnimatedCardFinal = ({ index, ...props }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const cardRef = React.useRef(null);

  React.useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const delay = index * 200;
          const timer = setTimeout(() => setIsVisible(true), delay);

          observer.unobserve(entry.target);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(cardRef.current);
    return () => cardRef.current && observer.unobserve(cardRef.current);
  }, [index]);

  return (
    <CardComponent
      {...props}
      ref={cardRef}
      className={`
        transition-all duration-[1200ms] ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        flex-shrink-0 w-72 sm:w-80 md:w-auto
      `}
    />
  );
};

/* =============================================================
   HomePage Component
   ============================================================= */

const HomePage = () => {
  const MockLink = ({ to, children, className }) => <a href={to} className={className}>{children}</a>;

  const features = [
    {
      icon: MapPin,
      title: 'Predictive Hotspots',
      description: 'Identify and visualize potential crime zones based on historical data, time of day, and environmental factors.',
      accentColor: 'red',
      to: '/hotspots',
    },
    {
      icon: Zap,
      title: 'Optimal Safety Routes',
      description: 'Generate navigation routes that prioritize safety metrics over speed or distance.',
      accentColor: 'blue',
      to: '/safe-route',
    },
    {
      icon: ShieldHalf,
      title: 'Real-time Safety Overlay',
      description: 'Receive geo-fenced safety alerts based on evolving threats.',
      accentColor: 'amber',
      to: '/dashboard',
    },
    {
      icon: TrendingUp,
      title: 'Temporal Risk Analysis',
      description: 'View how risk factors fluctuate in real-time.',
      accentColor: 'emerald',
      to: '/statistics',
    },
   
    {
      icon: Clock,
      title: 'Historical Data Audit',
      description: 'Access logs and historical trend reports.',
      accentColor: 'cyan',
      
    },
  ];

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>

      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-4 sm:p-8 relative overflow-x-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596701540306-ce687440b2f0?q=80&w=2070')", opacity: 0.08, filter: 'grayscale(100%) brightness(50%)' }}
        ></div>

        {/* Header */}
        <header className="text-center mb-16 relative z-20">
          <div className="flex justify-center items-center mb-4 animate-fadeInSlideUp">
            <Target className="w-12 h-12 text-red-500 mr-3 shadow-lg" />
            <h1 className="text-6xl sm:text-7xl font-extrabold uppercase">SafeNav</h1>
          </div>

          <p className="text-xl sm:text-3xl text-gray-300 mt-4 max-w-4xl mx-auto animate-fadeInSlideUp-delay-1">
            Centralized Intelligence: <span className="text-blue-400 font-semibold">AI-Powered</span> Hotspot Prediction & Secure Routing.
          </p>
        </header>

        {/* CTA buttons */}
        <section className="mt-8 mb-16 text-center max-w-xl mx-auto z-20">
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fadeInScale">
            <MockLink to="/hotspots" className="px-8 py-3 bg-red-600 rounded-xl text-white font-bold flex items-center justify-center">
              <MapPin className="w-5 h-5 mr-2" />Start Risk Mapping
            </MockLink>

            <MockLink to="/dashboard" className="px-8 py-3 bg-blue-600/10 border border-blue-600 rounded-xl text-blue-400 font-bold">
              <Router className="w-5 h-5 mr-2" />View Live Dashboard
            </MockLink>
          </div>
        </section>

        {/* Feature cards */}
        <div className="w-full max-w-7xl z-20 relative">
          <h2 className="text-3xl font-bold text-gray-100 mb-8 text-center md:text-left md:ml-4">System Capabilities</h2>

          <div className="flex overflow-x-scroll md:overflow-x-visible pb-4 px-2 space-x-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:space-x-0">
            {features.map((feature, index) => (
              <AnimatedCardFinal
                key={index}
                index={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                accentColor={feature.accentColor}
                to={feature.to}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-500 text-sm border-t border-gray-800 pt-6 w-full max-w-7xl z-20">
          © 2025 SafeNav. Protecting your journey.
        </footer>
      </div>
    </>
  );
};

export default HomePage;