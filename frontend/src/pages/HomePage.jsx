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

// Reusable component for the feature cards with enhanced styling
const Card = ({ icon: Icon, title, description, accentColor, to, className }) => {
  const colors = colorClasses[accentColor] || colorClasses.blue;
  
  return (
    <a
      href={to || '#'}
      className={`
        group p-6 bg-gray-900/80 backdrop-blur-sm rounded-xl border-t border-l 
        shadow-2xl shadow-black/80 transition-all duration-500 
        ${colors.border} ${colors.shadow} 
        cursor-pointer relative overflow-hidden block hover:bg-gray-800/90
        ${className}
      `}
    >
      {/* Subtle background pattern/overlay for tech look (kept this) */}
      <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/sprite@2x.png')] opacity-[0.02] mix-blend-overlay"></div>
      
      {/* Dynamic Top Glow Effect on Hover */}
      <span className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${colors.glow} to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></span>
      
      <div className="flex items-start space-x-4 mb-4 z-10 relative">
        <div className={`p-3 rounded-full bg-gray-800/50 border ${colors.border}`}>
            <Icon className={`w-6 h-6 ${colors.text} group-hover:text-white transition duration-300`} />
        </div>
        <h3 className="text-xl font-bold text-gray-50 pt-2">{title}</h3>
      </div>
      <p className="text-gray-400 text-sm z-10 relative mt-2">{description}</p>
      
      <div className="mt-6 flex justify-end z-10 relative">
        <span className={`${colors.text} group-hover:text-white flex items-center text-sm font-semibold transition duration-300 hover:underline`}>
          Access System <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </a>
  );
};

// Component for staggered lazy loading effect
const AnimatedCard = ({ index, ...props }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const cardRef = React.useRef(null); // Use a ref for robust observation

  React.useEffect(() => {
    // Check if the element is already mounted
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Staggered reveal: delay increases with index
          const delay = index * 200; // Increased base delay for slower staggering
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, delay);
          
          // Stop observing once visible
          observer.unobserve(entry.target);
          
          return () => clearTimeout(timer);
        }
      },
      {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1, // Trigger when 10% of the card is visible
      }
    );

    observer.observe(cardRef.current);

    return () => {
      // Cleanup observer on unmount
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [index]);

  return (
    <Card
      {...props}
      ref={cardRef} // Assign ref to the Card wrapper
      className={`
        transition-all duration-[1200ms] ease-out 
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        flex-shrink-0 w-72 sm:w-80 md:w-auto
      `}
    />
  );
};

// Mock the Card component to accept a ref
const CardWithRef = React.forwardRef((props, ref) => <Card {...props} className={props.className} ref={ref} />);
// Replace the original Card component usage in AnimatedCard's return
// NOTE: Since Card is a functional component, we need to adapt it to accept a ref via React.forwardRef

const AnimatedCardRef = ({ index, ...props }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const cardRef = React.useRef(null);

    React.useEffect(() => {
        if (!cardRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    const delay = index * 200; // Increased base delay
                    const timer = setTimeout(() => {
                        setIsVisible(true);
                    }, delay);
                    
                    observer.unobserve(entry.target);
                    return () => clearTimeout(timer);
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.1,
            }
        );

        observer.observe(cardRef.current);
        return () => {
            if (cardRef.current) {
                observer.unobserve(cardRef.current);
            }
        };
    }, [index]);

    return (
        <Card
            {...props}
            className={`
                transition-all duration-[1200ms] ease-out 
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
                flex-shrink-0 w-72 sm:w-80 md:w-auto
            `}
            ref={cardRef}
        />
    );
};

// To properly pass the ref from AnimatedCardRef to the DOM element in Card, 
// we must make 'Card' accept a ref via React.forwardRef
const CardComponent = React.forwardRef(({ icon: Icon, title, description, accentColor, to, className }, ref) => {
    const colors = colorClasses[accentColor] || colorClasses.blue;
    
    return (
        <a
            href={to || '#'}
            ref={ref} // Ref is attached here
            className={`
                group p-6 bg-gray-900/80 backdrop-blur-sm rounded-xl border-t border-l 
                shadow-2xl shadow-black/80 transition-all duration-500 
                ${colors.border} ${colors.shadow} 
                cursor-pointer relative overflow-hidden block hover:bg-gray-800/90
                ${className}
            `}
        >
            {/* ... (Card content remains the same) ... */}
             <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/sprite@2x.png')] opacity-[0.02] mix-blend-overlay"></div>
            <span className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${colors.glow} to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></span>
            <div className="flex items-start space-x-4 mb-4 z-10 relative">
                <div className={`p-3 rounded-full bg-gray-800/50 border ${colors.border}`}>
                    <Icon className={`w-6 h-6 ${colors.text} group-hover:text-white transition duration-300`} />
                </div>
                <h3 className="text-xl font-bold text-gray-50 pt-2">{title}</h3>
            </div>
            <p className="text-gray-400 text-sm z-10 relative mt-2">{description}</p>
            <div className="mt-6 flex justify-end z-10 relative">
                <span className={`${colors.text} group-hover:text-white flex items-center text-sm font-semibold transition duration-300 hover:underline`}>
                    Access System <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
            </div>
        </a>
    );
});


// Renaming the Card component to CardComponent and updating AnimatedCard to use it and pass the ref
const AnimatedCardFinal = ({ index, ...props }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const cardRef = React.useRef(null);

    React.useEffect(() => {
        if (!cardRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Increased stagger delay to 200ms
                    const delay = index * 200; 
                    const timer = setTimeout(() => {
                        setIsVisible(true);
                    }, delay);
                    
                    // Crucial: Stop observing once the element is visible
                    observer.unobserve(entry.target);
                    return () => clearTimeout(timer);
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.1,
            }
        );

        observer.observe(cardRef.current);
        return () => {
            if (cardRef.current) {
                observer.unobserve(cardRef.current);
            }
        };
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


const HomePage = () => {
  // Mock Link component for the single-file environment
  const MockLink = ({ to, children, className }) => <a href={to} className={className}>{children}</a>;

  const features = [
    {
      icon: MapPin,
      title: "Predictive Hotspots",
      description: "Identify and visualize potential crime zones based on historical data, time of day, and environmental factors. Stay informed of high-risk areas.",
      accentColor: "red",
      to: "/hotspots"
    },
    {
      icon: Zap,
      title: "Optimal Safety Routes",
      description: "Generate navigation routes that prioritize real-time safety metrics over speed or distance, guiding you away from predicted danger zones.",
      accentColor: "blue",
      to: "/safe-route"
    },
    {
      icon: ShieldHalf,
      title: "Real-time Safety Overlay",
      description: "Receive immediate, geo-fenced alerts regarding evolving threats or suspicious activity along your current path or planned destination.",
      accentColor: "amber",
      to: "/dashboard"
    },
    {
      icon: TrendingUp,
      title: "Temporal Risk Analysis",
      description: "View how risk factors fluctuate minute-by-minute across city sectors, allowing for informed scheduling and travel decisions.",
      accentColor: "emerald",
      to: "/statistics"
    },
    {
        icon: Activity,
        title: "Incident Reporting",
        description: "Submit real-time reports on local incidents and anomalies, feeding the predictive model with up-to-the-minute data.",
        accentColor: "violet",
        to: "/report"
    },
    {
        icon: Clock,
        title: "Historical Data Audit",
        description: "Access comprehensive historical data logs and trend reports to audit past incidents and validate model accuracy.",
        accentColor: "cyan",
        to: "/history"
    },
  ];

  return (
    // Load Tailwind for styling
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>{`
        /* Custom scrollbar styling for a cleaner look */
        .scrolling-container::-webkit-scrollbar {
          height: 6px;
        }
        .scrolling-container::-webkit-scrollbar-thumb {
          background: #374151; /* gray-700 */
          border-radius: 3px;
        }
        .scrolling-container::-webkit-scrollbar-track {
          background: #111827; /* gray-900 */
        }
        /* Hint shadow for horizontal scroll on mobile */
        .scrolling-hint::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 40px;
            pointer-events: none;
            background: linear-gradient(to left, rgba(6, 6, 6, 1) 0%, rgba(6, 6, 6, 0) 100%);
            z-index: 10;
        }
        @media (min-width: 768px) {
            .scrolling-hint::after {
                content: none;
            }
        }

        /* Keyframe animation for main title */
        @keyframes fadeInSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInSlideUp {
          animation: fadeInSlideUp 0.8s ease-out forwards;
        }

        .animate-fadeInSlideUp-delay-1 {
          animation: fadeInSlideUp 0.8s ease-out 0.3s forwards;
          opacity: 0; /* Initial state before animation */
        }

        .animate-fadeInSlideUp-delay-2 {
          animation: fadeInSlideUp 0.8s ease-out 0.6s forwards;
          opacity: 0; /* Initial state before animation */
        }

        /* Keyframe animation for button groups */
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.6s ease-out 0.9s forwards;
          opacity: 0; /* Initial state before animation */
        }

      `}</style>
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-4 sm:p-8 font-['Inter'] relative overflow-x-hidden">
        
        {/* === UPDATED BACKGROUND EFFECT: Map Overlay === */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1596701540306-ce687440b2f0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')", 
            opacity: 0.08, // Very low opacity for a subtle background
            filter: 'grayscale(100%) brightness(50%)' // Darken and desaturate the image
          }}
        ></div>
        
        {/* Modern Background Effect: Subtle animated radial gradient (Kept for dynamic color) */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-color-violet-900)_1%,_transparent_60%)] animate-pulse pointer-events-none"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-color-blue-900)_1%,_transparent_60%)] pointer-events-none"></div>
        {/* ============================================== */}

        {/* Header - Crime & Navigation Theme */}
        <header className="text-center mb-16 relative z-20">
          <div className="flex justify-center items-center mb-4 animate-fadeInSlideUp"> {/* Apply animation to the icon and h1 container */}
              <Target className="w-12 h-12 text-red-500 mr-3 shadow-lg shadow-red-500/50" />
              <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tighter uppercase">
                <span className="text-red-500 drop-shadow-lg"></span>SafeNav
              </h1>
          </div>
          <p className="text-xl sm:text-3xl text-gray-300 mt-4 font-extralight max-w-4xl mx-auto animate-fadeInSlideUp-delay-1"> {/* Apply animation with delay */}
            Centralized Intelligence: <span className="font-semibold text-blue-400">AI-Powered</span> Hotspot Prediction & Secure Route Planning.
          </p>
          <div className="w-1/4 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mt-6 rounded-full opacity-80 animate-fadeInSlideUp-delay-2"></div> {/* Apply animation with more delay */}
        </header>

        {/* Main Call to Action Section */}
        <section className="mt-8 mb-16 text-center max-w-xl mx-auto z-20">
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fadeInScale"> {/* Apply animation to button group */}
              <MockLink
                to="/hotspots"
                className="px-8 py-3 text-lg font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-500/50 transition duration-300 transform hover:scale-[1.03] flex items-center justify-center ring-4 ring-red-500/20"
              >
                <MapPin className="w-5 h-5 mr-2" /> Start Risk Mapping
              </MockLink>
              <MockLink
                to="/dashboard"
                className="px-8 py-3 text-lg font-bold rounded-xl bg-blue-600/10 border border-blue-600 text-blue-400 hover:bg-blue-600/30 transition duration-300 transform hover:scale-[1.03] flex items-center justify-center shadow-lg shadow-blue-500/20"
              >
                <Router className="w-5 h-5 mr-2" /> View Live Dashboard
              </MockLink>
            </div>
        </section>

        {/* Feature Grid Container with Scrollable Arrangement */}
        <div className="w-full max-w-7xl z-20 relative scrolling-hint">
            <h2 className="text-3xl font-bold text-gray-100 mb-8 tracking-wide text-center md:text-left md:ml-4 animate-fadeInSlideUp-delay-2"> {/* Apply animation with delay */}
                System Capabilities
            </h2>
          <div className="flex overflow-x-scroll scrolling-container pb-4 px-2 space-x-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:space-x-0">
            
            {/* Map the features array to use the AnimatedCardFinal component */}
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

        {/* Footer / Call to Action */}
        <footer className="mt-20 text-center text-gray-500 text-sm border-t border-gray-800/50 pt-6 w-full max-w-7xl z-20">
          &copy; 2025 SafeNav. Protecting your journey with intelligence and foresight.
        </footer>
      </div>
    </>
  );
};

export default HomePage;