import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import AOS from 'aos';
import 'aos/dist/aos.css';

// =========================================================================
// MAIN UNIFIED APPLICATION WITH DEDICATED SERVICE PAGES & INTAKE FORMS
// =========================================================================
export default function App() {
  // --- Theme Management States ---
  const [theme, setTheme] = useState('dark'); 
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const logoImageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Crect width="48" height="48" rx="12" fill="%23238636"/%3E%3Ctext x="50%" y="55%" font-size="26" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-weight="700"%3EP%3C/text%3E%3C/svg%3E';

  // --- Auth & System Loading States ---
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);

  // --- Sliding Hero Banner States (Main Page) ---
  const [currentHomeSlide, setCurrentHomeSlide] = useState(0);
  const [currentPromoSlide, setCurrentPromoSlide] = useState(0);
  const promoSlides = [
    {
      title: 'Welcome to Paz Thriving Tribe',
      text: 'Welcome — connecting families, strengthening minds, and building resilient communities.',
      image: "./logo/logomain.png",
      imageType: 'logo'
    },
    {
      title: 'Elevating Mindsets, Aligning Connections',
      text: 'We deploy structured frameworks engineered to guide couples, families, and high-potential youth toward systemic clarity and lasting emotional equilibrium.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200'
    },
    {
      title: 'Practical Family Frameworks',
      text: 'Actionable toolsets and coaching modules that rebuild daily rhythms, leading to sustained generational health.',
      image: 'https://images.unsplash.com/photo-1521790360361-1b5b3b8d4a5a?q=80&w=1200'
    },
    {
      title: 'Youth Mentorship Pathways',
      text: 'Focused mentorship programs designed to empower teenagers with confidence, resilience, and social-emotional tools.',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200'
    }
  ];
  const homeSlides = [
    {
      title: "Paz Thriving Tribe",
      subtitle: "A structured developmental network centered on strategic human development, relationship resolution, and youth mentorship.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200"
    },
    {
      title: "Rebuild Core Foundations",
      subtitle: "Engineering generational healing, structural communication channels, and premium community baseline frameworks.",
      image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=1200"
    },
    {
      title: "Empower Your Generation",
      subtitle: "Deploying intentional behavioral frameworks designed to bring mental clarity, resilience, and emotional stability.",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200"
    }
  ];

  // --- Core Content State (Restored Baseline Titles) ---
  const [services, setServices] = useState({
    family: {
      slug: "family",
      title: "Family Life Coaching",
      subtitle: "Family Strategists & Conflict Resolution",
      description: "Empowering families with behavioral strategies, open structural communication channels, and actionable toolsets to manage conflict and cultivate deep-rooted harmony.",
      metricCount: "120+ Families Assisted"
    },
    marriage: {
      slug: "marriage",
      title: "Marriage & Relationship Counseling",
      subtitle: "Professional Counselors & Clear Intake Assessments",
      description: "Providing premium guidance through structural alignment counseling sessions, detailed intake evaluations, and long-term milestone planning for couples.",
      metricCount: "450+ Couples Guided"
    },
    children: {
      slug: "children",
      title: "Children & Teenagers Coaching",
      subtitle: "Dedicated Mentors & Development Programs",
      description: "Guiding the next generation via one-on-one professional mentorship frameworks designed to build confidence, self-reliance, and cognitive emotional stability.",
      metricCount: "310+ Youth Mentored"
    }
  });

  // --- State for Founder's Suite Interactive Multi-Message ---
  const [founderActiveTab, setFounderActiveTab] = useState('speech');
  const founderTabsList = ['speech', 'about', 'values'];

  // --- State for Auto-Sliding Mission & Vision Statements ---
  const [activeStatementIndex, setActiveStatementIndex] = useState(0);
  const statements = [
    {
      type: "Our Mission Statement",
      heading: "Engineering Healthy Connections Across Generations",
      text: "To be a leading provider of professional life coaching that empowers children, teenagers, parents, and organizations to achieve lasting personal growth, deeper self-awareness, and unshakable resilience.",
      icon: "fa-solid fa-crosshairs"
    },
    {
      type: "Our Vision Statement",
      heading: "Setting the Global Standard for Systemic Family Health",
      text: "To provide professional life coaching services that fosterp ersonal growth, self-awareness, and resilience in children, teenagers, parents, and organizations.",
      icon: "fa-solid fa-wand-magic-sparkles"
    }
  ];

  // --- State for Auto-Sliding Social Media News Updates Screen ---
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const socialNewsFeed = [
    {
      platform: "Facebook",
      icon: "fa-brands fa-facebook",
      color: "#1877F2",
      badgeText: "Latest Community Article",
      title: "Rebuilding the Foundations of Family Communication",
      summary: "Read our latest exhaustive essay detailing how daily micro-habits and intentional structural conversations can break generational cycle barriers. Over 2.4k community shares this week.",
      timestamp: "Posted 4 hours ago",
      targetUrl: "https://facebook.com/paztribe"
    },
    {
      platform: "Instagram",
      icon: "fa-brands fa-instagram",
      color: "#E1306C",
      badgeText: "Media Spotlight & Reel",
      title: "Cognitive Tools for Modern Teenage Mentorship",
      summary: "Slide through our recent visual toolkit graphics outlining three actionable methods to guide teenagers through emotional volatility and self-reliance development milestones.",
      timestamp: "Posted 1 day ago",
      targetUrl: "https://instagram.com/paztribe"
    },
    {
      platform: "YouTube",
      icon: "fa-brands fa-youtube",
      color: "#FF0000",
      badgeText: "Featured Masterclass Broadcast",
      title: "Marriage Alignment Frameworks: Annual Summit Highlights",
      summary: "Watch the full 45-minute premium streaming segment breaking down advanced relationship intake assessments, milestone mapping, and interactive couple exercises.",
      timestamp: "Streamed 3 days ago",
      targetUrl: "https://youtube.com/paztribe"
    }
  ];

  // --- CMS Admin Form Inputs ---
  const [editTarget, setEditTarget] = useState('family');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMetric, setFormMetric] = useState('');
  const [cmsSuccessMessage, setCmsSuccessMessage] = useState(null);

  const emailInputRef = useRef(null);

  // --- Initialization Lifecycle Hook ---
  useEffect(() => {
    const faLink = document.createElement('link');
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(faLink);

    const savedTheme = localStorage.getItem('paz-tribe-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setShowThemeModal(true);
    }

    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out'
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoading(false);
      AOS.refresh();
    });

    fetchDynamicWebsiteContent();

    return () => {
      if (document.head.contains(faLink)) {
        document.head.removeChild(faLink);
      }
    };
  }, []);

  // --- Auto-Slide Interval Loops ---
  
  useEffect(() => {
    const homeBannerInterval = setInterval(() => {
      setCurrentHomeSlide((prev) => (prev + 1) % homeSlides.length);
    }, 6000);
    return () => clearInterval(homeBannerInterval);
  }, [homeSlides.length]);

  useEffect(() => {
    const promoInterval = setInterval(() => {
      setCurrentPromoSlide((s) => (s + 1) % promoSlides.length);
    }, 6000);
    return () => clearInterval(promoInterval);
  }, []);

  useEffect(() => {
    const founderInterval = setInterval(() => {
      setFounderActiveTab((currentTab) => {
        const currentIndex = founderTabsList.indexOf(currentTab);
        const nextIndex = (currentIndex + 1) % founderTabsList.length;
        return founderTabsList[nextIndex];
      });
    }, 6000);
    return () => clearInterval(founderInterval);
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveStatementIndex((prevIndex) => (prevIndex + 1) % statements.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [statements.length]);

  useEffect(() => {
    const newsInterval = setInterval(() => {
      setActiveNewsIndex((prevIndex) => (prevIndex + 1) % socialNewsFeed.length);
    }, 7000); 
    return () => clearInterval(newsInterval);
  }, [socialNewsFeed.length]);

  useEffect(() => {
    if (services[editTarget]) {
      setFormTitle(services[editTarget].title);
      setFormSubtitle(services[editTarget].subtitle);
      setFormDesc(services[editTarget].description);
      setFormMetric(services[editTarget].metricCount);
    }
  }, [editTarget, services]);

  const selectThemeMode = (chosenTheme) => {
    setTheme(chosenTheme);
    localStorage.setItem('paz-tribe-theme', chosenTheme);
    setShowThemeModal(false);
    setTimeout(() => AOS.refresh(), 100);
  };

  const toggleThemeModeSwitch = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('paz-tribe-theme', nextTheme);
  };

  const fetchDynamicWebsiteContent = async () => {
    try {
      const { data, error } = await supabase.from('tribe_services').select('*');
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedServices = { ...services };
        data.forEach(item => {
          if (formattedServices[item.slug]) {
            formattedServices[item.slug] = {
              slug: item.slug,
              title: item.title,
              subtitle: item.subtitle,
              description: item.description,
              metricCount: item.metric_count || formattedServices[item.slug].metricCount
            };
          }
        });
        setServices(formattedServices);
      }
    } catch (err) {
      console.log("Using baseline presentation values while tables initialize.");
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateContentCMS = async (e) => {
    e.preventDefault();
    setCmsSuccessMessage(null);

    setServices(prev => ({
      ...prev,
      [editTarget]: {
        ...prev[editTarget],
        title: formTitle,
        subtitle: formSubtitle,
        description: formDesc,
        metricCount: formMetric
      }
    }));

    try {
      const { error } = await supabase
        .from('tribe_services')
        .update({
          title: formTitle,
          subtitle: formSubtitle,
          description: formDesc,
          metric_count: formMetric
        })
        .eq('slug', editTarget);
      
      if (error) throw error;
      setCmsSuccessMessage("Ecosystem service menu content synchronized successfully live!");
    } catch (err) {
      setCmsSuccessMessage("Preview saved successfully to layout local view state!");
    }
  };

  if (loading && !session) {
    return (
      <div className="system-loading-splash">
        <div className="loading-spinner-element"></div>
        <h3 style={{fontFamily: 'system-ui', color: '#8b949e'}}>Loading Paz Tribe Ecosystem...</h3>
      </div>
    );
  }

  return (
    <Router>
      <style>{`
        :root {
          --bg-main: ${theme === 'dark' ? '#0d1117' : '#f6f8fa'};
          --bg-card: ${theme === 'dark' ? '#161b22' : '#ffffff'};
          --bg-nav: ${theme === 'dark' ? 'rgba(22, 27, 34, 0.85)' : 'rgba(255, 255, 255, 0.85)'};
          --bg-input: ${theme === 'dark' ? '#0d1117' : '#fafafa'};
          --border-color: ${theme === 'dark' ? '#30363d' : '#d0d7de'};
          --text-primary: ${theme === 'dark' ? '#f0f6fc' : '#24292f'};
          --text-muted: ${theme === 'dark' ? '#8b949e' : '#57606a'};
          --brand-green: #238636;
          --brand-green-hover: #2ea44f;
          --brand-blue: #58a6ff;
          --accent-green: #3fb950;
          --shadow-sm: 0 2px 8px rgba(0,0,0,${theme === 'dark' ? '0.2' : '0.06'});
          --shadow-lg: 0 12px 34px rgba(0,0,0,${theme === 'dark' ? '0.4' : '0.1'});
        }

        html, body, #root, .full-view-app-root-override {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 100% !important;
          box-sizing: border-box !important;
          background-color: var(--bg-main);
          color: var(--text-primary);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .full-view-app-root-override { padding-top: 72px; }

        body { overflow-x: hidden; }

        /* STICKY HEADER NAVIGATION BAR CONTROLS */
        .public-navbar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.2rem 4rem; background-color: var(--bg-nav); border-bottom: 1px solid var(--border-color);
          position: fixed; top: 0; left: 0; right: 0; z-index: 10000;
          box-shadow: var(--shadow-sm); width: 100% !important; box-sizing: border-box;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        }
        .nav-logo-brand-zone { display: flex; align-items: center; gap: 0.85rem; text-decoration: none; }
        .nav-logo-img { width: 52px; height: 52px; border-radius: 12px; object-fit: cover; background-color: transparent; border: none; }
        .platform-badge-nav.active { transform: translateY(-1px); font-weight: 800; }
        .nav-vector-logo { width: 36px; height: 36px; background-color: var(--brand-green); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; font-size: 1.2rem; }
        .nav-brand-name { font-size: 1.4rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.3px; }
        .nav-navigation-links { display: flex; gap: 1.5rem; align-items: center; }
        .nav-navigation-links.mobile-open { display: flex; position: fixed; top: 70px; left: 0; right: 0; width: 100vw; flex-direction: column; align-items: stretch; justify-content: flex-start; background-color: var(--bg-nav); padding: 1.5rem 1.5rem 2.5rem; border-top: 1px solid var(--border-color); z-index: 997; height: calc(100vh - 70px); overflow-y: auto; box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
        .nav-navigation-links.mobile-open .nav-link-item,
        .nav-navigation-links.mobile-open .nav-cta-btn { width: 100%; }
        .nav-navigation-links.mobile-open .nav-link-item { padding: 1rem 0; }
        .nav-link-item { color: var(--text-muted); text-decoration: none; font-size: 0.95rem; font-weight: 600; background: none; border: none; cursor: pointer; padding: 0.75rem 0; font-family: inherit; transition: color 0.2s ease; display: flex; align-items: center; gap: 0.4rem; }
        .nav-link-item:hover { color: var(--text-primary); }
        .nav-cta-btn { background-color: var(--brand-green); color: white; padding: 0.6rem 1.25rem; border: none; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .nav-cta-btn:hover { background-color: var(--brand-green-hover); }
        .nav-menu-toggle { display: none; background: none; border: none; color: var(--text-primary); font-size: 1.55rem; cursor: pointer; }

        /* Floating Controls UI Layer */
        .float-theme-toggle-container { position: fixed; bottom: 25px; left: 25px; z-index: 9999; }
        .theme-toggle-switch-shell {
          display: flex; align-items: center; gap: 0.6rem; cursor: pointer;
          background-color: var(--bg-card); border: 1px solid var(--border-color);
          padding: 0.75rem 1.2rem; border-radius: 30px; box-shadow: var(--shadow-lg);
        }
        .float-whatsapp-container { position: fixed; bottom: 25px; right: 25px; z-index: 9999; }
        .whatsapp-float-btn {
          display: flex; align-items: center; justify-content: center; background-color: #25D366; color: white; border: none;
          width: 56px; height: 56px; border-radius: 50%; box-shadow: 0 4px 16px rgba(37,211,102,0.4); cursor: pointer; text-decoration: none;
          animation: bounce-default 2s infinite ease-in-out;
        }
        @keyframes bounce-default { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

        /* Layout Framework Containers */
        .public-website-container { width: 100% !important; margin: 0; padding: 0; }
        
        /* SLIDING HERO SECTION FRAMEWORKS */
        .hero-section {
          position: relative;
          height: 100vh;
          min-height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100% !important;
          box-sizing: border-box;
          overflow: hidden;
          scroll-snap-align: start;
        }
        .hero-slide-bg {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-position: center;
          background-size: cover;
          transition: background-image 1s ease-in-out;
          z-index: 1;
        }
        .hero-slide-bg::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(rgba(13,17,23,${theme === 'dark' ? '0.85' : '0.45'}), rgba(13,17,23,${theme === 'dark' ? '0.98' : '0.75'}));
        }
        .hero-overlay {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 4rem 2rem;
          max-width: 1000px;
        }
        .hero-overlay h1 { font-size: 4.2rem; color: #f0f6fc; margin-bottom: 1rem; font-weight: 800; letter-spacing: -1px; animation: bannerTextFade 0.6s ease-out; }
        .hero-overlay p { font-size: 1.45rem; color: #c9d1d9; max-width: 900px; margin: 0 auto 2.5rem auto; line-height: 1.6; animation: bannerTextFade 0.8s ease-out; }
        @keyframes bannerTextFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        
        .hero-scroll-btn { background-color: var(--brand-green); color: white; padding: 1rem 2.5rem; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 1.05rem; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.6rem; }
        .hero-scroll-btn:hover { background-color: var(--brand-green-hover); }

        /* Promo slider (replaces synchronized-promo-banner) */
        .synchronized-promo-banner { width: 100% !important; padding: 2.5rem 4rem; box-sizing: border-box; }
        .banner-slider { position: relative; width: 100%; height: 380px; }
        .banner-slide { position: absolute; inset: 0; display: flex; gap: 4rem; align-items: center; padding: 2rem; box-sizing: border-box; opacity: 0; transform: translateX(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .banner-slide.active { opacity: 1; transform: translateX(0); }
        .banner-text-package { display: flex; flex-direction: column; gap: 1rem; width: 55%; max-width: 800px; }
        .banner-badge { align-self: flex-start; background-color: rgba(35, 134, 54, 0.15); color: var(--accent-green); padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 0.4rem; }
        .banner-text-package h2 { font-size: 2.4rem; font-weight: 800; color: var(--text-primary); margin: 0; line-height: 1.1; }
        .banner-text-package p { font-size: 1.05rem; line-height: 1.6; color: var(--text-muted); margin: 0; }
        .slide-graphic { width: 45%; height: 100%; border-radius: 12px; background-position: center; background-size: cover; box-shadow: var(--shadow-lg); border: 1px solid var(--border-color); }
        .banner-controls { position: absolute; right: 18px; bottom: 12px; display: flex; gap: 0.6rem; }
        .banner-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--border-color); cursor: pointer; border: none; }
        .banner-dot.active { background: var(--brand-green); width: 28px; border-radius: 5px; }

        /* INTENTIONAL DEDICATED REGISTRATION INTAKE SHIELDS */
        .intake-registration-section { width: 100% !important; background-color: var(--bg-card); border-bottom: 1px solid var(--border-color); padding: 6rem 4rem; box-sizing: border-box; }
        .intake-form-wrapper { max-width: 750px; margin: 0 auto; background-color: var(--bg-main); border: 1px solid var(--border-color); border-radius: 16px; padding: 4rem; box-shadow: var(--shadow-lg); }
        .intake-form-wrapper h3 { font-size: 2.2rem; font-weight: 800; margin: 0 0 0.5rem 0; color: var(--text-primary); letter-spacing: -0.5px; text-align: center; }
        .intake-form-wrapper p { font-size: 1.1rem; color: var(--text-muted); text-align: center; margin: 0 0 3rem 0; }
        .registration-fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.75rem; }
        @media (max-width: 768px) { .registration-fields-grid { grid-template-columns: 1fr; } }

        /* SERVICE VIEW SLIDING HERO BANNER SPECIFICS */
        .service-view-hero-banner { 
          position: relative;
          min-height: 420px; 
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%; 
          box-sizing: border-box; 
          overflow: hidden; 
        }
        .service-banner-bg {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-position: center;
          background-size: cover;
          transition: background-image 1s ease-in-out;
          z-index: 1;
        }
        .service-banner-bg::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(rgba(13,17,23,0.88), rgba(13,17,23,0.95));
        }
        .service-banner-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 2rem;
          max-width: 850px;
        }
        .service-view-hero-banner h1 { font-size: 3.5rem; font-weight: 800; color: #ffffff; margin: 0 0 1rem 0; letter-spacing: -1px; animation: bannerTextFade 0.6s ease-out; }
        .service-view-hero-banner p { font-size: 1.3rem; color: #c9d1d9; max-width: 800px; margin: 0 auto; line-height: 1.6; animation: bannerTextFade 0.8s ease-out; }
        
        .service-content-split-zone { padding: 6rem 4rem; display: grid; grid-template-columns: 1.5fr 1fr; gap: 4rem; width: 100%; box-sizing: border-box; }
        @media (max-width: 992px) { .service-content-split-zone { grid-template-columns: 1fr; padding: 4rem 1.5rem; } }
        
        .service-info-narrative-card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 3.5rem; box-shadow: var(--shadow-sm); }
        .service-info-narrative-card h2 { font-size: 2.2rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.5rem 0; }
        .service-info-narrative-card h4 { font-size: 1.25rem; color: var(--accent-green); margin: 0 0 2rem 0; font-weight: 600; }
        .service-info-narrative-card p { font-size: 1.2rem; line-height: 1.75; color: var(--text-muted); margin-bottom: 2.5rem; }
        
        .service-sidebar-news-stack { display: flex; flex-direction: column; gap: 2rem; }
        .topic-news-card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem; box-shadow: var(--shadow-sm); }
        .topic-news-card h5 { font-size: 1.1rem; font-weight: 700; color: var(--brand-blue); margin: 0 0 0.75rem 0; display: flex; align-items: center; gap: 0.5rem; }
        .topic-news-card h3 { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin: 0 0 1rem 0; }
        .topic-news-card p { font-size: 1rem; line-height: 1.6; color: var(--text-muted); margin: 0; }

        /* FOUNDER / CEO MULTI-MESSAGE INTERACTIVE EXECUTIVE SUITE */
        .founder-executive-suite {
          width: 100% !important; background-color: var(--bg-main); border-bottom: 1px solid var(--border-color);
          padding: 5rem 4rem; box-sizing: border-box; display: grid; grid-template-columns: 1fr 1.5fr; gap: 3rem; align-items: center; z-index: 3;
        }
        .founder-portrait-frame { width: 100%; height: 520px; border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-lg); border: 1px solid var(--border-color); position: relative; display: block; }
        .founder-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        @media (max-width: 768px) { .founder-portrait-frame { height: 400px; } }

        /* THEME SELECTION MODAL */
        .theme-modal-dimmed-overlay { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); z-index: 20000; }
        .theme-selection-card-frame { background: var(--bg-card); color: var(--text-primary); border-radius: 12px; padding: 2.25rem; width: 520px; max-width: calc(100% - 40px); box-shadow: 0 18px 50px rgba(0,0,0,0.45); border: 1px solid var(--border-color); }
        .theme-selection-card-frame h2 { margin: 0 0 0.5rem 0; }
        .theme-selection-card-frame p { margin: 0 0 1.25rem 0; color: var(--text-muted); }
        .theme-options-grid { display: flex; gap: 1rem; }
        .choice-option-tile { flex: 1; text-align: center; padding: 1rem 1.25rem; border-radius: 8px; cursor: pointer; border: 1px solid var(--border-color); background: var(--bg-main); transition: transform 0.12s ease, box-shadow 0.12s ease; }
        .choice-option-tile:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.25); }
        .founder-title-tag-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.85)); padding: 2rem 1.5rem 1.5rem 1.5rem; color: white; }
        .founder-title-tag-overlay h4 { margin: 0; font-size: 1.3rem; font-weight: 700; color: #ffffff; }
        .founder-title-tag-overlay span { font-size: 0.9rem; color: var(--brand-blue); font-weight: 600; }
        .founder-interactive-message-box { display: flex; flex-direction: column; gap: 2rem; }
        .founder-msg-nav-row { display: flex; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; flex-wrap: wrap; }
        .founder-nav-pill { background: none; border: none; font-family: inherit; color: var(--text-muted); font-size: 1rem; font-weight: 700; padding: 0.5rem 1rem; cursor: pointer; position: relative; transition: color 0.2s; display: flex; align-items: center; gap: 0.5rem; }
        .founder-nav-pill:hover { color: var(--text-primary); }
        .founder-nav-pill.active { color: var(--brand-green); }
        .founder-nav-pill.active::after { content: ''; position: absolute; bottom: -17px; left: 0; right: 0; height: 3px; background-color: var(--brand-green); border-radius: 2px; }
        
        .animated-message-viewspace { min-height: 250px; animation: messageSlideEffect 0.6s cubic-bezier(0.25, 1, 0.5, 1) both; }
        @keyframes messageSlideEffect { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        
        .speech-quote-text { font-size: 1.4rem; line-height: 1.7; color: var(--text-primary); font-style: italic; margin: 0 0 1.5rem 0; font-weight: 500; }
        .speech-signature { font-size: 1rem; color: var(--text-muted); font-weight: 600; }
        .about-org-block h3 { font-size: 1.8rem; margin: 0 0 1rem 0; color: var(--text-primary); font-weight: 800; }
        .about-org-block p { font-size: 1.15rem; line-height: 1.75; color: var(--text-muted); margin: 0; }
        .core-values-matrix { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .value-card-element { background-color: var(--bg-card); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: 8px; box-shadow: var(--shadow-sm); }
        .value-card-element h5 { margin: 0 0 0.4rem 0; font-size: 1.1rem; color: var(--accent-green); font-weight: 700; display: flex; align-items: center; gap: 0.5rem; }
        .value-card-element p { margin: 0; font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; }

        /* AUTOMATIC SLIDING MISSION & VISION MARQUEE PANEL Styles */
        .marquee-statements-section {
          width: 100% !important; background-color: var(--bg-card); border-bottom: 1px solid var(--border-color);
          padding: 6rem 4rem; box-sizing: border-box; overflow: hidden; text-align: center; position: relative;
        }
        .marquee-viewport-container { max-width: 950px; margin: 0 auto; position: relative; min-height: 220px; }
        .sliding-statement-card { animation: slideStatementIn 0.65s cubic-bezier(0.25, 1, 0.5, 1) both; }
        @keyframes slideStatementIn { 0% { opacity: 0; transform: translateX(50px); } 100% { opacity: 1; transform: translateX(0); } }
        .statement-pill-type { display: inline-flex; align-items: center; gap: 0.6rem; background-color: rgba(88,166,255,0.1); color: var(--brand-blue); padding: 0.4rem 1.2rem; border-radius: 30px; font-size: 0.9rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1.5rem; }
        .sliding-statement-card h3 { font-size: 2.4rem; font-weight: 800; color: var(--text-primary); margin: 0 0 1.2rem 0; letter-spacing: -0.5px; }
        .sliding-statement-card p { font-size: 1.3rem; line-height: 1.75; color: var(--text-muted); margin: 0; max-width: 850px; margin: 0 auto; }
        .slide-dots-indicator-track { display: flex; justify-content: center; gap: 0.75rem; margin-top: 3rem; }
        .indicator-dot { width: 10px; height: 10px; border-radius: 50%; background-color: var(--border-color); cursor: pointer; transition: all 0.3s ease; border: none; padding: 0; }
        .indicator-dot.active { background-color: var(--brand-green); width: 28px; border-radius: 5px; }

        /* EMBEDDED SOCIAL MEDIA NEWS AND UPDATES AUTOMATIC STREAM SCREEN */
        .social-news-stream-section {
          width: 100% !important; background-color: var(--bg-main); border-bottom: 1px solid var(--border-color);
          padding: 6rem 4rem; box-sizing: border-box;
        }
        .social-news-layout-wrapper { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 3rem; }
        .social-news-header-zone { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1.5rem; }
        .social-news-title-stack h2 { font-size: 2.6rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.5rem 0; letter-spacing: -0.5px; }
        .social-news-title-stack p { font-size: 1.15rem; color: var(--text-muted); margin: 0; }
        .social-platform-indicator-badges { display: flex; gap: 0.75rem; }
        .platform-badge-nav { background-color: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-muted); padding: 0.6rem 1.2rem; border-radius: 20px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 0.5rem; }
        .platform-badge-nav.active-facebook { border-color: #1877F2; color: #1877F2; background-color: rgba(24,119,242,0.08); }
        .platform-badge-nav.active-instagram { border-color: #E1306C; color: #E1306C; background-color: rgba(225,48,108,0.08); }
        .platform-badge-nav.active-youtube { border-color: #FF0000; color: #FF0000; background-color: rgba(255,0,0,0.08); }
        
        .social-news-broadcast-anchor-card {
          display: block; text-decoration: none; color: inherit; background-color: var(--bg-card);
          border: 1px solid var(--border-color); border-radius: 16px; padding: 4rem; box-shadow: var(--shadow-lg);
          cursor: pointer; position: relative; overflow: hidden; transition: border-color 0.3s ease, transform 0.2s ease;
        }
        .social-news-broadcast-anchor-card:hover { transform: translateY(-2px); }
        .social-slide-screen-viewport { animation: newsScreenFadeIn 0.7s cubic-bezier(0.25, 1, 0.5, 1) both; }
        @keyframes newsScreenFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        
        .broadcast-meta-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem; }
        .meta-platform-identity { display: flex; align-items: center; gap: 0.75rem; font-size: 1.2rem; font-weight: 800; }
        .meta-type-badge { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; padding: 0.35rem 0.85rem; border-radius: 6px; color: white; }
        .broadcast-content-body h3 { font-size: 2.2rem; font-weight: 800; color: var(--text-primary); margin: 0 0 1.25rem 0; line-height: 1.3; }
        .broadcast-content-body p { font-size: 1.25rem; line-height: 1.7; color: var(--text-muted); margin: 0 0 2rem 0; }
        .broadcast-action-footer { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 1.05rem; }
        .broadcast-action-footer i { transition: transform 0.2s; }
        .social-news-broadcast-anchor-card:hover .broadcast-action-footer i { transform: translateX(5px); }

        /* Specialty Grid Dashboard Links Layout Section */
        .interactive-tabs-section { padding: 7rem 4rem; width: 100% !important; box-sizing: border-box; }
        .section-title-heading { text-align: center; font-size: 2.8rem; color: var(--text-primary); margin-bottom: 0.5rem; font-weight: 800; letter-spacing: -0.5px; }
        .section-subtext { text-align: center; color: var(--text-muted); margin-bottom: 4rem; font-size: 1.2rem; }
        
        .services-routing-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; }
        @media (max-width: 992px) { .services-routing-grid { grid-template-columns: 1fr; } }
        
        .service-gateway-card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 3rem; display: flex; flex-direction: column; justify-content: space-between; box-shadow: var(--shadow-sm); transition: transform 0.2s, border-color 0.2s; text-decoration: none; color: inherit; }
        .service-gateway-card:hover { transform: translateY(-5px); border-color: var(--brand-green); }
        .gateway-icon-wrap { width: 50px; height: 50px; border-radius: 10px; background-color: rgba(35,134,54,0.12); color: var(--brand-green); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1.5rem; }
        .service-gateway-card h3 { font-size: 1.6rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.75rem 0; }
        .service-gateway-card p { font-size: 1.05rem; line-height: 1.6; color: var(--text-muted); margin: 0 0 2rem 0; flex-grow: 1; }
        .gateway-footer-action { font-weight: 700; color: var(--brand-green); display: flex; align-items: center; gap: 0.5rem; }

        /* Multi-Column Workspace Footer Layer */
        .workspace-fluid-footer { width: 100% !important; background-color: var(--bg-card); border-top: 1px solid var(--border-color); padding: 5rem 4rem 2.5rem 4rem; box-sizing: border-box; margin-top: 6rem; }
        .footer-columns-container { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 4rem; width: 100%; padding-bottom: 3.5rem; border-bottom: 1px solid var(--border-color); }
        .footer-brand-column { display: flex; flex-direction: column; gap: 1.2rem; }
        .footer-brand-logo-row { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
        .footer-vector-badge { width: 32px; height: 32px; background-color: var(--brand-green); color: white; font-weight: 800; display: flex; align-items: center; justify-content: center; border-radius: 6px; }
        .footer-brand-headline { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.3px; }
        .footer-brand-column p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin: 0; }
        .footer-links-column { display: flex; flex-direction: column; gap: 1.2rem; }
        .footer-links-column h4 { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin: 0; text-transform: uppercase; }
        .footer-interactive-links { display: flex; flex-direction: column; gap: 0.75rem; }
        .footer-nav-anchor { color: var(--text-muted); text-decoration: none; font-size: 0.95rem; font-weight: 500; background: none; border: none; text-align: left; padding: 0; cursor: pointer; font-family: inherit; }
        .footer-nav-anchor:hover { color: var(--text-primary); }
        .footer-bottom-copyright-strip { display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; width: 100%; }
        .footer-bottom-copyright-strip p { font-size: 0.9rem; color: var(--text-muted); margin: 0; }
        .footer-regulatory-tags { display: flex; gap: 1.5rem; }

        /* Secure Dashboard Context Panels */
        .portal-workspace-grid { display: grid; grid-template-columns: 300px 1fr; min-height: 100vh; background-color: var(--bg-main); width: 100% !important; }
        .portal-sidebar-panel { background-color: var(--bg-card); border-right: 1px solid var(--border-color); padding: 2.5rem 1.75rem; display: flex; flex-direction: column; }
        .portal-sidebar-title { font-size: 1.35rem; color: var(--text-primary); font-weight: 700; margin-bottom: 3rem; border-left: 4px solid var(--brand-green); padding-left: 0.6rem; }
        .portal-sidebar-links { display: flex; flex-direction: column; gap: 0.6rem; flex-grow: 1; }
        .sidebar-link-item { color: var(--text-muted); text-decoration: none; padding: 0.85rem 1.1rem; border-radius: 8px; font-size: 1rem; font-weight: 600; }
        .sidebar-link-item.active { background-color: var(--bg-input); color: var(--text-primary); font-weight: 700; border: 1px solid var(--border-color); }
        .sidebar-disconnect-btn { background-color: transparent; border: 1px solid #f85149; color: #f85149; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .portal-main-workspace { display: flex; flex-direction: column; width: 100%; }
        .portal-workspace-header { background-color: var(--bg-card); border-bottom: 1px solid var(--border-color); padding: 1.5rem 4rem; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; }
        .portal-workspace-body-content { padding: 3rem 4rem; width: 100%; box-sizing: border-box; }
        .dashboard-editor-card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 3.5rem; box-shadow: var(--shadow-sm); width: 100%; box-sizing: border-box; }
        .cms-creation-form-layout { display: flex; flex-direction: column; gap: 1.75rem; margin-top: 2.5rem; }
        .form-input-container { display: flex; flex-direction: column; gap: 0.6rem; }
        .plain-text-input { background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.85rem 1.1rem; border-radius: 8px; font-size: 1rem; width: 100%; box-sizing: border-box; }
        .form-submit-action-btn { background-color: var(--brand-green); color: white; padding: 0.9rem 2rem; border-radius: 6px; border: none; font-weight: 700; font-size: 1rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .form-submit-action-btn:hover { background-color: var(--brand-green-hover); }
        .status-feedback-banner { padding: 1.1rem; background-color: rgba(46,164,79,0.12); border: 1px solid var(--accent-green); color: var(--accent-green); border-radius: 8px; font-weight: 600; text-align: center; }
        
        .auth-page-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: var(--bg-main); width: 100% !important; }
        .login-card-layout { background-color: var(--bg-card); border: 1px solid var(--border-color); padding: 3rem 2.5rem; border-radius: 14px; width: 400px; box-shadow: var(--shadow-lg); }
        .login-brand-title { text-align: center; color: var(--text-primary); margin-bottom: 2.5rem; font-size: 1.75rem; font-weight: 800; }
        .standard-login-form { display: flex; flex-direction: column; gap: 1.5rem; }
        
        .system-loading-splash { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background-color: #0d1117; }
        .loading-spinner-element { width: 44px; height: 44px; border: 4px solid #30363d; border-top-color: #2ea44f; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 1.25rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        @media(max-width: 992px) {
          .nav-menu-toggle { display: block; }
          .nav-navigation-links { display: none; }
          .nav-navigation-links.mobile-open { display: flex; }
          .public-navbar { padding: 1rem 1.5rem; }
          .synchronized-promo-banner { grid-template-columns: 1fr; padding: 3rem 1.5rem; gap: 2.5rem; }
          .founder-executive-suite { grid-template-columns: 1fr; padding: 4rem 1.5rem; gap: 3rem; }
          .founder-portrait-frame { height: 400px; }
          .marquee-statements-section { padding: 4rem 1.5rem; }
          .social-news-stream-section { padding: 4rem 1.5rem; }
          .social-news-header-zone { flex-direction: column; align-items: flex-start; }
          .social-news-broadcast-anchor-card { padding: 2rem 1.5rem; }
          .broadcast-content-body h3 { font-size: 1.5rem; }
          .broadcast-content-body p { font-size: 1.05rem; }
          .sliding-statement-card h3 { font-size: 1.8rem; }
          .sliding-statement-card p { font-size: 1.1rem; }
          .banner-text-package h2 { font-size: 2.2rem; }
          .core-values-matrix { grid-template-columns: 1fr; }
          .footer-columns-container { grid-template-columns: 1fr; gap: 2.5rem; }
          .footer-bottom-copyright-strip { flex-direction: column; gap: 1.5rem; text-align: center; }
          .portal-workspace-grid { grid-template-columns: 1fr; }
          .portal-sidebar-panel { display: none; }
          .public-navbar { padding: 1rem 1.5rem; }
          .hero-section { height: 100vh; min-height: 420px; }
          .interactive-tabs-section { padding: 4rem 1.5rem; }
          .portal-workspace-body-content { padding: 2rem 1rem; }
          .intake-form-wrapper { padding: 2.5rem 1.5rem; }
        }
      `}</style>

      <div className="full-view-app-root-override">
        {/* THEME CONFIG MODAL */}
        {showThemeModal && (
          <div className="theme-modal-dimmed-overlay">
            <div className="theme-selection-card-frame">
              <h2>Welcome to Paz Tribe</h2>
              <p>Please select your baseline workspace layout profile configuration to customize your viewing experience context.</p>
              <div className="theme-options-grid">
                <div className="choice-option-tile" onClick={() => selectThemeMode('light')}>☀️ Light Mode</div>
                <div className="choice-option-tile" onClick={() => selectThemeMode('dark')}>🌙 Dark Mode</div>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING ACTION LAYERS */}
        <Routes>
          <Route path="/dashboard" element={null} />
          <Route path="*" element={
            <>
              {!showThemeModal && (
                <div className="float-theme-toggle-container">
                  <div className="theme-toggle-switch-shell" onClick={toggleThemeModeSwitch}>
                    <span style={{fontSize: '1.1rem'}}>{theme === 'dark' ? '☀️' : '🌙'}</span>
                    <span style={{fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)'}}>
                      {theme === 'dark' ? 'Light' : 'Dark'}
                    </span>
                  </div>
                </div>
              )}

              <div className="float-whatsapp-container">
                <a href="https://wa.me/2348123456789" target="_blank" rel="noopener noreferrer" className="whatsapp-float-btn">
                  <i className="fa-brands fa-whatsapp"></i>
                </a>
              </div>
            </>
          } />
        </Routes>

        {/* STICKY HEADER NAVIGATION BAR */}
        <header className="public-navbar">
          <Link to="/" className="nav-logo-brand-zone" onClick={() => { setNavOpen(false); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
            <img src= "../logo/logomain.png" alt="Paz Thriving Tribe logo" className="nav-logo-img" />
            <div className="nav-brand-name">Paz Thriving Tribe</div>
          </Link>
          <button className="nav-menu-toggle" onClick={() => setNavOpen((current) => !current)} aria-label="Toggle navigation menu">
            <i className={navOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'}></i>
          </button>
          <nav className={`nav-navigation-links ${navOpen ? 'mobile-open' : ''}`}>
            <Link to="/" className="nav-link-item" onClick={() => { setNavOpen(false); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
              <i className="fa-solid fa-house"></i> Home
            </Link>
            <Link to="/services/family" className="nav-link-item" onClick={() => setNavOpen(false)}>
              <i className="fa-solid fa-people-roof"></i> Family Life
            </Link>
            <Link to="/services/marriage" className="nav-link-item" onClick={() => setNavOpen(false)}>
              <i className="fa-solid fa-heart-crack"></i> Marriage
            </Link>
            <Link to="/services/children" className="nav-link-item" onClick={() => setNavOpen(false)}>
              <i className="fa-solid fa-child-reaching"></i> Teens & Kids
            </Link>
            {session ? (
              <Link to="/dashboard" className="nav-cta-btn" onClick={() => setNavOpen(false)}>
                <i className="fa-solid fa-gauge-high"></i> Portal Dashboard
              </Link>
            ) : (
              <Link to="/admin" className="nav-cta-btn" onClick={() => setNavOpen(false)}>
                <i className="fa-solid fa-right-to-bracket"></i> Portal
              </Link>
            )}
          </nav>
        </header>

        <Routes>
          {/* =========================================================================
             HOME ROUTE (WITH DYNAMIC SLIDING HERO BANNER)
             ========================================================================= */}
          <Route 
            path="/" 
            element={
              <div className="public-website-container">
                <section className="hero-section" data-aos="fade-down">
                  <div 
                    className="hero-slide-bg" 
                    style={{ backgroundImage: `url(${homeSlides[currentHomeSlide].image})` }}
                  />
                  <div className="hero-overlay" key={currentHomeSlide}>
                    <h1>{homeSlides[currentHomeSlide].title}</h1>
                    <p>{homeSlides[currentHomeSlide].subtitle}</p>
                    <button className="hero-scroll-btn" onClick={() => document.getElementById('services-explore').scrollIntoView({ behavior: 'smooth' })}>
                      Explore Specialty Tracks <i className="fa-solid fa-arrow-down"></i>
                    </button>
                  </div>
                </section>

                <section id="founder-suite" className="founder-executive-suite" data-aos="fade-up">
                  <div className="founder-portrait-frame" data-aos="fade-right">
                    <img src="../image/pic1.jpeg" className="founder-img" alt="Paz Tribe Founder and CEO" />
                    <div className="founder-title-tag-overlay">
                      <h4>Mrs. Iraoya Roseline</h4>
                      <span>Founder/Visionair of PTT</span>
                    </div>
                  </div>

                  <div className="founder-interactive-message-box" data-aos="fade-left">
                    <nav className="founder-msg-nav-row">
                      <button className={`founder-nav-pill ${founderActiveTab === 'speech' ? 'active' : ''}`} onClick={() => setFounderActiveTab('speech')}>
                        <i className="fa-solid fa-microphone"></i> From the Founder's Desk
                      </button>
                      <button className={`founder-nav-pill ${founderActiveTab === 'about' ? 'active' : ''}`} onClick={() => setFounderActiveTab('about')}>
                        <i className="fa-solid fa-building"></i> About the Organization
                      </button>
                      <button className={`founder-nav-pill ${founderActiveTab === 'values' ? 'active' : ''}`} onClick={() => setFounderActiveTab('values')}>
                        <i className="fa-solid fa-gem"></i> Core Values
                      </button>
                    </nav>

                    <div className="animated-message-viewspace" key={founderActiveTab}>
                      {founderActiveTab === 'speech' && (
                        <div className="speech-view-block">
                          <p className="speech-quote-text">
                            "The lead consultant at Paz Thriving Tribe Academy, a life coaching organization. A certified children's life coach and member of the Chartered Institute of Mentoring and Coaching in Nigeria."
                          </p>
                          <div className="speech-signature">— Executive Speech Address, Leader Council</div>
                        </div>
                      )}

                      {founderActiveTab === 'about' && (
                        <div className="about-org-block">
                          <h3>Building Resilient Human Infrastructure</h3>
                          <p>
                            At Paz Thriving Tribe, we understand that healthy individuals form aligned couples, and resilient couples build unbreakable generational households.
    Our signature programs are meticulously engineered to completely replace domestic exhaustion with systematic clarity and sustainable connection structures.
    Every family deserves a strategic blueprint. We provide the mentorship paths, emotional logic, and tools needed to thrive rather than just survive.
                          </p>
                        </div>
                      )}

                      {founderActiveTab === 'values' && (
                        <div className="core-values-matrix">
                          <div className="value-card-element">
                            <h5><i className="fa-solid fa-compass"></i> Intentional Alignment</h5>
                            <p>Every dynamic track strategy is calculated to cultivate structured harmony.</p>
                          </div>
                          <div className="value-card-element">
                            <h5><i className="fa-solid fa-brain"></i> Cognitive Stability</h5>
                            <p>Equipping youth and relationships with sustainable behavioral architectures.</p>
                          </div>
                          <div className="value-card-element">
                            <h5><i className="fa-solid fa-chart-simple"></i> Systemic Transparency</h5>
                            <p>Providing pristine operational support metrics across all organizational touchpoints.</p>
                          </div>
                          <div className="value-card-element">
                            <h5><i className="fa-solid fa-bolt"></i> Empowerment Frameworks</h5>
                            <p>Transforming complex conflict dynamics into foundational milestones.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="synchronized-promo-banner" data-aos="fade-up">
                  <div className="banner-slider">
                    {promoSlides.map((slide, idx) => (
                      <div key={idx} className={`banner-slide ${idx === currentPromoSlide ? 'active' : ''}`}>
                        <div className="banner-text-package">
                          <span className="banner-badge"><i className="fa-solid fa-bullseye" style={{ fontSize: '0.8rem' }}></i> Strategic Mission</span>
                          <h2>{slide.title}</h2>
                          <p>{slide.text}</p>
                        </div>
                        {slide.imageType === 'logo' ? (
                          <div className="slide-graphic" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
                            <img src={slide.image} alt={slide.title} style={{ width: 220, height: 220, objectFit: 'contain' }} />
                          </div>
                        ) : (
                          <div className="slide-graphic" style={{ backgroundImage: `url(${slide.image})` }} />
                        )}
                      </div>
                    ))}

                    <div className="banner-controls">
                      {promoSlides.map((_, i) => (
                        <button key={i} className={`banner-dot ${i === currentPromoSlide ? 'active' : ''}`} onClick={() => setCurrentPromoSlide(i)} aria-label={`Go to slide ${i+1}`} />
                      ))}
                    </div>
                  </div>
                </section>

                {/* Interactive Gateway Matrix */}
                <section id="services-explore" className="interactive-tabs-section">
                  <h2 className="section-title-heading" data-aos="fade-right">Ecosystem Specialty Menus</h2>
                  <p className="section-subtext">Click on any core module path below to access its deep-dive page layout view, customized banners, and dedicated forms.</p>

                  <div className="services-routing-grid" data-aos="fade-up">
                    <Link to="/services/family" className="service-gateway-card">
                      <div>
                        <div className="gateway-icon-wrap"><i className="fa-solid fa-people-roof"></i></div>
                        <h3>{services.family.title}</h3>
                        <p>{services.family.description}</p>
                      </div>
                      <div className="gateway-footer-action">Open Dedicated View <i className="fa-solid fa-arrow-trend-up"></i></div>
                    </Link>

                    <Link to="/services/marriage" className="service-gateway-card">
                      <div>
                        <div className="gateway-icon-wrap"><i className="fa-solid fa-heart-crack"></i></div>
                        <h3>{services.marriage.title}</h3>
                        <p>{services.marriage.description}</p>
                      </div>
                      <div className="gateway-footer-action">Open Dedicated View <i className="fa-solid fa-arrow-trend-up"></i></div>
                    </Link>

                    <Link to="/services/children" className="service-gateway-card">
                      <div>
                        <div className="gateway-icon-wrap"><i className="fa-solid fa-child-reaching"></i></div>
                        <h3>{services.children.title}</h3>
                        <p>{services.children.description}</p>
                      </div>
                      <div className="gateway-footer-action">Open Dedicated View <i className="fa-solid fa-arrow-trend-up"></i></div>
                    </Link>
                  </div>
                </section>

                <section id="social-updates" className="social-news-stream-section" data-aos="fade-up">
                  <div className="social-news-layout-wrapper">
                    <div className="social-news-header-zone">
                      <div className="social-news-title-stack">
                        <h2>Social Media Highlights</h2>
                        <p>Latest community posts from Facebook, Instagram, and YouTube with a live preview of our most recent update.</p>
                      </div>
                      <div className="social-platform-indicator-badges">
                        {socialNewsFeed.map((item, index) => (
                          <button
                            key={item.platform}
                            type="button"
                            className={`platform-badge-nav ${item.platform.toLowerCase() === 'facebook' ? 'active-facebook' : item.platform.toLowerCase() === 'instagram' ? 'active-instagram' : 'active-youtube'} ${index === activeNewsIndex ? 'active' : ''}`}
                            onClick={() => setActiveNewsIndex(index)}
                          >
                            <i className={item.icon}></i> {item.platform}
                          </button>
                        ))}
                      </div>
                    </div>

                    <a
                      href={socialNewsFeed[activeNewsIndex].targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-news-broadcast-anchor-card social-slide-screen-viewport"
                    >
                      <div className="broadcast-meta-row">
                        <div className="meta-platform-identity">
                          <i className={socialNewsFeed[activeNewsIndex].icon}></i>
                          <span>{socialNewsFeed[activeNewsIndex].platform}</span>
                        </div>
                        <span className="meta-type-badge" style={{ backgroundColor: socialNewsFeed[activeNewsIndex].color, color: '#ffffff' }}>
                          {socialNewsFeed[activeNewsIndex].badgeText}
                        </span>
                      </div>
                      <div className="broadcast-content-body">
                        <h3>{socialNewsFeed[activeNewsIndex].title}</h3>
                        <p>{socialNewsFeed[activeNewsIndex].summary}</p>
                      </div>
                      <div className="broadcast-action-footer">View Now <i className="fa-solid fa-arrow-right"></i></div>
                    </a>
                  </div>
                </section>

                <section id="mission-vision-marquee" className="marquee-statements-section" data-aos="fade-up">
                  <div className="marquee-viewport-container">
                    <div className="sliding-statement-card" key={activeStatementIndex}>
                      <div className="statement-pill-type">
                        <span><i className={statements[activeStatementIndex].icon}></i></span>
                        <span>{statements[activeStatementIndex].type}</span>
                      </div>
                      <h3>{statements[activeStatementIndex].heading}</h3>
                      <p>{statements[activeStatementIndex].text}</p>
                    </div>
                  </div>
                  <div className="slide-dots-indicator-track">
                    {statements.map((_, index) => (
                      <button key={index} className={`indicator-dot ${index === activeStatementIndex ? 'active' : ''}`} onClick={() => setActiveStatementIndex(index)} />
                    ))}
                  </div>
                </section>

                {/* REQUESTED GLOBAL NEW CLIENT REGISTRATION FORM */}
                <section className="intake-registration-section" data-aos="fade-up">
                  <div className="intake-form-wrapper">
                    <h3>Ecosystem Client Intake</h3>
                    <p>Register as a new client within our global framework to begin onboarding your personal track strategy.</p>
                    <HomeIntakeForm />
                  </div>
                </section>
              </div>
            } 
          />

          {/* =========================================================================
             DEDICATED ROUTE PATTERNS FOR INDIVIDUAL PAGE VIEWS
             ========================================================================= */}
          <Route path="/services/:serviceSlug" element={<ServicePageWrapper services={services} />} />

          {/* Administrative Gateway Login */}
          <Route 
            path="/admin" 
            element={
              !session ? (
                <div className="auth-page-wrapper">
                  <div className="login-card-layout" data-aos="fade-up">
                    <h2 className="login-brand-title">Admin Gateway</h2>
                    {authError && <div style={{color: '#f85149', marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: 'bold'}}>{authError}</div>}
                    
                    <form onSubmit={handleSignIn} className="standard-login-form">
                      <div className="form-input-container">
                        <label style={{fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600'}}>Admin Email Account</label>
                        <input ref={emailInputRef} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@paztribe.org" required className="plain-text-input" />
                      </div>
                      <div className="form-input-container">
                        <label style={{fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600'}}>Account Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="plain-text-input" />
                      </div>
                      <button type="submit" className="form-submit-action-btn">Verify Portal Credentials</button>
                    </form>
                  </div>
                </div>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />

          {/* Secure Management Console (CMS Dashboard) */}
          <Route 
            path="/dashboard" 
            element={
              session ? (
                <div className="portal-workspace-grid">
                  <aside className="portal-sidebar-panel">
                    <div className="portal-sidebar-title">Ecosystem Admin</div>
                    <nav className="portal-sidebar-links">
                      <Link to="/" className="sidebar-link-item" style={{textDecoration: 'none'}}>← Exit to Live Website</Link>
                      <div className="sidebar-link-item active">Core Studio Engine</div>
                    </nav>
                    <button onClick={handleSignOut} className="sidebar-disconnect-btn">Disconnect Console</button>
                  </aside>

                  <div className="portal-main-workspace">
                    <header className="portal-workspace-header">
                      <h2 style={{margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)'}}>Paz Tribe Dynamic Website CMS Engine</h2>
                      <div style={{background: 'var(--bg-main)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid var(--border-color)'}}>{session.user.email}</div>
                    </header>

                    <main className="portal-workspace-body-content">
                      <section className="dashboard-editor-card">
                        <h3 style={{margin: '0 0 0.5rem 0', color: 'var(--text-primary)'}}>Modify Core Specialty Menus Content</h3>
                        <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0}}>Select your menu configuration channel to synchronize text details onto deep pages dynamically.</p>

                        {cmsSuccessMessage && <div className="status-feedback-banner" style={{marginTop: '1.5rem'}}>{cmsSuccessMessage}</div>}

                        <form onSubmit={handleUpdateContentCMS} className="cms-creation-form-layout">
                          <div className="form-input-container">
                            <label style={{ color: 'var(--brand-blue)', fontWeight: '600' }}>Select Targeted Menu Category to Update</label>
                            <select value={editTarget} onChange={(e) => setEditTarget(e.target.value)} className="plain-text-input" style={{ height: '46px', border: '1px solid var(--brand-blue)' }}>
                              <option value="family">Family Life Coaching</option>
                              <option value="marriage">Marriage & Relationship Counseling</option>
                              <option value="children">Children & Teenagers Coaching</option>
                            </select>
                          </div>

                          <div className="form-input-container">
                            <label style={{fontWeight: '600'}}>Display Heading Title</label>
                            <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="plain-text-input" required />
                          </div>

                          <div className="form-input-container">
                            <label style={{fontWeight: '600'}}>Subtitle & Specialist Roles</label>
                            <input type="text" value={formSubtitle} onChange={(e) => setFormSubtitle(e.target.value)} className="plain-text-input" required />
                          </div>

                          <div className="form-input-container">
                            <label style={{fontWeight: '600'}}>Impact Score / Metric Total Text</label>
                            <input type="text" value={formMetric} onChange={(e) => setFormMetric(e.target.value)} className="plain-text-input" required />
                          </div>

                          <div className="form-input-container">
                            <label style={{fontWeight: '600'}}>Detailed Menu Context Description</label>
                            <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows="5" className="plain-text-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} required></textarea>
                          </div>

                          <button type="submit" className="form-submit-action-btn" style={{ maxWidth: '250px' }}>Publish Dynamic Update</button>
                        </form>
                      </section>
                    </main>
                  </div>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Multi-Column Footer Component */}
        <footer className="workspace-fluid-footer">
          <div className="footer-columns-container">
            <div className="footer-brand-column">
              <Link to="/" className="footer-brand-logo-row" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <div className="footer-vector-badge" img src="./logo/logomain.png" alt="" ></div>
                <span className="footer-brand-headline">Paz Thriving Tribe</span>
              </Link>
              <p>Providing dynamic infrastructure tracking networks focused on alignment strategies, professional conflict mitigation solutions, and youth development counseling models.</p>
            </div>
            
            <div className="footer-links-column">
              <h4>Ecosystem Tracks</h4>
              <div className="footer-interactive-links">
                <Link to="/services/family" className="footer-nav-anchor">Family Life Coaching</Link>
                <Link to="/services/marriage" className="footer-nav-anchor">Marriage & Couples</Link>
                <Link to="/services/children" className="footer-nav-anchor">Children & Teenagers</Link>
              </div>
            </div>

            <div className="footer-links-column">
              <h4>Portals</h4>
              <div className="footer-interactive-links">
                <Link to="/admin" className="footer-nav-anchor">Main Portal</Link>
              </div>
            </div>

            <div className="footer-links-column">
              <h4>Inquiries</h4>
              <div className="footer-interactive-links">
                <span style={{fontSize: '0.95rem', color: 'var(--text-muted)'}}><i className="fa-solid fa-location-dot" style={{ marginRight: '5px' }}></i> Lagos Main Campus, Nigeria</span>
                <span style={{fontSize: '0.95rem', color: 'var(--text-muted)'}}><i className="fa-solid fa-envelope" style={{ marginRight: '5px' }}></i> support@paztribe.org</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom-copyright-strip">
            <p>&copy; 2026 Paz Thriving Tribe. Unified Content Infrastructure Management.</p>
            <div className="footer-regulatory-tags">
              <span style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Privacy Framework</span>
              <span style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>System Terms</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

// =========================================================================
// SERVICE ROUTE VIEWS CONTROLLER (WITH INNER TOPIC SLIDER BANNER)
// =========================================================================
function ServicePageWrapper({ services }) {
  const { serviceSlug } = useParams();
  const [success, setSuccess] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const activeService = services[serviceSlug];

  // Specific image portfolios for sub-page banners to loop through dynamically
  const subPageBannerPortfolios = {
    family: [
      "https://images.unsplash.com/photo-1542037104857-ffbe0ba8309e?q=80&w=1200",
      "https://images.unsplash.com/photo-1609234656388-0ff363383899?q=80&w=1200",
      "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?q=80&w=1200"
    ],
    marriage: [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1200",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200",
      "https://images.unsplash.com/photo-1621478378722-43c34346ef26?q=80&w=1200"
    ],
    children: [
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1200",
      "https://images.unsplash.com/photo-1484662021356-799479afd455?q=80&w=1200",
      "https://images.unsplash.com/photo-1471286174243-e7a4d9afb34a?q=80&w=1200"
    ]
  }[serviceSlug] || [];

  useEffect(() => {
    window.scrollTo(0, 0);
    AOS.refresh();
    setActiveSlideIndex(0); // Reset when category changes
  }, [serviceSlug]);

  // Handle automatic cycling of the service page banner gallery
  useEffect(() => {
    if (subPageBannerPortfolios.length === 0) return;
    const serviceBannerInterval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % subPageBannerPortfolios.length);
    }, 5500);
    return () => clearInterval(serviceBannerInterval);
  }, [subPageBannerPortfolios]);

  if (!activeService) {
    return <Navigate to="/" replace />;
  }

  const subPageMeta = {
    family: {
      newsTitle: "Family Dynamics Dispatch",
      newsText: "New behavioral guide published: 'Navigating Cross-Generational Boundaries inside the Modern Household Structure'.",
      formSub: "Schedule Family Strategy Intake Consultation Session"
    },
    marriage: {
      newsTitle: "Marriage Foundation Brief",
      newsText: "Upcoming Interactive Couple Milestone Alignment Summit schedule confirmed for next quarter layout cycles.",
      formSub: "Initiate Private Couple Alignment Relationship Intake"
    },
    children: {
      newsTitle: "Youth Mentorship Monitor",
      newsText: "Cognitive stability milestone tracking update released for one-on-one adolescent mentorship program platforms.",
      formSub: "Enroll Child / Teenager into Cognitive Mentorship Framework"
    }
  }[serviceSlug];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
  };

  return (
    <div className="public-website-container">
      {/* DYNAMIC SLIDING TOPIC BANNER */}
      <section className="service-view-hero-banner">
        <div 
          className="service-banner-bg" 
          style={{ backgroundImage: `url(${subPageBannerPortfolios[activeSlideIndex]})` }}
        />
        <div className="service-banner-content" key={activeSlideIndex}>
          <h1 data-aos="zoom-in">{activeService.title}</h1>
          <p data-aos="fade-up" data-aos-delay="100">{activeService.subtitle} — Option Frame {activeSlideIndex + 1}</p>
        </div>
      </section>

      <div className="service-content-split-zone">
        {/* Main Side Narrative Description */}
        <div className="service-info-narrative-card" data-aos="fade-right">
          <h2>Strategic Strategy Framework</h2>
          <h4>Operational Scope Index: {activeService.metricCount}</h4>
          <p>{activeService.description}</p>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem', marginTop: '2.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: '800' }}>Intake Form Session Request</h3>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>{subPageMeta.formSub}</p>
            
            {success ? (
              <div className="status-feedback-banner"><i className="fa-solid fa-circle-check"></i> Intake requested successfully. Our specialist counselors will reach out to you within 24 hours.</div>
            ) : (
              <form onSubmit={handleFormSubmit} className="cms-creation-form-layout" style={{ marginTop: 0 }}>
                <div className="registration-fields-grid">
                  <div className="form-input-container">
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Full Name</label>
                    <input type="text" required placeholder="John Doe" className="plain-text-input" />
                  </div>
                  <div className="form-input-container">
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Email Address</label>
                    <input type="email" required placeholder="johndoe@example.com" className="plain-text-input" />
                  </div>
                </div>
                <div className="form-input-container">
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Specific Primary Concern Context / Program Interest</label>
                  <textarea rows="4" required placeholder="Provide brief summary details..." className="plain-text-input" style={{ resize: 'vertical' }}></textarea>
                </div>
                <button type="submit" className="form-submit-action-btn" style={{ maxWidth: '280px' }}><i className="fa-solid fa-paper-plane"></i> Submit Intake Request</button>
              </form>
            )}
          </div>
        </div>

        {/* Dedicated News Column Sidebar */}
        <div className="service-sidebar-news-stack" data-aos="fade-left">
          <div style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '1px' }}>Topic Channel Feed</div>
          
          <div className="topic-news-card">
            <h5><i className="fa-solid fa-hashtag"></i> {subPageMeta.newsTitle}</h5>
            <h3>Latest Dynamic Update</h3>
            <p>{subPageMeta.newsText}</p>
            <div style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Updated just now</div>
          </div>

          <div className="topic-news-card" style={{ opacity: 0.85 }}>
            <h5><i className="fa-solid fa-bullhorn"></i> Broadcast Channel</h5>
            <h3>Strategic Ecosystem Alignments</h3>
            <p>Our baseline structural metrics have shifted forward to support scalable remote dashboard digital sessions starting this week.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// HOMEPAGE CLIENT REGISTRATION INTAKE COMPONENT
// =========================================================================
function HomeIntakeForm() {
  const [submitted, setSubmitted] = useState(false);
  
  const submitForm = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="status-feedback-banner">
        <i className="fa-solid fa-circle-check"></i> Registration transmitted into core dashboard hub! Our alignment mentors will follow up with your email account coordinates immediately.
      </div>
    );
  }

  return (
    <form onSubmit={submitForm} className="cms-creation-form-layout" style={{ marginTop: 0 }}>
      <div className="registration-fields-grid">
        <div className="form-input-container">
          <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Your Full Name</label>
          <input type="text" required placeholder="Enter name" className="plain-text-input" />
        </div>
        <div className="form-input-container">
          <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Contact Email Address</label>
          <input type="email" required placeholder="name@domain.com" className="plain-text-input" />
        </div>
      </div>

      <div className="registration-fields-grid">
        <div className="form-input-container">
          <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Mobile Phone Line</label>
          <input type="tel" required placeholder="+234..." className="plain-text-input" />
        </div>
        <div className="form-input-container">
          <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Targeted Intake Track Selection</label>
          <select required className="plain-text-input" style={{ height: '46px' }}>
            <option value="">-- Choose a Track Menu --</option>
            <option value="family">Family Life Coaching Framework</option>
            <option value="marriage">Marriage & Relationship Counseling Framework</option>
            <option value="children">Children & Teenagers Coaching Framework</option>
          </select>
        </div>
      </div>

      <button type="submit" className="form-submit-action-btn">
        <i className="fa-solid fa-user-plus"></i> Submit Secure Registration
      </button>
    </form>
  );
}