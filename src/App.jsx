import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, Navigate, useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import AOS from 'aos';
import 'aos/dist/aos.css';
import TeensKidsMenu from './TeensKidsMenu';

function AdminTabBar({ selectedTab, onChangeTab }) {
  const adminTabs = [
    { id: 'content', label: 'Page Content' },
    { id: 'social', label: 'Social Preview' },
    { id: 'programs', label: 'Programs' },
    { id: 'applicants', label: 'Applicants' },
    { id: 'payments', label: 'Payment Settings' }
  ];

  return (
    <div className="dashboard-tab-navigation">
      <div className="dashboard-tab-buttons">
        {adminTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`dashboard-tab-button ${selectedTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// MAIN UNIFIED APPLICATION WITH DEDICATED SERVICE PAGES & INTAKE FORMS
// =========================================================================
export default function App() {
  // --- Theme Management States ---
  const [theme, setTheme] = useState('dark');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [cookieConsentAccepted, setCookieConsentAccepted] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const logoImageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Crect width="48" height="48" rx="12" fill="%23238636"/%3E%3Ctext x="50%" y="55%" font-size="26" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-weight="700"%3EP%3C/text%3E%3C/svg%3E';

  // --- Auth & System Loading States ---
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [enrollments, setEnrollments] = useState({});
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    clientType: 'Individual',
    sessionType: 'Virtual',
    preferredTime: 'Any time',
    concern: ''
  });
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  // --- Sliding Hero Banner States (Main Page) ---
  const [currentHomeSlide, setCurrentHomeSlide] = useState(0);
  const [currentPromoSlide, setCurrentPromoSlide] = useState(0);
  const [promoSlides, setPromoSlides] = useState([
    {
      title: 'Jojo’s Mom',
      text: "Ms. Rosaline has been a truly exceptional tutor and coach for my 10-year-old daughter. My daughter will have her 9th class this week. From the beginning, she created a fun, warm, and engaging environment that made my daughter genuinely excited for every lesson—often looking forward to it even before it starts. What makes Ms. Rosaline stand out is her real impact. She has played a major role in building my daughter’s personality—developing her sense of responsibility and, most importantly, her inner motivation. Today, my daughter attends her classes because she wants to, not because I ask her to—and that, to me, is incredibly valuable. Through her constant encouragement, positivity, and genuine care, Ms. Rosaline has helped my daughter grow in confidence, independence, self-love, and communication. She also nurtures leadership skills and teaches children how to handle different life situations with confidence and awareness. Her dedication, patience, and uplifting spirit truly make a lasting difference. I’m deeply grateful for her efforts and highly recommend her as an inspiring and impactful life coach for children.",
      image: "./logo/logo2.jpeg",
      imageType: 'logo'
    },
    {
      title: 'Chukwunonso',
      text: 'Good evening Coach Roseline thank you for the things you have done for me, my grades are improving now.',
      image: "./logo/logo2.jpeg",
      imageType: 'logo'
    },
    {
      title: "A and A's Dad",
      text: 'Thank You hope they are making progress in line with the schedule. They enjoyed their sessions.',
      image: "./logo/logo2.jpeg",
      imageType: 'logo'
    }
  ]);
  const parentNoticeItems = [
    {
      icon: 'fa-solid fa-leaf',
      title: 'A calmer household rhythm',
      description: 'Parents notice more ease in daily routines as family conversations become purposeful and predictable.'
    },
    {
      icon: 'fa-solid fa-comments',
      title: 'Clear communication habits',
      description: 'Small conflicts are resolved sooner because every member is learning how to share needs with respect.'
    },
    {
      icon: 'fa-solid fa-brain',
      title: 'Stronger emotional confidence',
      description: 'Children and teenagers begin showing improved self-awareness, focus, and emotional composure.'
    },
    {
      icon: 'fa-solid fa-calendar-check',
      title: 'Visible progress markers',
      description: 'Parents track real milestones and feel the difference in family connection from week to week.'
    },
    {
      icon: 'fa-solid fa-handshake-angle',
      title: 'More aligned family teamwork',
      description: 'Every household member becomes a partner in the journey, creating steady momentum across home life.',
    }
  ];

  const homeSlides = [
    {
      title: "Paz Thriving Tribe",
      subtitle: "Coaching, Mentoring and Counselling Organization.",
      image: "./logo/logo2.jpeg",
      imageType: 'logo'
    },
    {
      title: "Building Positive Values.",
      subtitle: "Helping you Build values you need to thrive.",
      image: "./image/pic2.png"
    },
    {
      title: "Coaching and Mentoring",
      subtitle: "Empowering you with core values to reach your full potential.",
      image: "./image/pic3.png"
    },
    {
      title: "Need Someone to Talk To?",
      subtitle: "Paz Thriving Tribe offers a safe and confidential space where you can talk and be heard.",
      image: "./image/pic7.png",
      slideClassName: 'hero-slide-pic7'
    },
    {
      title: "Structured Teens Development Program",
      subtitle: "Supportive and Structured approach that helps children, teenagers and young adults develop essential life skills, build self-confidence and navigate life challenges.",
      image: "./image/pic5.png"
    },
    {
      title: "                             ",
      subtitle: "                          ",
      image: "./image/pic6.png",
      imageType: 'contain'
    },
  ];

  const homeHighlights = [
    {
      icon: 'fa-solid fa-people-group',
      title: 'Family-centred coaching',
      text: 'Support for women, parents, teens, and young adults through guidance that feels practical, calm, and personal.'
    },
    {
      icon: 'fa-solid fa-star',
      title: 'Clear, structured growth',
      text: 'Every pathway is designed to build confidence, responsibility, and long-term habits in a simple format.'
    },
    {
      icon: 'fa-solid fa-hand-holding-heart',
      title: 'A safe space to thrive',
      text: 'A warm environment for reflection, mentoring, emotional support, and next-step planning.'
    }
  ];

  // --- Core Content State (Restored Baseline Titles) ---
  const [services, setServices] = useState({
    family: {
      slug: "family",
      title: "Thriving Parents",
      subtitle: "Single Women Empowerment & Personal Development",
      description: "We equip you with practical parenting training, guide, and a supportive community to raise children who will thrive.We achieve this through sessions, real talk, tools you can use at home for a result oriented journey.",
      metricCount: "120+ Women Empowered"
    },
    marriage: {
      slug: "marriage",
      title: "Thriving Women",
      subtitle: "Women's Community & Collective Growth",
      description: "Building thriving communities of women through structured mentorship, shared experiences, and collective empowerment programs designed to strengthen relationships and cultivate lasting sisterhood.",
      metricCount: "450+ Women Connected"
    },
    children: {
      slug: "children",
      title: "Thriving Pre-teen & Teens",
      subtitle: "Dedicated Mentors & Youth Development Programs",
      description: "Guiding pre-teens and teenagers via one-on-one professional mentorship frameworks designed to build confidence, self-reliance, character development, and cognitive emotional stability.",
      metricCount: "310+ Teens Mentored"
    }
  });

  // --- State for Founder's Suite Interactive Multi-Message ---
  const [founderActiveTab, setFounderActiveTab] = useState('speech');
  const founderTabsList = ['speech', 'about', 'values'];

  // --- Rotating Intro Text for the Highlights Section ---
  const [introTextMode, setIntroTextMode] = useState('heading');

  useEffect(() => {
    const introTimer = window.setInterval(() => {
      setIntroTextMode((currentMode) => (currentMode === 'heading' ? 'paragraph' : 'heading'));
    }, 9000);

    return () => window.clearInterval(introTimer);
  }, []);

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
  const [socialEditTarget, setSocialEditTarget] = useState('YouTube');
  const [socialPreviewTitle, setSocialPreviewTitle] = useState('');
  const [socialPreviewSummary, setSocialPreviewSummary] = useState('');
  const [socialPreviewBadgeText, setSocialPreviewBadgeText] = useState('');
  const [socialPreviewTimestamp, setSocialPreviewTimestamp] = useState('Posted 4 hours ago');
  const [socialPreviewUrl, setSocialPreviewUrl] = useState('https://youtube.com/shorts/-vOSeWpU1Xs?feature=share');
  const [socialPreviewEmbedUrl, setSocialPreviewEmbedUrl] = useState('https://www.youtube.com/embed/-vOSeWpU1Xs');
  const [socialMetadataLoading, setSocialMetadataLoading] = useState(false);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState('https://www.youtube.com/embed/-vOSeWpU1Xs');

  // --- State for Auto-Sliding Social Media News Updates Screen ---
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [socialNewsFeed, setSocialNewsFeed] = useState([
    {
      platform: "Facebook",
      icon: "fa-brands fa-facebook",
      color: "#1877F2",
      badgeText: "Latest Community Article",
      title: "Rebuilding the Foundations of Family Communication",
      summary: "Read our latest exhaustive essay detailing how daily micro-habits and intentional structural conversations can break generational cycle barriers. Over 2.4k community shares this week.",
      timestamp: "Posted 4 hours ago",
      targetUrl: "https://web.facebook.com/profile.php?id=61590838730835"
    },
    {
      platform: "Instagram",
      icon: "fa-brands fa-instagram",
      color: "#E1306C",
      badgeText: "Media Spotlight & Reel",
      title: "Cognitive Tools for Modern Teenage Mentorship",
      summary: "Slide through our recent visual toolkit graphics outlining three actionable methods to guide teenagers through emotional volatility and self-reliance development milestones.",
      timestamp: "Posted 1 day ago",
      targetUrl: "https://instagram.com/pazthriving"
    },
    // {
    //   platform: "YouTube",
    //   icon: "fa-brands fa-youtube",
    //   color: "#FF0000",
    //   badgeText: "Featured Masterclass Broadcast",
    //   title: "Marriage Alignment Frameworks: Annual Summit Highlights",
    //   summary: "Watch the full 45-minute premium streaming segment breaking down advanced relationship intake assessments, milestone mapping, and interactive couple exercises.",
    //   timestamp: "Streamed 3 days ago",
    //   targetUrl: "https://youtube.com/shorts/-vOSeWpU1Xs?feature=share"
    // }
  ]);


  // --- CMS Admin Form Inputs ---
  const [editTarget, setEditTarget] = useState('family');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMetric, setFormMetric] = useState('');
  const [cmsSuccessMessage, setCmsSuccessMessage] = useState(null);
  const [cmsErrorMessage, setCmsErrorMessage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [selectedAdminTab, setSelectedAdminTab] = useState('content');
  const [testimonialAuthor, setTestimonialAuthor] = useState('');
  const [testimonialText, setTestimonialText] = useState('');
  const [testimonialOrigin, setTestimonialOrigin] = useState('');
  const [testimonialEditIndex, setTestimonialEditIndex] = useState(null);
  const [programs, setPrograms] = useState([
    { id: 'fam-101', service: 'family', name: 'Family Communication Foundations', duration: '8 weeks', level: 'Beginner', schedule: 'Saturdays 10:00 AM', description: 'Build family communication patterns with practical exercises for every household.' },
    { id: 'fam-102', service: 'family', name: 'Conflict Resolution Mastery', duration: '6 weeks', level: 'Intermediate', schedule: 'Wednesdays 6:00 PM', description: 'Develop the skills needed to de-escalate conflict, rebuild trust, and create healthy family rhythms.' },
    { id: 'fam-103', service: 'family', name: 'Generational Healing Blueprint', duration: '10 weeks', level: 'Advanced', schedule: 'Sundays 3:00 PM', description: 'A deep exploration of intergenerational patterns and how to intentionally transform them.' },
    { id: 'fam-104', service: 'family', name: 'Parenting Strategies & Emotional Resilience', duration: '8 weeks', level: 'Beginner', schedule: 'Thursdays 7:00 PM', description: 'Practical parenting modules for emotional resilience and positive discipline.' },
    { id: 'mar-101', service: 'marriage', name: 'Couple Communication Deep Dive', duration: '6 weeks', level: 'Beginner', schedule: 'Saturdays 2:00 PM', description: 'Explore communication systems that foster emotional safety and honest connection.' },
    { id: 'mar-102', service: 'marriage', name: 'Relationship Alignment Framework', duration: '8 weeks', level: 'Intermediate', schedule: 'Tuesdays 6:30 PM', description: 'Align your values, expectations, and long-term vision with your partner in a structured format.' },
    { id: 'mar-103', service: 'marriage', name: 'Financial & Emotional Harmony', duration: '6 weeks', level: 'Intermediate', schedule: 'Fridays 7:00 PM', description: 'Build a shared plan for financial planning, emotional connection, and goal progress.' },
    { id: 'mar-104', service: 'marriage', name: 'Advanced Intimacy & Connection', duration: '10 weeks', level: 'Advanced', schedule: 'Sundays 6:00 PM', description: 'Deep practice for restoring intimacy, trust, and intentional relational growth.' },
    { id: 'kid-101', service: 'children', name: 'Cognitive Stability & Emotional Intelligence', duration: '8 weeks', level: 'Ages 10-13', schedule: 'Saturdays 11:00 AM', description: 'Young people learn tools for emotional awareness, decision-making, and resilience.' },
    { id: 'kid-102', service: 'children', name: 'Teen Leadership & Self-Reliance', duration: '10 weeks', level: 'Ages 14-17', schedule: 'Wednesdays 4:00 PM', description: 'Develop leadership skills, personal responsibility, and healthy self-confidence.' },
    { id: 'kid-103', service: 'children', name: 'Social Skills & Confidence Building', duration: '6 weeks', level: 'Ages 10-13', schedule: 'Mondays 5:00 PM', description: 'Support young learners in connecting well, managing emotions, and building confidence.' },
    { id: 'kid-104', service: 'children', name: 'Mentorship & Life Planning', duration: '8 weeks', level: 'Ages 14-17', schedule: 'Thursdays 5:30 PM', description: 'Goal-setting, mentorship guidance, and planning for the next stage of life.' }
  ]);
  const [applicants, setApplicants] = useState([]);
  const [programForm, setProgramForm] = useState({ service: 'family', title: '', description: '', duration: '', schedule: '', level: '' });
  const [dashboardMessage, setDashboardMessage] = useState(null);
  const [showHomepageIntake, setShowHomepageIntake] = useState(false);
  const [formPassportFile, setFormPassportFile] = useState(null);
  const [formDocumentFile, setFormDocumentFile] = useState(null);

  // --- Paystack Integration Settings ---
  const [paystackPublicKey, setPaystackPublicKey] = useState('pk_test_demo_key_update_from_admin');
  const [teensKidsMonthlyFee, setTeensKidsMonthlyFee] = useState(10000);
  const [tempPaystackKey, setTempPaystackKey] = useState(paystackPublicKey);
  const [tempMonthlyFee, setTempMonthlyFee] = useState(teensKidsMonthlyFee);

  const emailInputRef = useRef(null);

  useEffect(() => {
    const selected = socialNewsFeed.find((item) => item.platform === socialEditTarget);
    if (selected) {
      setSocialPreviewTitle(selected.title);
      setSocialPreviewSummary(selected.summary);
      setSocialPreviewBadgeText(selected.badgeText);
      setSocialPreviewTimestamp(selected.timestamp || '');
      setSocialPreviewUrl(selected.targetUrl);
      if (socialEditTarget === 'YouTube') {
        setSocialPreviewEmbedUrl(selected.embedUrl || selected.targetUrl || '');
      }
    }
  }, [socialEditTarget, socialNewsFeed]);

  const fetchSocialUrlMetadata = async () => {
    if (!socialPreviewUrl) {
      setCmsStatus('Enter a valid URL before fetching metadata.', true);
      return;
    }

    setCmsSuccessMessage(null);
    setCmsErrorMessage(null);
    setSocialMetadataLoading(true);

    try {
      const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(socialPreviewUrl)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to fetch metadata');

      if (data.title) setSocialPreviewTitle(data.title);
      if (data.summary) setSocialPreviewSummary(data.summary);
      if (data.timestamp) setSocialPreviewTimestamp(data.timestamp);
      if (data.embedUrl && socialEditTarget === 'YouTube') {
        setSocialPreviewEmbedUrl(data.embedUrl);
        setYoutubeEmbedUrl(data.embedUrl);
      }

      setCmsStatus('Link metadata loaded. Review and save.');
    } catch (err) {
      console.error('Failed fetching metadata:', err);
      setCmsStatus(`Metadata fetch failed: ${err?.message || err}`, true);
    } finally {
      setSocialMetadataLoading(false);
    }
  };

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

    const savedCookieConsent = localStorage.getItem('paz-tribe-cookie-consent');
    if (savedCookieConsent === 'accepted') {
      setCookieConsentAccepted(true);
      setShowCookieBanner(false);
    } else {
      setShowCookieBanner(true);
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

  // --- Auto-Slide Interval Loops on homepage bannerHeroSlider---

  useEffect(() => {
    const homeBannerInterval = setInterval(() => {
      setCurrentHomeSlide((prev) => (prev + 1) % homeSlides.length);
    }, 9000);
    return () => clearInterval(homeBannerInterval);
  }, [homeSlides.length]);

  useEffect(() => {
    const promoInterval = setInterval(() => {
      setCurrentPromoSlide((s) => (s + 1) % promoSlides.length);
    }, 9000);
    return () => clearInterval(promoInterval);
  }, []);

  useEffect(() => {
    const founderInterval = setInterval(() => {
      setFounderActiveTab((currentTab) => {
        const currentIndex = founderTabsList.indexOf(currentTab);
        const nextIndex = (currentIndex + 1) % founderTabsList.length;
        return founderTabsList[nextIndex];
      });
    }, 9000);
    return () => clearInterval(founderInterval);
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveStatementIndex((prevIndex) => (prevIndex + 1) % statements.length);
    }, 9000);
    return () => clearInterval(slideInterval);
  }, [statements.length]);

  useEffect(() => {
    const newsInterval = setInterval(() => {
      setActiveNewsIndex((prevIndex) => (prevIndex + 1) % socialNewsFeed.length);
    }, 9000);
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

  const acceptCookieConsent = () => {
    localStorage.setItem('paz-tribe-cookie-consent', 'accepted');
    document.cookie = 'paz-tribe-cookie-consent=accepted; path=/; max-age=31536000; Secure; SameSite=Lax';
    setCookieConsentAccepted(true);
    setShowCookieBanner(false);
  };

  const declineCookieConsent = () => {
    localStorage.setItem('paz-tribe-cookie-consent', 'declined');
    document.cookie = 'paz-tribe-cookie-consent=declined; path=/; max-age=31536000; Secure; SameSite=Lax';
    setCookieConsentAccepted(false);
    setShowCookieBanner(false);
  };

  const fetchDynamicWebsiteContent = async () => {
    try {
      const [{ data: serviceData, error: serviceError }, { data: programData, error: programError }, { data: applicantData, error: applicantError }] = await Promise.all([
        supabase.from('tribe_services').select('*'),
        supabase.from('tribe_programs').select('*'),
        supabase.from('tribe_applicants').select('*').order('created_at', { ascending: false }).limit(20)
      ]);

      if (serviceError) throw serviceError;
      if (serviceData && serviceData.length > 0) {
        const formattedServices = { ...services };
        serviceData.forEach(item => {
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

      if (!programError && programData) {
        setPrograms(programData.map((program) => ({
          id: program.id?.toString() || `${program.service}-${program.title}`,
          service: program.service,
          name: program.title,
          description: program.description,
          duration: program.duration,
          schedule: program.schedule,
          level: program.level || 'General'
        })));
      }

      if (!applicantError && applicantData) {
        setApplicants(applicantData.map((item) => ({
          id: item.id?.toString() || `${item.full_name}-${item.created_at}`,
          fullName: item.full_name,
          email: item.email,
          phone: item.phone,
          track: item.track,
          message: item.message || '',
          submittedAt: item.created_at
        })));
      }

      try {
        const { data: socialFeedData, error: socialFeedError } = await supabase.from('tribe_social_feed').select('*');
        if (!socialFeedError && Array.isArray(socialFeedData) && socialFeedData.length > 0) {
          const socialRows = socialFeedData.map((row) => ({
            platform: row.platform,
            icon: row.icon || (row.platform === 'Facebook' ? 'fa-brands fa-facebook' : row.platform === 'Instagram' ? 'fa-brands fa-instagram' : 'fa-brands fa-youtube'),
            color: row.color || '#000000',
            badgeText: row.badge_text,
            title: row.title,
            summary: row.summary,
            timestamp: row.timestamp || row.updated_at || '',
            targetUrl: row.target_url,
            embedUrl: row.embed_url
          }));
          setSocialNewsFeed(socialRows);
          const ytRow = socialRows.find((item) => item.platform === 'YouTube');
          if (ytRow?.embedUrl) {
            setYoutubeEmbedUrl(ytRow.embedUrl);
          }
        }
      } catch (err) {
        console.log('No social feed table available for dynamic updates:', err);
      }

      // fetch testimonials after other content
      await fetchTestimonials();
    } catch (err) {
      console.log("Using baseline presentation values while tables initialize.");
    }
  };

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase.from('tribe_testimonials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setPromoSlides(data.map((item) => ({
          id: item.id,
          title: item.author || item.title || 'Anonymous',
          text: item.text || '',
          origin: item.origin || '',
          image: item.image || './logo/logomain.png',
          imageType: item.imageType || 'logo'
        })));
      }
    } catch (err) {
      console.log('Failed to fetch testimonials:', err);
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
    navigate('/admin');
  };

  const parseAdminResponse = async (res) => {
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return await res.json()
    }
    const text = await res.text()
    throw new Error(text || `Unexpected non-JSON response from admin endpoint (${res.status})`)
  }

  const setCmsStatus = (message, isError = false) => {
    setToastMessage(message)
    setToastType(isError ? 'error' : 'success')

    if (isError) {
      setCmsSuccessMessage(null)
      setCmsErrorMessage(message)
      return
    }
    setCmsSuccessMessage(message)
    setCmsErrorMessage(null)
  }

  useEffect(() => {
    if (!cmsSuccessMessage && !cmsErrorMessage) return
    const timer = setTimeout(() => {
      setCmsStatus(null)
      setToastMessage(null)
    }, 5000)
    return () => clearTimeout(timer)
  }, [cmsSuccessMessage, cmsErrorMessage])

  const normalizeYoutubeEmbed = (url) => {
    if (!url) return '';
    let normalized = url.trim();
    if (normalized.includes('youtu.be/')) {
      normalized = normalized.replace('https://youtu.be/', 'https://www.youtube.com/embed/').split('?')[0];
    } else if (normalized.includes('watch?v=')) {
      normalized = normalized.replace('watch?v=', 'embed/').split('&')[0];
    }
    if (!normalized.startsWith('https://www.youtube.com/embed/')) {
      return url;
    }
    return normalized;
  };

  const handleUpdateContentCMS = async (e) => {
    e.preventDefault();
    setCmsStatus(null);

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
      // call secure serverless admin endpoint
      const res = await fetch('/api/admin-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          action: 'update',
          table: 'tribe_services',
          payload: { title: formTitle, subtitle: formSubtitle, description: formDesc, metric_count: formMetric },
          match: { slug: editTarget }
        })
      });

      const payloadRes = await parseAdminResponse(res);
      if (!res.ok) throw new Error(payloadRes?.error || 'Admin endpoint failed');
      setCmsStatus('Ecosystem service menu content synchronized successfully live!');
    } catch (err) {
      console.error('Admin endpoint failed updating tribe_services:', err);
      setCmsStatus(`Preview saved locally. Admin update failed: ${err?.message || err}`, true);
    }
  };

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    setCmsSuccessMessage(null);

    const payload = {
      title: testimonialAuthor || 'Anonymous',
      text: testimonialText,
      origin: testimonialOrigin || '',
      image: './logo/logomain.png',
      imageType: 'logo'
    };

    // If editing an existing testimonial, update it in local state (and attempt DB update)
    if (testimonialEditIndex !== null && promoSlides[testimonialEditIndex]) {
      const target = promoSlides[testimonialEditIndex];
      setPromoSlides((prev) => prev.map((t, i) => (i === testimonialEditIndex ? { ...t, ...payload } : t)));

      // Attempt DB update if record has id
      try {
        if (target.id) {
          const res = await fetch('/api/admin-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
            body: JSON.stringify({ action: 'update', table: 'tribe_testimonials', payload: { author: payload.title, origin: payload.origin, text: payload.text }, match: { id: target.id } })
          });
          const jr = await parseAdminResponse(res);
          if (!res.ok) throw new Error(jr?.error || 'Admin endpoint failed');
          const data = jr.data?.[0] || jr.data;
          setPromoSlides((prev) => prev.map((t, i) => (i === testimonialEditIndex ? {
            id: data.id || target.id,
            title: data.author || payload.title,
            text: data.text || payload.text,
            origin: data.origin || payload.origin,
            image: data.image || payload.image,
            imageType: data.imageType || payload.imageType
          } : t)));
          setCmsStatus('Testimonial updated in database.');
        } else {
          // insert
          const res = await fetch('/api/admin-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
            body: JSON.stringify({ action: 'insert', table: 'tribe_testimonials', payload: [{ author: payload.title, origin: payload.origin, text: payload.text }] })
          });
          const jr = await parseAdminResponse(res);
          if (!res.ok) throw new Error(jr?.error || 'Admin endpoint failed');
          const created = Array.isArray(jr.data) ? jr.data[0] : jr.data
          setPromoSlides((prev) => [created, ...prev]);
          setCmsStatus('Testimonial saved to database.');
        }
      } catch (err) {
        console.error('Failed updating/inserting testimonial via admin endpoint:', err);
        setCmsStatus(`Update applied locally; admin update failed: ${err?.message || err}`, true);
      }

      setTestimonialEditIndex(null);
    } else {
      // Add new testimonial and persist to DB
      try {
        const res = await fetch('/api/admin-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
          body: JSON.stringify({ action: 'insert', table: 'tribe_testimonials', payload: [{ author: payload.title, origin: payload.origin, text: payload.text }] })
        });
        const jr = await parseAdminResponse(res);
        if (!res.ok) throw new Error(jr?.error || 'Admin endpoint failed');
        const created = Array.isArray(jr.data) ? jr.data[0] : jr.data
        setPromoSlides((prev) => [created, ...prev]);
        setCmsStatus('Testimonial saved to database.');
      } catch (err) {
        console.error('Failed inserting testimonial via admin endpoint:', err);
        setPromoSlides((prev) => [payload, ...prev]);
        setCmsStatus(`Testimonial added locally; admin insert failed: ${err?.message || err}`, true);
      }
    }

    setTestimonialAuthor(''); setTestimonialText(''); setTestimonialOrigin('');
  };

  const handleStartEditTestimonial = (index) => {
    const t = promoSlides[index];
    if (!t) return;
    setTestimonialAuthor(t.title || '');
    setTestimonialText(t.text || '');
    setTestimonialOrigin(t.origin || '');
    setTestimonialEditIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditTestimonial = () => {
    setTestimonialAuthor(''); setTestimonialText(''); setTestimonialOrigin(''); setTestimonialEditIndex(null);
  };

  const handleDeleteTestimonial = async (index) => {
    const t = promoSlides[index];
    if (!t) return;
    // remove locally
    setPromoSlides((prev) => prev.filter((_, i) => i !== index));
    // attempt DB delete if id present
    if (t.id) {
      try {
        const res = await fetch('/api/admin-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
          body: JSON.stringify({ action: 'delete', table: 'tribe_testimonials', match: { id: t.id } })
        });
        const jr = await parseAdminResponse(res);
        if (!res.ok) throw new Error(jr?.error || 'Admin endpoint failed');
        setCmsStatus('Testimonial deleted from database.');
        await fetchTestimonials();
      } catch (err) {
        console.error('Failed deleting testimonial via admin endpoint:', err);
        setCmsStatus(`Testimonial removed locally; admin delete failed: ${err?.message || err}`, true);
      }
    }
  };

  const handleUpdateSocialPreview = async (e) => {
    e.preventDefault();
    setCmsSuccessMessage(null);

    const existingItem = socialNewsFeed.find((item) => item.platform === socialEditTarget);
    const updatedItem = {
      platform: socialEditTarget,
      icon: existingItem?.icon || (socialEditTarget === 'Facebook' ? 'fa-brands fa-facebook' : socialEditTarget === 'Instagram' ? 'fa-brands fa-instagram' : 'fa-brands fa-youtube'),
      color: existingItem?.color || (socialEditTarget === 'Facebook' ? '#1877F2' : socialEditTarget === 'Instagram' ? '#E1306C' : '#FF0000'),
      badgeText: socialPreviewBadgeText,
      title: socialPreviewTitle,
      summary: socialPreviewSummary,
      timestamp: socialPreviewTimestamp || existingItem?.timestamp || '',
      targetUrl: socialPreviewUrl,
      embedUrl: socialEditTarget === 'YouTube' ? normalizeYoutubeEmbed(socialPreviewEmbedUrl || socialPreviewUrl) : existingItem?.embedUrl
    }

    if (socialEditTarget === 'YouTube') {
      setYoutubeEmbedUrl(updatedItem.embedUrl);
    }

    try {
      const action = existingItem ? 'update' : 'insert';
      const bodyPayload = {
        action,
        table: 'tribe_social_feed',
        payload: [{
          platform: updatedItem.platform,
          icon: updatedItem.icon,
          color: updatedItem.color,
          badge_text: updatedItem.badgeText,
          title: updatedItem.title,
          summary: updatedItem.summary,
          timestamp: updatedItem.timestamp,
          target_url: updatedItem.targetUrl,
          embed_url: updatedItem.embedUrl
        }],
        match: existingItem ? { platform: updatedItem.platform } : undefined
      };

      const res = await fetch('/api/admin-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify(bodyPayload)
      });
      const jr = await parseAdminResponse(res);
      if (!res.ok) throw new Error(jr?.error || 'Admin endpoint failed');
      setCmsStatus(`Social preview for ${socialEditTarget} has been updated successfully.`);
    } catch (err) {
      console.error('Failed saving social preview via admin endpoint:', err);
      setCmsStatus(`Social preview updated locally; admin save failed: ${err?.message || err}`, true);
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    setDashboardMessage(null);

    const newProgram = {
      id: `${programForm.service}-${programForm.title}-${Date.now()}`,
      service: programForm.service,
      name: programForm.title,
      description: programForm.description,
      duration: programForm.duration,
      schedule: programForm.schedule,
      level: programForm.level
    };

    setPrograms((prev) => [newProgram, ...prev]);

    try {
      const res = await fetch('/api/admin-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({ action: 'insert', table: 'tribe_programs', payload: [{ service: programForm.service, title: programForm.title, description: programForm.description, duration: programForm.duration, schedule: programForm.schedule, level: programForm.level }] })
      });
      const jr = await parseAdminResponse(res);
      if (!res.ok) throw new Error(jr?.error || 'Admin endpoint failed');
      setDashboardMessage('Program created successfully and available in menu pages.');
    } catch (err) {
      console.error('Admin endpoint failed creating while program:', err);
      setDashboardMessage(`Program saved locally; admin insert failed: ${err?.message || err}`);
    }

    setProgramForm({ service: 'family', title: '', description: '', duration: '', schedule: '', level: '' });
  };

  const handleRemoveProgram = async (programId) => {
    setPrograms((prev) => prev.filter((p) => p.id !== programId));
    try {
      const programToRemove = programs.find((p) => p.id === programId);
      if (programToRemove && programToRemove.id) {
        const res = await fetch('/api/admin-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
          body: JSON.stringify({ action: 'delete', table: 'tribe_programs', match: { id: programToRemove.id } })
        });
        const jr = await parseAdminResponse(res);
        if (!res.ok) throw new Error(jr?.error || 'Admin endpoint failed');
      }
    } catch (err) {
      console.error('Failed removing program via admin endpoint:', err);
      setDashboardMessage(`Program removed locally; admin delete failed: ${err?.message || err}`);
    }
  };

  const handleHeroBookingSubmit = async (event) => {
    event.preventDefault();

    const message = [
      `Client type: ${bookingForm.clientType}`,
      `Session type: ${bookingForm.sessionType}`,
      `Preferred time: ${bookingForm.preferredTime}`,
      `Concern: ${bookingForm.concern}`
    ].join(' | ');

    try {
      const { error } = await supabase.from('tribe_applicants').insert([{
        full_name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        track: 'talk-thrive',
        message
      }]);

      if (error) throw error;

      setBookingSubmitted(true);
      setToastMessage('Booking request sent successfully. We will follow up shortly.');
      setToastType('success');
    } catch (err) {
      console.error('Home banner booking submission failed:', err);
      await addApplicant({
        fullName: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        track: 'talk-thrive',
        message
      });
      setBookingSubmitted(true);
      setToastMessage('Booking request saved locally. We will follow up shortly.');
      setToastType('success');
    } finally {
      setBookingForm({ name: '', email: '', phone: '', clientType: 'Individual', sessionType: 'Virtual', preferredTime: 'Any time', concern: '' });
    }
  };

  const addApplicant = async (applicant) => {
    const newApplicant = {
      id: `app-${Date.now()}`,
      fullName: applicant.fullName || applicant.parentName || applicant.full_name || '',
      email: applicant.email || applicant.parentEmail || '',
      phone: applicant.phone || applicant.phoneNumber1 || applicant.phone1 || '',
      track: applicant.track || applicant.targetTrack || applicant.selectedTrack || '',
      message: applicant.message || applicant.developmentGoals || '',
      paymentReference: applicant.paymentReference || '',
      paymentStatus: applicant.paymentStatus || 'pending',
      submittedAt: new Date().toISOString()
    };
    setApplicants((prev) => [newApplicant, ...prev]);

    try {
      const { error } = await supabase.from('tribe_applicants').insert([{
        full_name: newApplicant.fullName,
        email: newApplicant.email,
        phone: newApplicant.phone,
        track: newApplicant.track,
        message: newApplicant.message
      }]);//.select();
      if (error) throw error;
    } catch (err) {
      console.error('Server down at the moment try again later:', err);
      console.log('Applicant captured locally; Supabase insert unavailable.');
    }
  };

  const handleServiceIntakeSubmit = async (serviceApplicant) => {
    setCmsSuccessMessage(null);
    await addApplicant(serviceApplicant);
  };

  return (
    <>
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

        .cookie-consent-banner {
          position: fixed;
          bottom: 18px;
          left: 18px;
          right: 18px;
          max-width: 1140px;
          margin: 0 auto;
          background: rgba(18, 23, 30, 0.96);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 18px;
          padding: 1rem 1.25rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          justify-content: space-between;
          z-index: 12000;
          box-shadow: 0 28px 70px rgba(0, 0, 0, 0.25);
        }

        .cookie-consent-copy {
          flex: 1 1 320px;
          color: #f4f4f4;
          font-size: 0.96rem;
          line-height: 1.5;
        }

        .cookie-consent-actions {
          display: flex;
          gap: 0.75rem;
          flex: 0 0 auto;
          align-items: center;
        }

        .cookie-accept-btn,
        .cookie-decline-btn {
          border: none;
          cursor: pointer;
          border-radius: 999px;
          padding: 0.78rem 1.2rem;
          font-weight: 700;
          transition: transform 0.15s ease, background-color 0.2s ease, color 0.2s ease;
        }

        .cookie-accept-btn {
          background: #238636;
          color: white;
        }

        .cookie-decline-btn {
          background: rgba(255,255,255,0.08);
          color: #d0d7de;
        }

        .cookie-accept-btn:hover,
        .cookie-decline-btn:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 720px) {
          .cookie-consent-banner {
            flex-direction: column;
            align-items: stretch;
            padding: 1rem;
          }
          .cookie-consent-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }

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
        .float-theme-toggle-container { position: fixed; bottom: 18px; left: 18px; z-index: 9999; }
        .theme-toggle-switch-shell {
          display: flex; align-items: center; gap: 0.6rem; cursor: pointer;
          background-color: var(--bg-card); border: 1px solid var(--border-color);
          padding: 0.75rem 1.2rem; border-radius: 30px; box-shadow: var(--shadow-lg);
          animation: bounce-default 2s infinite ease-in-out;
        }
        .float-whatsapp-container { position: fixed; bottom: 18px; right: 18px; z-index: 9999; }
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
          min-height: 100svh;
          height: auto;
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
        @media (max-width: 420px) {
          .hero-section { min-height: 100svh; }
          .hero-slide-bg { background-position: center center !important; background-size: cover !important; }
        }
        .hero-slide-bg::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(rgba(15, 23, 42, 0.62), rgba(15, 23, 42, 0.28));
        }
        .hero-overlay {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100%;
          padding: clamp(5rem, 8vh, 6rem) 1rem 2rem;
          box-sizing: border-box;
        }
        .hero-copy-card {
          width: min(100%, 820px);
          background: transparent;
          border: none;
          border-radius: 0;
          box-shadow: none;
          padding: 1.25rem 1rem 1.1rem;
          text-align: center;
          backdrop-filter: none;
          position: relative;
          z-index: 2;
        }
        .hero-copy-card h1 { font-size: clamp(2.2rem, 6vw, 4.2rem); color: #ffffff; margin-bottom: 0.75rem; font-weight: 800; letter-spacing: -1px; animation: bannerTextFade 0.6s ease-out; text-shadow: 0 10px 28px rgba(0,0,0,0.85); }
        .hero-copy-card p { font-size: clamp(1rem, 2vw, 1.35rem); color: #eff6ff; max-width: 760px; margin: 0 auto 1rem auto; line-height: 1.5; animation: bannerTextFade 0.8s ease-out; text-shadow: 0 6px 20px rgba(0,0,0,0.75); }
        .hero-action-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 0.75rem; margin-top: 1rem; position: relative; z-index: 2; }
        .hero-arrow-cluster {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: none;
          padding: 0 0.15rem;
          pointer-events: none;
        }
        .hero-nav-btn {
          width: 48px; height: 48px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.18);
          background: rgba(15, 23, 42, 0.55); color: #ffffff; display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer; box-shadow: 0 12px 30px rgba(15,23,42,0.35); transition: transform 0.2s ease, background 0.2s ease;
          pointer-events: auto;
          backdrop-filter: blur(6px);
        }
        .hero-nav-btn:hover { background: rgba(255,255,255,0.2); transform: translateY(-1px); }
        .hero-scroll-btn { min-width: 180px; }
        @keyframes bannerTextFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        
        .hero-scroll-btn { background-color: var(--brand-green); color: white; padding: 1rem 2.5rem; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 1.05rem; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.6rem; }
        .hero-scroll-btn:hover { background-color: var(--brand-green-hover); }

        .teens-kids-hero { box-sizing: border-box; }
        .teens-welcome-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1.25rem; }
        .teens-welcome-card { background: white; border-radius: 20px; max-width: 760px; width: 100%; padding: 2rem; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.25); position: relative; max-height: calc(100vh - 2rem); overflow-y: auto; }
        .teens-welcome-close-btn { position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; color: #4a5568; font-size: 1.4rem; cursor: pointer; }

        .teens-page-grid, .teens-info-grid, .teens-age-grid, .teens-program-grid, .teens-benefit-grid { display: grid; gap: 1.5rem; }
        .teens-info-grid { grid-template-columns: 1fr 1fr; }
        .teens-age-grid { grid-template-columns: 1fr 1fr; max-width: 100%; margin: 0 auto; }
        .teens-program-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
        .teens-benefit-grid { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
        .passport-upload-row { display: flex; gap: 1rem; align-items: flex-start; grid-column: 1 / -1; }
        .passport-upload-preview { width: 130px; min-width: 130px; }
        .passport-upload-preview .preview-box { width: 100%; height: 140px; border-radius: 8px; overflow: hidden; margin: 0 auto; border: 1px solid var(--border-color); background: #f7fafc; display: flex; align-items: center; justify-content: center; }
        .passport-upload-form { flex: 1; min-width: 0; }
        .preview-item { display: grid; grid-template-columns: minmax(140px, 1fr) 1fr; gap: 0.75rem; align-items: start; padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb; font-size: 0.95rem; }

        .hero-slide-bg { background-position: center center; background-size: cover; }
        .hero-slide-pic7 {
          background-position: center 18%;
          background-size: 112% auto;
          background-repeat: no-repeat;
        }
        .hero-bg-contain { background-size: contain !important; background-position: center center !important; background-repeat: no-repeat !important; }
        .hero-inline-contain-img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          max-width: min(92vw, 900px);
          max-height: 78vh;
          width: auto;
          height: auto;
          object-fit: contain;
          object-position: center center;
          z-index: 2;
        }
        .hero-overlay { padding: 3rem 1.5rem; }
        .hero-overlay h1 { font-size: 3.8rem; color: #ffffff; text-shadow: 0 8px 28px rgba(0,0,0,0.7); }
        .hero-overlay p { font-size: 1.25rem; max-width: 100%; color: #ffffff; text-shadow: 0 6px 20px rgba(0,0,0,0.6); }
        .hero-scroll-btn { min-width: 220px; }
        .teens-kids-hero { padding: 4rem 2rem; display: flex; align-items: center; justify-content: center; min-height: 320px; box-sizing: border-box; }
        .teens-kids-hero h1 { max-width: 100%; line-height: 1.05; overflow-wrap: break-word; }
        .teens-kids-hero p { font-size: 1.2rem; max-width: 100%; line-height: 1.6; overflow-wrap: break-word; }
        @media (max-width: 768px) {
          .hero-slide-pic7 {
            background-position: center 15%;
            background-size: 115% auto;
            min-height: 78vh;
          }
          .teens-kids-hero { padding: 1.75rem 1rem; text-align: center; min-height: 240px; align-items: center; }
          .teens-kids-hero h1 { font-size: 2rem; line-height: 1.05; }
          .teens-kids-hero p { font-size: 0.98rem; }
          .teens-welcome-overlay { align-items: flex-start; overflow-y: auto; padding: 1rem 0.75rem; }
          .teens-welcome-card { margin-top: 1rem; padding: 1.25rem; max-height: calc(100vh - 2rem); }
          .teens-welcome-close-btn { top: 0.8rem; right: 0.8rem; font-size: 1.2rem; }
          .teens-info-grid, .teens-age-grid, .teens-program-grid, .teens-benefit-grid { grid-template-columns: 1fr; }
          .passport-upload-row { flex-direction: column; }
          .passport-upload-preview { width: 100%; min-width: auto; }
          .preview-item { grid-template-columns: 1fr; }
          .registration-modal-panel { padding: 1.25rem 1rem 1.5rem; }
          .registration-modal-header { flex-direction: column; align-items: stretch; }
          .registration-modal-section { padding: 0.75rem 0; }
          .registration-flow-step { justify-content: center; }
          .registration-action-row { flex-direction: column; align-items: stretch; gap: 1rem; }
          .registration-action-row .form-submit-action-btn, .registration-action-row .form-cancel-action-btn { width: 100%; }
          .hero-scroll-btn { width: 100%; justify-content: center; }
          .registration-preview-row { grid-template-columns: 1fr; }
          .registration-confirmation-actions { grid-template-columns: 1fr; }
        }
        @media (max-width: 420px) {
          .hero-slide-pic7 {
            background-position: center 10%;
            background-size: 140% auto;
            min-height: 72vh;
          }
        }
        @media (max-width: 380px) {
          .hero-slide-pic7 {
            background-position: center 12%;
            background-size: 150% auto;
            min-height: 68vh;
          }
        }
          .teens-kids-hero { padding: 1rem 0.75rem; min-height: 260px; }
          .teens-kids-hero h1 { font-size: 1.6rem; }
          .teens-kids-hero p { font-size: 0.9rem; }
          .banner-slider { height: 220px; }
          .slide-graphic { min-height: 160px; max-height: 240px; }
          .slide-graphic img { object-fit: cover; height: 100%; }
          .hero-bg-contain { background-size: contain !important; background-position: center center !important; }
          .hero-inline-contain-img { max-height: 70vh; max-width: 92vw; }
          .hero-overlay h1 { font-size: 2rem !important; }
          .hero-overlay p { font-size: 0.95rem !important; }
        }
        .slide-graphic { min-height: 260px; max-height: 360px; aspect-ratio: 4 / 3; }
        .slide-graphic img { width: 100%; height: 100%; object-fit: contain; display: block; }
        img { max-width: 100%; height: auto; display: block; }

        /* Promo slider (replaces synchronized-promo-banner) */
        .synchronized-promo-banner { width: 100% !important; padding: 2.5rem 4rem; box-sizing: border-box; }
        .banner-slider { position: relative; width: 100%; height: 380px; }
        .banner-slide { position: absolute; inset: 0; display: flex; gap: 4rem; align-items: center; padding: 2rem; box-sizing: border-box; opacity: 0; transform: translateX(30px); transition: opacity 0.6s ease, transform 0.6s ease; pointer-events: none; }
        .banner-slide.active { opacity: 1; transform: translateX(0); pointer-events: auto; }
        .banner-text-package { display: flex; flex-direction: column; gap: 1rem; width: 55%; max-width: 800px; }
        .banner-badge { align-self: flex-start; background-color: rgba(35, 134, 54, 0.15); color: var(--accent-green); padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 0.4rem; }
        .banner-text-package h2 { font-size: 2.4rem; font-weight: 800; color: var(--text-primary); margin: 0; line-height: 1.1; }
        .banner-text-package p { font-size: 1.05rem; line-height: 1.6; color: var(--text-muted); margin: 0; }
        .slide-graphic { width: 45%; height: 100%; border-radius: 12px; background-position: center; background-size: cover; box-shadow: var(--shadow-lg); border: 1px solid var(--border-color); }
        .testimonial-author { font-size: 0.95rem; color: var(--text-muted); font-weight: 700; margin-top: 0.5rem; text-align: left; }
        @media (max-width: 768px) { .testimonial-author { text-align: center; margin-top: 0.5rem; } }
        @media (max-width: 768px) { .synchronized-promo-banner { padding: 1.25rem; } .banner-slider { height: auto; min-height: auto; position: relative; } .banner-slide { position: static !important; display: none; opacity: 1 !important; transform: none !important; transition: none; flex-direction: column; gap: 1rem; padding: 1rem; align-items: stretch; } .banner-slide.active { display: flex; } .banner-text-package { width: 100%; gap: 0.75rem; } .banner-badge { font-size: 0.75rem; padding: 0.3rem 0.8rem; } .banner-text-package p { font-size: 0.9rem; line-height: 1.5; } .slide-graphic { width: 100%; height: 180px; margin: 0.5rem 0 0 0; } }
        @media (max-width: 480px) { .synchronized-promo-banner { padding: 0.75rem; } .banner-slide { padding: 0.75rem; gap: 0.6rem; } .banner-text-package { gap: 0.5rem; } .banner-badge { font-size: 0.65rem; padding: 0.25rem 0.6rem; i { font-size: 0.65rem; } } .banner-text-package p { font-size: 0.8rem; line-height: 1.4; } .slide-graphic { height: 140px; } }
        .banner-controls { position: absolute; right: 18px; bottom: 12px; display: flex; gap: 0.6rem; }
        @media (max-width: 768px) { .banner-controls { position: relative; right: auto; bottom: auto; justify-content: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color); } }
        .banner-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--border-color); cursor: pointer; border: none; }
        .banner-dot.active { background: var(--brand-green); width: 28px; border-radius: 5px; }

        /* INTENTIONAL DEDICATED REGISTRATION INTAKE SHIELDS */
        .intake-registration-section { width: 100% !important; background-color: var(--bg-card); border-bottom: 1px solid var(--border-color); padding: 6rem 4rem; box-sizing: border-box; }
        @media (max-width: 768px) { .intake-registration-section { padding: 3rem 1.5rem; } }
        .intake-form-wrapper { max-width: 750px; margin: 0 auto; background-color: var(--bg-main); border: 1px solid var(--border-color); border-radius: 16px; padding: 4rem; box-shadow: var(--shadow-lg); }
        @media (max-width: 768px) { .intake-form-wrapper { padding: 1.75rem; border-radius: 12px; } }
        .intake-form-wrapper h3 { font-size: 2.2rem; font-weight: 800; margin: 0 0 0.5rem 0; color: var(--text-primary); letter-spacing: -0.5px; text-align: center; }
        @media (max-width: 768px) { .intake-form-wrapper h3 { font-size: 1.5rem; } }\n        .intake-form-wrapper p { font-size: 1.1rem; color: var(--text-muted); text-align: center; margin: 0 0 3rem 0; }
        @media (max-width: 768px) { .intake-form-wrapper p { font-size: 0.95rem; margin: 0 0 1.5rem 0; } }
        .registration-fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.75rem; }
        @media (max-width: 768px) { .registration-fields-grid { grid-template-columns: 1fr; } }

        .registration-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          z-index: 20000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .registration-modal-panel {
          width: min(100%, 960px);
          max-width: 100%;
          max-height: 95vh;
          overflow-y: auto;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: 22px;
          padding: 2rem 2.5rem;
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
          position: relative;
          margin: 0 auto;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .registration-modal-overlay {
            align-items: flex-start;
            justify-content: center;
            padding: 0.75rem 0.5rem;
          }
          .registration-modal-panel {
            width: 100%;
            max-width: 100%;
            max-height: calc(100vh - 1.5rem);
            padding: 1rem 0.9rem 1.25rem;
            margin-top: 0.75rem;
            border-radius: 18px;
          }
          .registration-modal-header {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }
          .registration-modal-close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            margin-left: 0;
          }
          .registration-modal-section {
            padding: 0.5rem 0;
          }
          .registration-flow-step {
            justify-content: center;
          }
          .registration-flow-step span {
            flex: 1 1 auto;
            min-width: 0;
          }
          .registration-fields-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .passport-upload-row {
            flex-direction: column;
            align-items: stretch;
          }
          .passport-upload-preview {
            width: 100%;
            min-width: auto;
          }
          .passport-upload-preview .preview-box {
            min-height: 180px;
          }
          .registration-payment-row {
            grid-template-columns: 1fr;
          }
          .registration-action-row {
            flex-direction: column;
            align-items: stretch;
            gap: 0.9rem;
          }
          .registration-action-row .form-submit-action-btn,
          .registration-action-row .form-cancel-action-btn {
            width: 100%;
            min-width: 0;
            padding: 0.5rem 0.75rem !important;
            font-size: 0.85rem !important;
          }
          .registration-preview-row {
            grid-template-columns: 1fr;
          }
          .registration-preview-header {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          .registration-preview-header button {
            width: 100%;
            padding: 0.5rem 0.75rem !important;
            font-size: 0.85rem !important;
            margin-left: 0 !important;
          }
          .registration-preview-photo {
            min-height: 180px;
          }
          .preview-item {
            grid-template-columns: 1fr;
          }
          .registration-confirmation-actions {
            grid-template-columns: 1fr;
          }
        }
        .registration-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .registration-modal-header h3 { margin: 0; font-size: 2rem; color: var(--text-primary); }
        .registration-modal-close-btn {
          width: 44px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
          border-radius: 14px;
          background: var(--bg-card);
          color: var(--text-primary);
          cursor: pointer;
          position: sticky;
          top: 1rem;
          margin-left: auto;
          z-index: 10;
        }
        .registration-modal-section { margin-bottom: 1.5rem; }
        .registration-modal-section h4 { margin: 0 0 0.75rem 0; font-size: 1.05rem; color: var(--text-primary); }
        .registration-modal-section p { color: var(--text-muted); line-height: 1.75; margin: 0 0 1rem 0; }
        .registration-flow-nav { margin-bottom: 1.25rem; }
        .registration-flow-step { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
        .registration-flow-step span { padding: 0.65rem 0.95rem; border-radius: 999px; border: 1px solid #d1d5db; background: #f8fafc; color: #374151; font-size: 0.9rem; font-weight: 700; white-space: nowrap; }
        .registration-flow-step span.active { background: var(--brand-green); border-color: transparent; color: white; }
        .registration-action-row { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; justify-content: flex-end; margin-top: 1.25rem; }
        .registration-action-row .form-submit-action-btn, .registration-action-row .form-cancel-action-btn { min-width: 140px; }
        @media (max-width: 768px) { .registration-action-row { flex-direction: column; align-items: stretch; gap: 0.75rem; } .registration-action-row .form-submit-action-btn, .registration-action-row .form-cancel-action-btn { width: 100%; min-width: 0; padding: 0.5rem 0.75rem !important; font-size: 0.85rem !important; } }
        .registration-checklist-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
        @media (max-width: 768px) { .registration-checklist-grid { grid-template-columns: 1fr; } }
        .checkbox-card { display: flex; align-items: flex-start; gap: 0.8rem; padding: 1rem 1rem 1rem 0.95rem; border: 1px solid var(--border-color); border-radius: 14px; background: var(--bg-card); }
        .checkbox-card input { margin-top: 5px; }
        .registration-payment-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: flex-end; margin-top: 1rem; }
        @media (max-width: 768px) { .registration-payment-row { grid-template-columns: 1fr; } }
        .registration-prompt-banner { margin-bottom: 1rem; padding: 1rem 1.15rem; border-radius: 14px; background: rgba(35, 134, 54, 0.1); border: 1px solid rgba(35, 134, 54, 0.16); color: var(--text-primary); }
        .payment-status-message { margin: 1rem 0 0 0; color: var(--brand-green); font-weight: 700; }

        .registration-preview-card {
          margin-top: 1.5rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 22px;
          padding: 1.5rem;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
          color: #111827;
        }
        .registration-preview-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .registration-preview-header h4 {
          margin: 0;
          font-size: 1.25rem;
          color: #111827;
        }
        .registration-preview-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 1.25rem;
          align-items: flex-start;
        }
        .registration-preview-photo {
          width: 100%;
          min-height: 140px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #d1d5db;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .registration-preview-photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .registration-preview-photo-placeholder {
          color: #6b7280;
          padding: 1rem;
          text-align: center;
          font-size: 0.95rem;
        }
        .registration-preview-details {
          display: grid;
          gap: 0.75rem;
        }
        .preview-item {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 0.75rem;
          align-items: start;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.95rem;
        }
        .preview-item span {
          font-weight: 700;
          color: #111827;
        }
        .registration-confirmation-card {
          margin-top: 1.5rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 22px;
          padding: 1.75rem;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
          color: #111827;
        }
        .registration-confirmation-card h3 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          font-size: 1.6rem;
        }
        .registration-confirmation-card p {
          margin: 0 0 1.25rem 0;
          color: #374151;
          line-height: 1.75;
        }
        .registration-confirmation-actions {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
        }
        @media (max-width: 768px) {
          .registration-preview-row { grid-template-columns: 1fr; }
          .registration-confirmation-actions { grid-template-columns: 1fr; }
          .registration-confirmation-actions button {
            width: 100%;
            padding: 0.5rem 0.75rem !important;
            font-size: 0.85rem !important;
          }
        }
        @media print {
          .registration-modal-overlay { background: transparent !important; }
          .registration-modal-panel { box-shadow: none !important; border: none !important; width: 100% !important; max-height: none !important; overflow: visible !important; padding: 0 !important; }
          .registration-modal-header, .form-submit-action-btn, .form-cancel-action-btn, .registration-modal-close-btn, .registration-preview-header button { display: none !important; }
          .registration-preview-card, .registration-confirmation-card { box-shadow: none !important; border: none !important; }
          .preview-item { border-color: #d1d5db !important; }
        }

        .bottom-registration-panel { background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 22px; padding: 2rem 2.25rem; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.1); }
        .bottom-registration-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 1.25rem; }
        .section-label { display: inline-flex; margin-bottom: 0.85rem; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--brand-green); }
        .bottom-registration-header h3 { margin: 0 0 0.5rem 0; font-size: 2rem; color: var(--text-primary); }
        .section-description { margin: 0; color: var(--text-muted); line-height: 1.75; max-width: 720px; }
        .bottom-registration-body { margin-top: 1.75rem; }
        .intake-form-toggle-btn { background: var(--brand-green); color: #fff; padding: 0.95rem 1.4rem; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; display: inline-flex; align-items: center; gap: 0.6rem; }
        .intake-form-toggle-btn:hover { background: var(--brand-green-hover); }
        .intake-collapsed-note { color: var(--text-muted); margin-top: 1.75rem; padding: 1.5rem 1.25rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; }
        .applicants-table-wrapper { width: 100%; overflow-x: auto; margin-top: 1.5rem; }
        .dashboard-table { width: 100%; border-collapse: collapse; min-width: 100%; }
        .dashboard-table th,
        .dashboard-table td { padding: 0.95rem 0.85rem; border: 1px solid var(--border-color); text-align: left; vertical-align: middle; font-size: 0.9rem; }
        .dashboard-table th { background: var(--bg-main); color: var(--text-primary); font-weight: 700; }
        .dashboard-table tbody tr:hover { background: rgba(46, 164, 79, 0.06); }
        .applicants-table-wrapper { width: 100%; overflow-x: auto; margin-top: 1.5rem; -webkit-overflow-scrolling: touch; border-radius: 10px; border: 1px solid var(--border-color); }
        .status-pill { display: inline-flex; padding: 0.35rem 0.8rem; border-radius: 6px; font-size: 0.8rem; font-weight: 700; }
        .status-pill.success { background: rgba(35, 134, 54, 0.14); color: var(--accent-green); }
        .status-pill.pending { background: rgba(255, 231, 179, 0.6); color: #b58304; }

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
          background: linear-gradient(rgba(7, 12, 18, 0.70), rgba(7, 12, 18, 0.82));
        }
        .service-banner-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 2rem;
          max-width: 900px;
          background: linear-gradient(rgba(8, 13, 20, 0.45), rgba(8, 13, 20, 0.55));
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 24px;
          box-shadow: 0 18px 45px rgba(0,0,0,0.28);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .service-view-hero-banner h1 { font-size: 3.5rem; font-weight: 800; color: #ffffff; margin: 0 0 1rem 0; letter-spacing: -1px; animation: bannerTextFade 0.6s ease-out; }
        .service-view-hero-banner p { font-size: 1.3rem; color: #eff4f8; max-width: 800px; margin: 0 auto; line-height: 1.6; animation: bannerTextFade 0.8s ease-out; }
        .service-banner-controls { display: flex; justify-content: center; align-items: center; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap; }
        .service-banner-btn {
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.08);
          color: #ffffff;
          border-radius: 999px;
          padding: 0.55rem 0.8rem;
          cursor: pointer;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .service-banner-btn:hover { background: rgba(255,255,255,0.16); }
        .service-banner-dot { width: 10px; height: 10px; border-radius: 999px; border: none; background: rgba(255,255,255,0.45); cursor: pointer; padding: 0; }
        .service-banner-dot.active { background: #ffffff; width: 28px; border-radius: 999px; box-shadow: 0 0 0 4px rgba(255,255,255,0.14); }
        
        .service-content-split-zone { padding: 6rem 4rem; display: grid; grid-template-columns: 1.5fr 1fr; gap: 4rem; width: 100%; box-sizing: border-box; }
        @media (max-width: 992px) { .service-content-split-zone { grid-template-columns: 1fr; padding: 4rem 1.5rem; gap: 2.5rem; } }
        @media (max-width: 768px) { .service-content-split-zone { padding: 2.5rem 1rem; gap: 1.5rem; } }
        
        .service-info-narrative-card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 3.5rem; box-shadow: var(--shadow-sm); }
        @media (max-width: 768px) { .service-info-narrative-card { padding: 1.75rem; } }
        .service-info-narrative-card h2 { font-size: 2.2rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.5rem 0; }
        .service-info-narrative-card h4 { font-size: 1.25rem; color: var(--accent-green); margin: 0 0 2rem 0; font-weight: 600; }
        .service-info-narrative-card p { font-size: 1.2rem; line-height: 1.75; color: var(--text-muted); margin-bottom: 2.5rem; }
        
        .service-sidebar-news-stack { display: flex; flex-direction: column; gap: 2rem; }
        .topic-news-card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem; box-shadow: var(--shadow-sm); }
        .topic-news-card h5 { font-size: 1.1rem; font-weight: 700; color: var(--brand-blue); margin: 0 0 0.75rem 0; display: flex; align-items: center; gap: 0.5rem; }
        .topic-news-card h3 { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin: 0 0 1rem 0; }
        .topic-news-card p { font-size: 1rem; line-height: 1.6; color: var(--text-muted); margin: 0; }

        /* ENROLLMENT CLASS CARDS & PROGRAM SECTIONS */
        .enrollment-class-card { 
          position: relative; 
          overflow: hidden; 
          background-clip: border-box;
        }
        .enrollment-class-card button {
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 768px) {
          .enrollment-class-card {
            padding: 1.25rem !important;
          }
          .enrollment-class-card h4 {
            font-size: 1rem;
          }
          .enrollment-class-card button {
            padding: 0.7rem 1rem !important;
            font-size: 0.9rem;
          }
        }

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
        .founder-title-tag-overlay span { display: block; font-size: 0.9rem; color: var(--brand-blue); font-weight: 600; margin-top: 0.25rem; }
        .founder-title-tag-overlay span:nth-of-type(2) { color: #ffcc66; }
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
        .indicator-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--border-color); cursor: pointer; transition: all 0.3s ease; border: none; padding: 0; }
        .indicator-dot.active { background: var(--brand-green); width: 28px; border-radius: 5px; }

        /* EMBEDDED SOCIAL MEDIA NEWS AND UPDATES AUTOMATIC STREAM SCREEN */
        .social-news-stream-section {
          width: 100% !important; background-color: var(--bg-main); border-bottom: 1px solid var(--border-color);
          padding: 6rem 4rem; box-sizing: border-box; overflow-x: hidden;
        }
        .social-news-layout-wrapper { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 3rem; }
        @media (max-width: 768px) { .social-news-layout-wrapper { gap: 1.5rem; padding: 0 1rem; box-sizing: border-box; } }
        .social-news-header-zone { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1.5rem; }
        @media (max-width: 768px) { .social-news-header-zone { flex-direction: column; align-items: flex-start; gap: 1rem; } }
        .social-news-title-stack h2 { font-size: 2.6rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.5rem 0; letter-spacing: -0.5px; }
        @media (max-width: 768px) { .social-news-title-stack h2 { font-size: 1.8rem; } }
        .social-news-title-stack p { font-size: 1.15rem; color: var(--text-muted); margin: 0; }
        .social-platform-indicator-badges { display: flex; gap: 0.75rem; }
        @media (max-width: 768px) { .social-platform-indicator-badges { flex-wrap: wrap; gap: 0.5rem; } }
        .platform-badge-nav { background-color: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-muted); padding: 0.6rem 1.2rem; border-radius: 20px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 0.5rem; }
        @media (max-width: 768px) { .platform-badge-nav { padding: 0.5rem 0.8rem; font-size: 0.8rem; } }
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
        @media (max-width: 768px) { .social-slide-screen-viewport { animation: none; } .social-news-broadcast-anchor-card { padding: 1.5rem; } }
        
        .broadcast-meta-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem; }
        @media (max-width: 768px) { .broadcast-meta-row { flex-direction: column; align-items: flex-start; gap: 0.75rem; margin-bottom: 1rem; padding-bottom: 0.75rem; } }
        .meta-platform-identity { display: flex; align-items: center; gap: 0.75rem; font-size: 1.2rem; font-weight: 800; }
        .meta-type-badge { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; padding: 0.35rem 0.85rem; border-radius: 6px; color: white; }
        @media (max-width: 768px) { .meta-type-badge { font-size: 0.75rem; padding: 0.25rem 0.6rem; } }
        .broadcast-content-body h3 { font-size: 2.2rem; font-weight: 800; color: var(--text-primary); margin: 0 0 1.25rem 0; line-height: 1.3; }
        .broadcast-content-body p { font-size: 1.25rem; line-height: 1.7; color: var(--text-muted); margin: 0 0 2rem 0; }
        @media (max-width: 768px) { .broadcast-content-body h3 { font-size: 1.5rem; margin: 0 0 0.75rem 0; } .broadcast-content-body p { font-size: 1rem; margin: 0 0 1rem 0; } }
        .broadcast-action-footer { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 1.05rem; }
        .broadcast-action-footer i { transition: transform 0.2s; }
        .social-news-broadcast-anchor-card:hover .broadcast-action-footer i { transform: translateX(5px); }

        .youtube-video-feature-section { width: 100% !important; background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 24px; padding: 3rem 4rem; box-sizing: border-box; margin: 2rem 0; }
        .video-feature-grid { display: grid; grid-template-columns: 1.2fr 1.8fr; gap: 2rem; align-items: center; }
        .video-feature-copy h2 { margin: 0 0 1rem 0; font-size: 2.4rem; line-height: 1.1; color: var(--text-primary); }
        .video-feature-copy p { margin: 0; color: var(--text-muted); font-size: 1.05rem; line-height: 1.75; }
        .video-embed-wrap { width: 100%; min-height: 340px; border-radius: 18px; overflow: hidden; background-color: #000; box-shadow: var(--shadow-sm); }
        .video-embed-wrap iframe { width: 100%; height: 100%; min-height: 340px; border: none; }
        @media (max-width: 768px) { .video-feature-grid { grid-template-columns: 1fr; } }

        /* Specialty Grid Dashboard Links Layout Section */
        .interactive-tabs-section { padding: 7rem 4rem; width: 100% !important; box-sizing: border-box; }
        .program-highlights-section {
          width: 100% !important;
          background: linear-gradient(180deg, rgba(35, 134, 54, 0.03), rgba(35, 134, 54, 0.08));
          border-bottom: 1px solid var(--border-color);
          padding: 5rem 4rem 6rem;
          box-sizing: border-box;
        }
        .section-intro-shell { max-width: 1100px; margin: 0 auto 2.5rem; text-align: center; }
        .rotating-intro-shell { position: relative; }
        .rotating-intro-copy {
          animation: introRotateIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          transform-style: preserve-3d;
        }
        @keyframes introRotateIn {
          0% { opacity: 0; transform: rotateX(-20deg) translateY(8px); }
          100% { opacity: 1; transform: rotateX(0deg) translateY(0); }
        }
        .section-intro-shell h2 {
          margin: 0.75rem auto 0.75rem;
          max-width: 860px;
          font-size: 2.4rem;
          line-height: 1.15;
          color: var(--text-primary);
          letter-spacing: -0.6px;
        }
        .section-intro-shell p {
          max-width: 760px;
          margin: 0 auto;
          color: var(--text-muted);
          font-size: 1.08rem;
          line-height: 1.7;
        }
        .highlight-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
          max-width: 1120px;
          margin: 0 auto;
        }
        .highlight-card {
          background: linear-gradient(180deg, var(--bg-card), rgba(35, 134, 54, 0.03));
          border: 1px solid var(--border-color);
          border-radius: 18px;
          padding: 1.4rem;
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .highlight-card:hover { transform: translateY(-4px); border-color: var(--brand-green); }
        .highlight-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          margin-bottom: 1rem;
          background: rgba(35, 134, 54, 0.12);
          color: var(--brand-green);
          font-size: 1.2rem;
        }
        .highlight-card h3 {
          margin: 0 0 0.5rem;
          font-size: 1.15rem;
          color: var(--text-primary);
        }
        .highlight-card p {
          margin: 0;
          color: var(--text-muted);
          line-height: 1.6;
          font-size: 0.98rem;
        }
        .section-title-heading { text-align: center; font-size: 2.8rem; color: var(--text-primary); margin-bottom: 0.5rem; font-weight: 800; letter-spacing: -0.5px; }
        .section-subtext { text-align: center; color: var(--text-muted); margin-bottom: 4rem; font-size: 1.2rem; }
        
        .services-routing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
        @media (max-width: 992px) { .services-routing-grid { grid-template-columns: 1fr; } }
        
        .service-gateway-card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 3rem; display: flex; flex-direction: column; justify-content: space-between; box-shadow: var(--shadow-sm); transition: transform 0.2s, border-color 0.2s; text-decoration: none; color: inherit; }
        .service-gateway-card:hover { transform: translateY(-5px); border-color: var(--brand-green); }
        .gateway-icon-wrap { width: 50px; height: 50px; border-radius: 10px; background-color: rgba(35,134,54,0.12); color: var(--brand-green); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1.5rem; }
        .service-gateway-card h3 { font-size: 1.6rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.75rem 0; }
        .service-gateway-card p { font-size: 1.05rem; line-height: 1.6; color: var(--text-muted); margin: 0 0 2rem 0; flex-grow: 1; }
        .gateway-footer-action { font-weight: 700; color: var(--brand-green); display: flex; align-items: center; gap: 0.5rem; }

        .care-counseling-section { width: 100% !important; padding: 0 4rem 2rem 4rem; box-sizing: border-box; }
        .care-counseling-shell {
          width: 100%;
          max-width: none;
          margin: 0;
          background: transparent;
          border: none;
          border-radius: 0;
          padding: 0 0 2rem 0;
          box-shadow: none;
        }
        .care-intro-block {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(153, 231, 206, 0.10);
          margin-bottom: 1rem;
        }
        .care-section-block { margin-top: 1rem; }
        .care-slider-panel { display: block; }
        .care-process-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
        .care-promise-panel { margin-top: 1rem; }
        .care-animated-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
        .care-animated-box {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          padding: 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          box-shadow: none;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .care-animated-box::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(153, 231, 206, 0.08), transparent 35%);
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }
        .care-animated-box:hover { transform: translateY(-2px); border-color: var(--border-color); box-shadow: var(--shadow-sm); }
        .care-animated-box:hover::after { opacity: 1; }
        .care-animated-box h3 { font-size: 1.02rem; margin: 0 0 0.35rem 0; color: var(--text-primary); }
        .care-animated-box p { color: var(--text-muted); line-height: 1.6; font-size: 0.95rem; margin: 0; }
        .care-animated-box .care-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border-radius: 999px;
          padding: 0.35rem 0.65rem;
          background: rgba(35, 134, 54, 0.12);
          color: var(--brand-green);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.6rem;
          border: 1px solid rgba(35, 134, 54, 0.18);
        }
        @media (max-width: 992px) { .care-animated-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 640px) { .care-animated-grid { grid-template-columns: 1fr; } }
        .care-counseling-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 1.25rem; margin-top: 1.25rem; }
        .care-counseling-card {
          border: 1px solid var(--border-color);
          border-radius: 18px;
          padding: 1.25rem;
          background: var(--bg-card);
          box-shadow: none;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .care-counseling-card:hover { transform: translateY(-1px); border-color: var(--border-color); box-shadow: var(--shadow-sm); }
        .care-counseling-card h3 { font-size: 1.15rem; margin: 0 0 0.75rem 0; color: var(--text-primary); }
        .care-counseling-card p { color: var(--text-muted); line-height: 1.65; font-size: 0.98rem; margin: 0 0 0.85rem 0; }
        .care-counseling-card ul { margin: 0; padding-left: 1rem; color: var(--text-muted); line-height: 1.6; }
        .why-it-matters-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.9rem; margin-top: 0.75rem; }
        .why-it-matters-card {
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1rem;
          background: var(--bg-card);
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .why-it-matters-card:hover { transform: translateY(-3px); border-color: rgba(35, 134, 54, 0.28); box-shadow: 0 22px 35px rgba(15, 23, 42, 0.12); }
        .why-it-matters-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 999px;
          background: rgba(35, 134, 54, 0.12);
          color: var(--brand-green);
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          margin-bottom: 0.55rem;
        }
        .why-it-matters-card h4 { margin: 0 0 0.35rem 0; font-size: 0.98rem; color: var(--text-primary); }
        .why-it-matters-card p { margin: 0; color: var(--text-muted); font-size: 0.9rem; line-height: 1.55; }
        @media (max-width: 992px) { .why-it-matters-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 640px) { .why-it-matters-grid { grid-template-columns: 1fr; } }
        .care-focus-surface {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          box-shadow: none;
        }
        .care-focus-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
        .care-focus-copy { flex: 1 1 360px; min-width: 0; }
        .care-focus-copy h3 { font-size: 1.2rem; line-height: 1.35; margin: 0.2rem 0 0.45rem 0; }
        .care-focus-copy p { color: var(--text-muted); }
        .care-focus-helper { font-size: 0.88rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.16em; font-weight: 700; }
        .care-focus-actions { display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; }
        .care-focus-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.2rem;
          height: 2.2rem;
          border-radius: 999px;
          border: 1px solid var(--border-color);
          background: var(--bg-main);
          color: var(--text-primary);
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
        }
        .care-focus-btn:hover { transform: translateY(-1px); border-color: rgba(35, 134, 54, 0.24); background: var(--bg-card); }
        .care-focus-dot { width: 10px; height: 10px; border-radius: 999px; border: none; background: var(--border-color); cursor: pointer; padding: 0; }
        .care-focus-dot.active { background: var(--brand-green); width: 28px; border-radius: 999px; box-shadow: 0 0 0 4px rgba(35, 134, 54, 0.12); }
        .care-counseling-card li + li { margin-top: 0.35rem; }
        .care-focus-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
          color: var(--text-primary);
        }
        .care-focus-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
        .care-focus-copy { flex: 1 1 320px; min-width: 0; }
        .care-focus-copy h3 { font-size: 1.18rem; line-height: 1.35; margin: 0.45rem 0 0.35rem; color: var(--text-primary); }
        .care-focus-copy p { color: var(--text-muted); }
        .care-focus-controls { display: flex; justify-content: flex-end; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .care-focus-helper { color: var(--text-muted); font-size: 0.88rem; margin-top: 0.45rem; opacity: 1; }
        .care-chip-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
        .care-chip-list span { display: inline-flex; align-items: center; padding: 0.45rem 0.75rem; border-radius: 999px; background: rgba(35,134,54,0.12); color: var(--text-primary); border: 1px solid rgba(35,134,54,0.18); font-size: 0.9rem; font-weight: 600; }
        .care-services-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; margin-top: 1rem; }
        .care-mini-card { border: 1px solid var(--border-color); border-radius: 16px; padding: 0.95rem; background-color: var(--bg-card); color: var(--text-primary); font-weight: 700; font-size: 0.95rem; box-shadow: none; }
        .care-mini-card small { display: block; color: var(--text-muted); font-weight: 500; margin-top: 0.35rem; }
        @media (max-width: 992px) { .care-counseling-grid { grid-template-columns: 1fr; } .care-services-strip { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) {
          .care-counseling-section { padding: 0 1rem 1rem 1rem; }
          .care-counseling-shell { padding: 1rem; border-radius: 18px; }
          .care-focus-header { flex-direction: column; align-items: stretch; }
          .care-focus-controls { justify-content: flex-start; }
          .service-banner-btn { padding: 0.45rem 0.6rem; }
          .service-banner-dot { width: 9px; height: 9px; }
          .service-banner-dot.active { width: 24px; }
        }
        @media (max-width: 640px) { .care-services-strip { grid-template-columns: 1fr; } .care-counseling-card { padding: 1rem; } .care-focus-copy h3 { font-size: 1.02rem; } .care-focus-helper { font-size: 0.82rem; } }

        .parent-notice-section { width: 100% !important; background-color: var(--bg-card); border-bottom: 1px solid var(--border-color); padding: 5rem 4rem; box-sizing: border-box; }
        .parent-notice-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.75rem; }
        .notice-card { position: relative; overflow: hidden; background: linear-gradient(180deg, rgba(35,134,54,0.08), rgba(13,17,23,0.04)); border: 1px solid rgba(35,134,54,0.15); border-radius: 20px; padding: 2rem; min-height: 240px; display: flex; flex-direction: column; gap: 1rem; transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .notice-card:hover { transform: translateY(-4px); box-shadow: 0 20px 45px rgba(0,0,0,0.12); }
        .notice-icon-shell { width: 60px; height: 60px; border-radius: 18px; display: grid; place-items: center; background-color: rgba(35,134,54,0.16); color: var(--brand-green); font-size: 1.4rem; box-shadow: inset 0 0 0 1px rgba(35,134,54,0.1); }
        .notice-card h3 { margin: 0; font-size: 1.4rem; color: var(--text-primary); line-height: 1.3; }
        .notice-card p { margin: 0; color: var(--text-muted); line-height: 1.75; font-size: 1rem; }
        .notice-card::after { content: ''; position: absolute; width: 70px; height: 70px; border-radius: 50%; background: rgba(35,134,54,0.08); top: -20px; right: -20px; pointer-events: none; }
        @media (max-width: 992px) { .parent-notice-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) { .parent-notice-grid { grid-template-columns: 1fr; } .parent-notice-section { padding: 3rem 1.5rem; } }

        /* Multi-Column Workspace Footer Layer */
        .workspace-fluid-footer { width: 100% !important; background-color: var(--bg-card); border-top: 1px solid var(--border-color); padding: 5rem 4rem 2.5rem 4rem; box-sizing: border-box; margin-top: 6rem; }
        .footer-columns-container { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 4rem; width: 100%; padding-bottom: 3.5rem; border-bottom: 1px solid var(--border-color); }
        .footer-brand-column { display: flex; flex-direction: column; gap: 1.2rem; }
        .footer-brand-logo-row { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
        .footer-vector-badge { width: 32px; height: 32px; background-color: var(--brand-green); color: white; font-weight: 800; display: flex; align-items: center; justify-content: center; border-radius: 6px; overflow: hidden; }
        .footer-vector-badge img { width: 100%; height: 100%; object-fit: contain; display: block; }
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
        .portal-workspace-grid { display: grid; grid-template-columns: 300px 1fr; height: 100vh; background-color: var(--bg-main); width: 100% !important; }
        .portal-sidebar-panel { background-color: var(--bg-card); border-right: 1px solid var(--border-color); padding: 2rem 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; overflow-y: auto; }
        .portal-sidebar-title { font-size: 1.25rem; color: var(--text-primary); font-weight: 700; margin-bottom: 1.25rem; border-left: 3px solid var(--brand-green); padding-left: 0.75rem; }
        .portal-sidebar-links { display: flex; flex-direction: column; gap: 0.5rem; flex-grow: 1; }
        .sidebar-link-item { color: var(--text-muted); text-decoration: none; padding: 0.85rem 1rem; border-radius: 10px; font-size: 0.95rem; font-weight: 600; transition: all 0.2s ease; }
        .sidebar-link-item:hover { background-color: rgba(46,164,79,0.12); color: var(--text-primary); }
        .sidebar-link-item.active { background-color: var(--brand-green); color: #ffffff; font-weight: 700; }
        .sidebar-disconnect-btn { background-color: #f85149; border: none; color: #fff; padding: 0.85rem 1rem; border-radius: 12px; cursor: pointer; font-weight: 700; transition: background-color 0.2s ease, transform 0.2s ease; }
        .sidebar-disconnect-btn:hover { background-color: #dc3545; transform: translateY(-1px); }
        .portal-main-workspace { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; }
        .portal-workspace-header { background-color: var(--bg-card); border-bottom: 1px solid var(--border-color); padding: 1.25rem 3rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; box-sizing: border-box; flex-shrink: 0; }
        .dashboard-logout-btn { background: transparent; border: 1px solid var(--brand-green); color: var(--brand-green); padding: 0.65rem 1.1rem; border-radius: 8px; cursor: pointer; font-weight: 700; transition: all 0.2s ease; font-size: 0.9rem; }
        .dashboard-logout-btn:hover { background: var(--brand-green); color: #ffffff; transform: translateY(-1px); }
        .portal-workspace-header-shell { display: flex; flex-direction: column; flex-shrink: 0; }
        .dashboard-tab-navigation { position: sticky; top: 0; z-index: 20; background: var(--bg-main); flex-shrink: 0; }
        .dashboard-tab-buttons { display: flex; flex-wrap: wrap; gap: 0.75rem; padding: 1rem 3rem; margin-bottom: 0; position: sticky; top: 0; z-index: 25; background: var(--bg-main); border-bottom: 1px solid var(--border-color); width: 100%; box-sizing: border-box; overflow-x: auto; }
        .dashboard-tab-button { padding: 0.75rem 1.2rem; border-radius: 8px; border: 1px solid var(--border-color); background: transparent; color: var(--text-muted); font-weight: 600; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; font-size: 0.95rem; }
        .dashboard-tab-button:hover { background: rgba(35,134,54,0.08); color: var(--text-primary); border-color: var(--brand-green); }
        .dashboard-tab-button.active { background: var(--brand-green); border-color: var(--brand-green); color: #ffffff; box-shadow: 0 2px 8px rgba(46,164,79,0.3); }
        .dashboard-tab-button.active:hover { background: #36b560; border-color: #36b560; }
        .portal-workspace-body-content { padding: 2rem 3rem; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 2rem; flex: 1; overflow-y: auto; }
        .dashboard-editor-card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 2.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); width: 100%; box-sizing: border-box; transition: all 0.2s ease; }
        .dashboard-editor-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .cms-creation-form-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
        .form-input-container { display: flex; flex-direction: column; gap: 0.6rem; }
        .form-input-container label { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); }
        .plain-text-input { background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.95rem 1.15rem; line-height: 1.5; border-radius: 10px; font-size: 0.95rem; width: 100%; box-sizing: border-box; min-height: 44px; transition: all 0.2s ease; }
        .plain-text-input:hover { border-color: rgba(46,164,79,0.5); }
        .plain-text-input:focus { outline: none; border-color: var(--brand-green); box-shadow: 0 0 0 3px rgba(46,164,79,0.1); }
        .form-submit-action-btn { background-color: var(--brand-green); color: white; padding: 0.85rem 1.8rem; border-radius: 8px; border: none; font-weight: 700; font-size: 0.95rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s ease; }
        .form-submit-action-btn:hover { background-color: #36b560; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(46,164,79,0.3); }
        .form-cancel-action-btn { background-color: transparent; color: var(--text-primary); padding: 0.85rem 1.8rem; border-radius: 8px; border: 1px solid var(--border-color); font-weight: 700; font-size: 0.95rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s ease; }
        .form-cancel-action-btn:hover { background-color: rgba(0,0,0,0.05); border-color: var(--text-muted); transform: translateY(-1px); }
        .status-feedback-banner { padding: 1rem 1.25rem; background-color: rgba(46,164,79,0.08); border: 1px solid rgba(46,164,79,0.3); color: var(--accent-green); border-radius: 10px; font-weight: 600; text-align: center; font-size: 0.95rem; }
        
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
          .portal-workspace-grid { grid-template-columns: 1fr; height: auto; }
          .portal-sidebar-panel { display: none; }
          .portal-main-workspace { height: 100vh; overflow: hidden; }
          .portal-workspace-body-content { padding: 1.5rem; }
          .portal-workspace-header { padding: 1rem 1.5rem; }
          .dashboard-tab-buttons { padding: 0.75rem 1rem; gap: 0.5rem; overflow-x: auto; }
          .dashboard-tab-button { padding: 0.65rem 0.95rem; font-size: 0.85rem; }
          .dashboard-editor-card { padding: 1.5rem; border-radius: 12px; }
          .cms-creation-form-layout { grid-template-columns: 1fr; }
          .dashboard-table th,
          .dashboard-table td { padding: 0.75rem 0.6rem; font-size: 0.85rem; }
          .public-navbar { padding: 1rem 1.5rem; }
          .hero-section { height: auto; min-height: 72vh; }
          .hero-overlay { padding: 2.2rem 1rem; }
          .hero-overlay h1 { font-size: 2.8rem; }
          .hero-overlay p { font-size: 1.1rem; line-height: 1.5; }
          .hero-scroll-btn { width: 100%; justify-content: center; }
          .banner-slide { gap: 1.25rem; padding: 1.5rem; }
          .slide-graphic { max-height: 320px; }
          .interactive-tabs-section { padding: 4rem 1.5rem; }
          .program-highlights-section { padding: 3.5rem 1.25rem 4rem; }
          .section-intro-shell h2 { font-size: 1.9rem; }
          .section-intro-shell p { font-size: 0.98rem; }
          .highlight-grid { grid-template-columns: 1fr; }
          .intake-form-wrapper { padding: 2.5rem 1.5rem; }
        }
        @media (max-width: 640px) {
          .portal-workspace-body-content { padding: 1rem; }
          .dashboard-tab-buttons { padding: 0.5rem 0.75rem; gap: 0.4rem; overflow-x: auto; }
          .dashboard-tab-button { padding: 0.6rem 0.8rem; font-size: 0.8rem; }
          .dashboard-editor-card { padding: 1.25rem; }
          .dashboard-table th,
          .dashboard-table td { padding: 0.6rem 0.5rem; font-size: 0.8rem; }
          .form-submit-action-btn { padding: 0.75rem 1.4rem; font-size: 0.85rem; }
          .portal-workspace-header { flex-direction: column; padding: 0.75rem 1rem; }
        }
      `}</style>

      {showCookieBanner && (
        <div className="cookie-consent-banner">
          <div className="cookie-consent-copy">
            We use cookies and local storage to improve your experience. By accepting, you allow the site to remember your preferences and help the website work smoothly on future visits.
          </div>
          <div className="cookie-consent-actions">
            <button className="cookie-accept-btn" type="button" onClick={acceptCookieConsent}>
              Accept Cookies
            </button>
            <button className="cookie-decline-btn" type="button" onClick={declineCookieConsent}>
              Decline
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="toast-notification-container">
          <div className={`toast-notification ${toastType}`}>{toastMessage}</div>
        </div>
      )}

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
                    <span style={{ fontSize: '1.1rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
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
          <Link to="/" className="nav-logo-brand-zone" onClick={() => { setNavOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <img src={theme === 'dark' ? "../logo/logo2.jpeg" : "../logo/logomain.png"} alt="Paz Thriving Tribe logo" className="nav-logo-img" />
            <div className="nav-brand-name">Paz Thriving Tribe</div>
          </Link>
          <button className="nav-menu-toggle" onClick={() => setNavOpen((current) => !current)} aria-label="Toggle navigation menu">
            <i className={navOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'}></i>
          </button>
          <nav className={`nav-navigation-links ${navOpen ? 'mobile-open' : ''}`}>
            <Link to="/" className="nav-link-item" onClick={() => { setNavOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <i className="fa-solid fa-house"></i> Home
            </Link>
            <Link to="/care-counseling" className="nav-link-item" onClick={() => setNavOpen(false)}>
              <i className="fa-solid fa-hand-holding-heart"></i> Talk & Thrive
            </Link>
            <Link to="/teens-kids-academy" className="nav-link-item" onClick={() => setNavOpen(false)}>
              <i className="fa-solid fa-child-reaching"></i> Thriving Pre-teens & Teens
            </Link>
            <Link to="/services/family" className="nav-link-item" onClick={() => setNavOpen(false)}>
              <i className="fa-solid fa-people-roof"></i> Thriving Parents
            </Link>
            <Link to="/services/marriage" className="nav-link-item" onClick={() => setNavOpen(false)}>
              <i className="fa-solid fa-heart-crack"></i> Thriving Women
            </Link>

            <a href="https://pazthrivingtribe.schoolsfocus.net/signin" className="nav-cta-btn" target="_blank" rel="noopener noreferrer" onClick={() => setNavOpen(false)}>
              <i className="fa-solid fa-right-to-bracket"></i> Portal
            </a>
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
                  {(() => {
                    const currentSlide = homeSlides[currentHomeSlide];
                    return (
                      <>
                        <div
                          className={`hero-slide-bg ${currentSlide.imageType === 'contain' ? 'hero-bg-contain' : ''} ${currentSlide.imageType === 'bottom' ? 'hero-slide-bottom' : ''} ${currentSlide.slideClassName || ''}`}
                          style={{
                            backgroundImage: currentSlide.imageType === 'contain' ? 'none' : `url(${currentSlide.image})`,
                            backgroundSize: currentSlide.imageType === 'logo' ? 'contain' : 'cover',
                            backgroundPosition: currentSlide.imageType === 'bottom' ? 'center bottom' : 'center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        />
                        {currentSlide.imageType === 'contain' && (
                          <img
                            src={currentSlide.image}
                            alt="Banner"
                            className="hero-inline-contain-img"
                          />
                        )}
                        {currentSlide.imageType !== 'contain' && (
                          <div className="hero-overlay" key={currentHomeSlide}>
                            <div className="hero-copy-card">
                              <h1>{currentSlide.title}</h1>
                              <p>{currentSlide.subtitle}</p>
                              <div className="hero-action-row">
                                <button
                                  className="hero-scroll-btn"
                                  onClick={() => {
                                    if (currentSlide.title === 'Need Someone to Talk To?') {
                                      setShowBookingModal(true);
                                    } else {
                                      setShowRegisterModal(true);
                                    }
                                  }}
                                >
                                  {currentSlide.title === 'Need Someone to Talk To?' ? 'Book Now' : 'Register Now'}
                                  <i className={currentSlide.title === 'Need Someone to Talk To?' ? 'fa-solid fa-calendar-check' : 'fa-solid fa-user-plus'}></i>
                                </button>
                              </div>
                            </div>
                            <div className="hero-arrow-cluster" aria-label="Slide navigation">
                              <button
                                type="button"
                                className="hero-nav-btn"
                                aria-label="Previous slide"
                                onClick={() => setCurrentHomeSlide((prev) => (prev - 1 + homeSlides.length) % homeSlides.length)}
                              >
                                <i className="fa-solid fa-chevron-left"></i>
                              </button>
                              <button
                                type="button"
                                className="hero-nav-btn"
                                aria-label="Next slide"
                                onClick={() => setCurrentHomeSlide((prev) => (prev + 1) % homeSlides.length)}
                              >
                                <i className="fa-solid fa-chevron-right"></i>
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </section>
                {showBookingModal && (
                  <div
                    style={{
                      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.78)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '5.5rem 1rem 2rem', zIndex: 2147483647, overflowY: 'auto', WebkitOverflowScrolling: 'touch'
                    }}
                    onClick={() => setShowBookingModal(false)}
                  >
                    <article
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '100%', maxWidth: '780px', borderRadius: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.35)', padding: '1rem 1rem 1.1rem', maxHeight: 'min(920px, calc(100vh - 5rem))', overflowY: 'auto', marginTop: '0', marginBottom: '1rem', boxSizing: 'border-box', position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div>
                          <span className="care-pill">Talk & Thrive booking</span>
                          <h3 style={{ margin: '0.35rem 0 0.35rem', fontSize: '1.2rem' }}>Book your counseling session</h3>
                          <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                            Use this quick form to request your session. The details are sent to the admin dashboard for follow-up.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowBookingModal(false)}
                          style={{ border: '1px solid var(--border-color)', background: 'transparent', borderRadius: '999px', width: '40px', height: '40px', color: 'var(--text-primary)', cursor: 'pointer' }}
                          aria-label="Close booking form"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>

                      {bookingSubmitted ? (
                        <div className="status-feedback-banner" style={{ marginTop: '0.5rem' }}>
                          <i className="fa-solid fa-circle-check"></i> Your booking request has been received and saved for admin follow-up.
                        </div>
                      ) : (
                        <form onSubmit={handleHeroBookingSubmit} className="cms-creation-form-layout" style={{ marginTop: '0.7rem' }}>
                          <div className="registration-fields-grid">
                            <div className="form-input-container">
                              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Full Name</label>
                              <input type="text" required value={bookingForm.name} onChange={(e) => setBookingForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Enter your full name" className="plain-text-input" />
                            </div>
                            <div className="form-input-container">
                              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Email Address</label>
                              <input type="email" required value={bookingForm.email} onChange={(e) => setBookingForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="you@example.com" className="plain-text-input" />
                            </div>
                          </div>
                          <div className="registration-fields-grid">
                            <div className="form-input-container">
                              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Phone Number</label>
                              <input type="tel" required value={bookingForm.phone} onChange={(e) => setBookingForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+234..." className="plain-text-input" />
                            </div>
                            <div className="form-input-container">
                              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Client Type</label>
                              <select value={bookingForm.clientType} onChange={(e) => setBookingForm((prev) => ({ ...prev, clientType: e.target.value }))} className="plain-text-input">
                                <option value="Individual">Individual</option>
                                <option value="Parent">Parent / Guardian</option>
                                <option value="Teen">Teen</option>
                                <option value="Woman">Woman / Young Adult</option>
                              </select>
                            </div>
                          </div>
                          <div className="registration-fields-grid">
                            <div className="form-input-container">
                              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Session Type</label>
                              <select value={bookingForm.sessionType} onChange={(e) => setBookingForm((prev) => ({ ...prev, sessionType: e.target.value }))} className="plain-text-input">
                                <option value="Virtual">Virtual</option>
                                <option value="In-person">In-person</option>
                                <option value="Hybrid">Hybrid</option>
                              </select>
                            </div>
                            <div className="form-input-container">
                              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Preferred Time</label>
                              <select value={bookingForm.preferredTime} onChange={(e) => setBookingForm((prev) => ({ ...prev, preferredTime: e.target.value }))} className="plain-text-input">
                                <option value="Any time">Any time</option>
                                <option value="Morning">Morning</option>
                                <option value="Afternoon">Afternoon</option>
                                <option value="Evening">Evening</option>
                              </select>
                            </div>
                          </div>
                          <div className="form-input-container">
                            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>What would you like support with?</label>
                            <textarea rows="5" required value={bookingForm.concern} onChange={(e) => setBookingForm((prev) => ({ ...prev, concern: e.target.value }))} placeholder="Share what you need help with." className="plain-text-input" style={{ resize: 'vertical' }} />
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem' }}>
                            <button type="submit" className="form-submit-action-btn" style={{ minWidth: '220px' }}>
                              <i className="fa-solid fa-paper-plane"></i> Send Booking Request
                            </button>
                            <button type="button" onClick={() => setShowBookingModal(false)} className="btn-secondary" style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
                              Close
                            </button>
                          </div>
                        </form>
                      )}
                    </article>
                  </div>
                )}

                {showRegisterModal && (
                  <ThriverRegistrationModal
                    visible={showRegisterModal}
                    onClose={() => setShowRegisterModal(false)}
                    onRegister={async (registrationData) => {
                      await addApplicant(registrationData);
                    }}
                    paystackPublicKey={paystackPublicKey}
                  />
                )}

                <section className="program-highlights-section" data-aos="fade-up">
                  <div key={introTextMode} className="section-intro-shell rotating-intro-shell">
                    <span className="section-label">Paz Thriving Tribe brings you peace.</span>
                    {introTextMode === 'heading' ? (
                      <>
                        <h2 className="rotating-intro-copy">When you experience peace within, you are better able to grow, overcome challenges, discover purpose, and thrive.</h2>
                        <p className="rotating-intro-copy">Through coaching, mentoring and counselling, we help individuals build the confidence, character, and clarity they need to thrive.</p>
                      </>
                    ) : (
                      <>
                        <p className="rotating-intro-copy">When you experience peace within, you are better able to grow, overcome challenges, discover purpose, and thrive.</p>
                        <h2 className="rotating-intro-copy">Through coaching, mentoring and counselling, we help individuals build the confidence, character, and clarity they need to thrive.</h2>
                      </>
                    )}
                  </div>

                  <div className="highlight-grid">
                    {homeHighlights.map((item, index) => (
                      <article key={item.title} className="highlight-card" data-aos="fade-up" data-aos-delay={index * 80}>
                        <div className="highlight-icon-wrap">
                          <i className={item.icon}></i>
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section id="founder-suite" className="founder-executive-suite" data-aos="fade-up">
                  <div className="founder-portrait-frame" data-aos="fade-right">
                    <img src="../image/pic1.jpeg" className="founder-img" alt="Paz Tribe Founder and CEO" />
                    <div className="founder-title-tag-overlay">
                      <h4>Roseline Iraoya </h4>
                      <span>Lead Coach</span>
                      <span>Paz Thriving Tribe</span>
                    </div>
                  </div>

                  <div className="founder-interactive-message-box" data-aos="fade-left">
                    <nav className="founder-msg-nav-row">
                      <button className={`founder-nav-pill ${founderActiveTab === 'speech' ? 'active' : ''}`} onClick={() => setFounderActiveTab('speech')}>
                        <i className="fa-solid fa-microphone"></i> From the Founder's Desk
                      </button>
                      <button className={`founder-nav-pill ${founderActiveTab === 'about' ? 'active' : ''}`} onClick={() => setFounderActiveTab('about')}>
                        <i className="fa-solid fa-building"></i> About Paz Thriving Tribe
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
                          <div className="speech-signature">Coach Roseline Iraoya, <br /> Lead Coach, <br /> Paz Thriving Tribe</div>
                        </div>
                      )}

                      {founderActiveTab === 'about' && (
                        <div className="about-org-block">
                          {/* <h3>About Paz Thriving Tribe</h3> */}
                          <p>
                            Paz Thriving Tribe Coaching, Mentoring and Counselling Organisation is committed to
                            impacting individuals, families, transforming teenagers, positively influencing women,
                            and helping children and young people develop the values, character, and healthy
                            habits they need to thrive and become purposeful leaders.
                          </p>
                          {/* <p className="tagline">
                            Tagline: Transforming Lives, Building Character, Raising Leaders
                          </p> */}

                        </div>
                      )}

                      {founderActiveTab === 'values' && (
                        <div className="core-values-matrix">
                          <div className="value-card-element">
                            <h5><i className="fa-solid fa-award"></i> Excellence</h5>
                            <p>We encourage individuals to give their best in every area of life, striving for continuous growth, improvement, and outstanding character.</p>
                          </div>
                          <div className="value-card-element">
                            <h5><i className="fa-solid fa-scale-balanced"></i> Integrity</h5>
                            <p>We uphold honesty, accountability, and strong moral principles, doing what is right even when no one is watching.</p>
                          </div>
                          <div className="value-card-element">
                            <h5><i className="fa-solid fa-user-gear"></i> Leadership</h5>
                            <p>We empower children, teenagers, and women to influence others positively, take responsibility, and become agents of positive change.</p>
                          </div>
                          <div className="value-card-element">
                            <h5><i className="fa-solid fa-user-lock"></i>Confidentiality</h5>
                            <p>We value trust and privacy, ensuring that every individual feels safe, respected, and secure when sharing their thoughts and experiences with us.</p>
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
                          <span className="banner-badge"><i className="fa-solid fa-bullseye" style={{ fontSize: '0.8rem' }}></i>Client Review</span>
                          <p>{slide.text}</p>
                          <div className="testimonial-author">{slide.title}</div>
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
                        <button key={i} className={`banner-dot ${i === currentPromoSlide ? 'active' : ''}`} onClick={() => setCurrentPromoSlide(i)} aria-label={`Go to slide ${i + 1}`} />
                      ))}
                    </div>
                  </div>
                </section>

                {/* Interactive Gateway Matrix */}
                <section id="services-explore" className="interactive-tabs-section">
                  <span className="section-label" data-aos="fade-up">Explore the main programs</span>
                  <h2 className="section-title-heading" data-aos="fade-right">What we offer</h2>
                  <p className="section-subtext">Choose the area that fits your current season and discover a tailored path for growth, mentoring, and support.</p>

                  <div className="services-routing-grid" data-aos="fade-up">
                    <Link to="/care-counseling" className="service-gateway-card">
                      <div>
                        <div className="gateway-icon-wrap"><i className="fa-solid fa-hand-holding-heart"></i></div>
                        <h3>Talk & Thrive</h3>
                        <p>Dedicated counseling, coaching, and emotional support services for individual, parents, teens, women, and young adults who want guidance and a safe place to grow.</p>
                      </div>
                      <div className="gateway-footer-action">Read more<i className="fa-solid fa-arrow-trend-up"></i></div>
                    </Link>

                    <Link to="/services/children" className="service-gateway-card">
                      <div>
                        <div className="gateway-icon-wrap"><i className="fa-solid fa-child-reaching"></i></div>
                        <h3>{services.children.title}</h3>
                        <p>{services.children.description}</p>
                      </div>
                      <div className="gateway-footer-action">Read more <i className="fa-solid fa-arrow-trend-up"></i></div>
                    </Link>

                    <Link to="/services/family" className="service-gateway-card">
                      <div>
                        <div className="gateway-icon-wrap"><i className="fa-solid fa-people-roof"></i></div>
                        <h3>{services.family.title}</h3>
                        <p>{services.family.description}</p>
                      </div>
                      <div className="gateway-footer-action">Read more<i className="fa-solid fa-arrow-trend-up"></i></div>
                    </Link>

                    <Link to="/services/marriage" className="service-gateway-card">
                      <div>
                        <div className="gateway-icon-wrap"><i className="fa-solid fa-heart-crack"></i></div>
                        <h3>{services.marriage.title}</h3>
                        <p>{services.marriage.description}</p>
                      </div>
                      <div className="gateway-footer-action">Read more<i className="fa-solid fa-arrow-trend-up"></i></div>
                    </Link>
                  </div>
                </section>

                {/* <section id="what-parents-will-notice" className="parent-notice-section" data-aos="fade-up">
                  <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', fontWeight: '700', color: 'var(--brand-blue)', textTransform: 'uppercase' }}>
                        <i className="fa-solid fa-eye" style={{ fontSize: '0.9rem' }}></i>
                        What Parents Will Notice
                      </span>
                      <h2 style={{ margin: '1rem auto 0 auto', fontSize: '2.7rem', lineHeight: '1.05', maxWidth: '760px' }}>An illustrated flow of the changes you will see first in your home.</h2>
                    </div>

                    <div className="parent-notice-grid">
                      {parentNoticeItems.map((item, index) => (
                        <div key={item.title} className="notice-card" data-aos="fade-up" data-aos-delay={index * 120}>
                          <div className="notice-icon-shell">
                            <i className={item.icon}></i>
                          </div>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section> */}

                <section id="video-feature" className="youtube-video-feature-section" data-aos="fade-up">
                  <div className="video-feature-grid">
                    <div className="video-feature-copy">
                      <h2>Examine your Thoughts, Words and Actions👌👌</h2>
                      <p>Your life is shaped by 3 things: your thoughts, your words, and your actions.  In this video, we break down why self-examination matters and how checking
                        these 3 areas can transform your mindset, relationships, and success.</p>
                    </div>
                    <div className="video-embed-wrap">
                      {youtubeEmbedUrl ? (
                        <iframe
                          title="Featured YouTube Playback"
                          src={normalizeYoutubeEmbed(youtubeEmbedUrl)}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div style={{ padding: '2rem', color: 'var(--text-muted)', minHeight: '240px' }}>
                          A featured YouTube video will appear here once a valid embed URL is configured in the CMS.
                        </div>
                      )}
                    </div>
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


              </div>
            }
          />

          {/* =========================================================================
             DEDICATED ROUTE PATTERNS FOR INDIVIDUAL PAGE VIEWS
             ========================================================================= */}
          <Route path="/teens-kids-academy" element={<TeensKidsMenu paystackPublicKey={paystackPublicKey} teensKidsMonthlyFee={teensKidsMonthlyFee} />} />
          <Route path="/care-counseling" element={<CareCounselingPage />} />
          <Route path="/services/:serviceSlug" element={<ServicePageWrapper services={services} programs={programs} onIntakeSubmit={handleServiceIntakeSubmit} />} />

          {/* Administrative Gateway Login */}
          <Route
            path="/admin"
            element={
              !session ? (
                <div className="auth-page-wrapper">
                  <div className="login-card-layout" data-aos="fade-up">
                    <h2 className="login-brand-title">Admin Gateway</h2>
                    {authError && <div style={{ color: '#f85149', marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: 'bold' }}>{authError}</div>}

                    <form onSubmit={handleSignIn} className="standard-login-form">
                      <div className="form-input-container">
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Admin Email Account</label>
                        <input ref={emailInputRef} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@paztribe.org" required className="plain-text-input" />
                      </div>
                      <div className="form-input-container">
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Account Password</label>
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
                    <div className="portal-sidebar-title">PTT Admin</div>
                    <nav className="portal-sidebar-links">
                      <Link to="/" className="sidebar-link-item" style={{ textDecoration: 'none' }}>← Exit to Live Website</Link>
                      <div className="sidebar-link-item active">Core Studio Engine</div>
                    </nav>
                    <button onClick={handleSignOut} className="sidebar-disconnect-btn">Logout to Sign In</button>
                  </aside>

                  <div className="portal-main-workspace">
                    <div className="portal-workspace-header-shell">
                      <header className="portal-workspace-header">
                        <div>
                          <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)' }}>Paz Tribe Dynamic Website CMS Engine</h2>
                          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Secure admin console for content, applicants, and programs.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <div style={{ background: 'var(--bg-main)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid var(--border-color)' }}>{session.user.email}</div>
                          <button onClick={handleSignOut} className="dashboard-logout-btn">Logout</button>
                        </div>
                      </header>
                    </div>

                    <AdminTabBar selectedTab={selectedAdminTab} onChangeTab={setSelectedAdminTab} />

                    <main className="portal-workspace-body-content">
                      {dashboardMessage && <div className="status-feedback-banner" style={{ marginBottom: '1.5rem' }}>{dashboardMessage}</div>}

                      {selectedAdminTab === 'content' && (
                        <section className="dashboard-editor-card">
                          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Modify Core Specialty Menus Content</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Select your menu configuration channel to synchronize text details onto deep pages dynamically.</p>

                          {cmsSuccessMessage && <div className="status-feedback-banner" style={{ marginTop: '1.5rem' }}>{cmsSuccessMessage}</div>}
                          {cmsErrorMessage && <div className="status-feedback-banner" style={{ marginTop: '1rem', color: '#842029', background: '#f8d7da', border: '1px solid #f5c2c7' }}>{cmsErrorMessage}</div>}

                          <form onSubmit={handleUpdateContentCMS} className="cms-creation-form-layout">
                            <div className="form-input-container">
                              <label style={{ color: 'var(--brand-blue)', fontWeight: '600' }}>Select Targeted Menu Category to Update</label>
                              <select value={editTarget} onChange={(e) => setEditTarget(e.target.value)} className="plain-text-input" style={{ height: '46px', border: '1px solid var(--brand-blue)' }}>
                                <option value="family">Thriving Parents</option>
                                <option value="marriage">Thriving Women</option>
                                <option value="children">Thriving Pre-teen & Teens</option>
                              </select>
                            </div>

                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Display Heading Title</label>
                              <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="plain-text-input" required />
                            </div>

                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Subtitle & Specialist Roles</label>
                              <input type="text" value={formSubtitle} onChange={(e) => setFormSubtitle(e.target.value)} className="plain-text-input" required />
                            </div>

                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Impact Score / Metric Total Text</label>
                              <input type="text" value={formMetric} onChange={(e) => setFormMetric(e.target.value)} className="plain-text-input" required />
                            </div>

                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Detailed Menu Context Description</label>
                              <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows="5" className="plain-text-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} required></textarea>
                            </div>

                            <button type="submit" className="form-submit-action-btn" style={{ maxWidth: '250px' }}>Publish Dynamic Update</button>
                          </form>

                          <div style={{ marginTop: '2rem' }}>
                            <h4 style={{ marginBottom: '0.75rem' }}>Client Testimonials (Homepage Slider)</h4>
                            <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>Add or preview client reviews shown in the homepage testimonial slider.</p>

                            {cmsSuccessMessage && <div className="status-feedback-banner" style={{ marginTop: '0.75rem' }}>{cmsSuccessMessage}</div>}
                            {cmsErrorMessage && <div className="status-feedback-banner" style={{ marginTop: '0.75rem', color: '#842029', background: '#f8d7da', border: '1px solid #f5c2c7' }}>{cmsErrorMessage}</div>}

                            <form onSubmit={handleAddTestimonial} className="cms-creation-form-layout" style={{ marginTop: '1rem' }}>
                              <div className="form-input-container">
                                <label style={{ fontWeight: '600' }}>Client / Author</label>
                                <input type="text" value={testimonialAuthor} onChange={(e) => setTestimonialAuthor(e.target.value)} className="plain-text-input" placeholder="Author name or tag" />
                              </div>
                              <div className="form-input-container">
                                <label style={{ fontWeight: '600' }}>Origin / Tag</label>
                                <input type="text" value={testimonialOrigin} onChange={(e) => setTestimonialOrigin(e.target.value)} className="plain-text-input" placeholder="e.g., Oniru Client" />
                              </div>
                              <div className="form-input-container">
                                <label style={{ fontWeight: '600' }}>Testimonial</label>
                                <textarea value={testimonialText} onChange={(e) => setTestimonialText(e.target.value)} rows="4" className="plain-text-input" style={{ resize: 'vertical' }} required />
                              </div>
                              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                                <button type="submit" className="form-submit-action-btn" style={{ maxWidth: '250px' }}>{testimonialEditIndex !== null ? 'Save Testimonial' : 'Add Testimonial'}</button>
                                {testimonialEditIndex !== null && (
                                  <button type="button" onClick={handleCancelEditTestimonial} className="form-cancel-action-btn" style={{ maxWidth: '140px' }}>Cancel</button>
                                )}
                              </div>
                            </form>

                            <div style={{ marginTop: '1.25rem' }}>
                              <h5 style={{ marginBottom: '0.6rem' }}>Current Testimonials</h5>
                              <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {promoSlides.map((t, idx) => (
                                  <div key={idx} style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <div style={{ flex: 1 }}>
                                      <strong style={{ display: 'block' }}>{t.title}</strong>
                                      <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>{t.text.slice(0, 220)}{t.text.length > 220 ? '…' : ''}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                      <button onClick={() => handleStartEditTestimonial(idx)} className="form-submit-action-btn" style={{ padding: '0.45rem 0.7rem' }}>Edit</button>
                                      <button onClick={() => handleDeleteTestimonial(idx)} className="form-cancel-action-btn" style={{ padding: '0.45rem 0.7rem' }}>Delete</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </section>
                      )}

                      {selectedAdminTab === 'social' && (
                        <section className="dashboard-editor-card">
                          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Social Media Preview Editor</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Update the featured social card content and YouTube playback URL displayed on the homepage.</p>

                          {cmsSuccessMessage && <div className="status-feedback-banner" style={{ marginTop: '1.5rem' }}>{cmsSuccessMessage}</div>}
                          {cmsErrorMessage && <div className="status-feedback-banner" style={{ marginTop: '1rem', color: '#842029', background: '#f8d7da', border: '1px solid #f5c2c7' }}>{cmsErrorMessage}</div>}

                          <form onSubmit={handleUpdateSocialPreview} className="cms-creation-form-layout" style={{ marginTop: '1.5rem' }}>
                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Select Social Platform</label>
                              <select value={socialEditTarget} onChange={(e) => setSocialEditTarget(e.target.value)} className="plain-text-input" style={{ height: '46px' }}>
                                {socialNewsFeed.map((item) => (
                                  <option key={item.platform} value={item.platform}>{item.platform}</option>
                                ))}
                              </select>
                            </div>

                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Social Preview Headline</label>
                              <input type="text" value={socialPreviewTitle} onChange={(e) => setSocialPreviewTitle(e.target.value)} className="plain-text-input" required />
                            </div>

                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Preview Description</label>
                              <textarea value={socialPreviewSummary} onChange={(e) => setSocialPreviewSummary(e.target.value)} rows="4" className="plain-text-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} required />
                            </div>

                            <div className="form-input-container" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontWeight: '600' }}>Action Link URL</label>
                                <input type="url" value={socialPreviewUrl} onChange={(e) => setSocialPreviewUrl(e.target.value)} className="plain-text-input" required />
                              </div>
                              <button type="button" onClick={fetchSocialUrlMetadata} className="form-submit-action-btn" style={{ minWidth: '220px' }} disabled={!socialPreviewUrl || socialMetadataLoading}>
                                {socialMetadataLoading ? 'Fetching...' : 'Fetch details from URL'}
                              </button>
                            </div>

                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Post Timestamp</label>
                              <input type="text" value={socialPreviewTimestamp} onChange={(e) => setSocialPreviewTimestamp(e.target.value)} className="plain-text-input" placeholder="Posted 4 hours ago" />
                            </div>

                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Badge Label</label>
                              <input type="text" value={socialPreviewBadgeText} onChange={(e) => setSocialPreviewBadgeText(e.target.value)} className="plain-text-input" required />
                            </div>

                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>YouTube Embed URL</label>
                              <input type="url" value={socialPreviewEmbedUrl} onChange={(e) => setSocialPreviewEmbedUrl(e.target.value)} className="plain-text-input" placeholder="https://www.youtube.com/watch?v=..." />
                              <small style={{ color: 'var(--text-muted)' }}>This URL will be used for the homepage video player when YouTube is selected.</small>
                            </div>

                            <button type="submit" className="form-submit-action-btn" style={{ maxWidth: '250px' }}>Update Social Preview</button>
                          </form>
                        </section>
                      )}

                      {selectedAdminTab === 'programs' && (
                        <section className="dashboard-editor-card">
                          <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>Create Programs</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Add new curriculum offerings for any service category and make them available on the customer-facing pages.</p>

                          <form onSubmit={handleCreateProgram} className="cms-creation-form-layout" style={{ marginTop: '1.5rem' }}>
                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Service Category</label>
                              <select value={programForm.service} onChange={(e) => setProgramForm((prev) => ({ ...prev, service: e.target.value }))} className="plain-text-input" style={{ height: '46px' }}>
                                <option value="family">Thriving Parents</option>
                                <option value="marriage">Thriving Women</option>
                                <option value="children">Thriving Pre-teen & Teens</option>
                              </select>
                            </div>

                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Program Name</label>
                              <input type="text" value={programForm.title} onChange={(e) => setProgramForm((prev) => ({ ...prev, title: e.target.value }))} className="plain-text-input" required />
                            </div>

                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Program Level / Age Group</label>
                              <input type="text" value={programForm.level} onChange={(e) => setProgramForm((prev) => ({ ...prev, level: e.target.value }))} className="plain-text-input" required />
                            </div>

                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Duration</label>
                              <input type="text" value={programForm.duration} onChange={(e) => setProgramForm((prev) => ({ ...prev, duration: e.target.value }))} className="plain-text-input" required />
                            </div>

                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Schedule</label>
                              <input type="text" value={programForm.schedule} onChange={(e) => setProgramForm((prev) => ({ ...prev, schedule: e.target.value }))} className="plain-text-input" required />
                            </div>

                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Program Overview</label>
                              <textarea value={programForm.description} onChange={(e) => setProgramForm((prev) => ({ ...prev, description: e.target.value }))} rows="4" className="plain-text-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} required></textarea>
                            </div>

                            <button type="submit" className="form-submit-action-btn" style={{ maxWidth: '250px' }}>Create Program</button>
                          </form>

                          <div style={{ marginTop: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Programs by Category</h4>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                              {programs.map((program) => (
                                <div key={program.id} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
                                    <div>
                                      <strong>{program.name}</strong>
                                      <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{program.service.toUpperCase()}</div>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveProgram(program.id)} style={{ background: '#ff4757', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.55rem 0.85rem', cursor: 'pointer' }}>Remove</button>
                                  </div>
                                  <p style={{ margin: '0.85rem 0 0 0', color: 'var(--text-muted)' }}>{program.description}</p>
                                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                                    <span>{program.duration}</span>
                                    <span>{program.level}</span>
                                    <span>{program.schedule}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </section>
                      )}

                      {selectedAdminTab === 'applicants' && (
                        <section className="dashboard-editor-card">
                          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                            <div>
                              <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>Recent Applicants</h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Review the latest intake submissions and track their requested service path.</p>
                            </div>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 700, minWidth: '150px' }}>
                              Total Registered: {applicants.length}
                            </div>
                          </div>

                          {applicants.length === 0 ? (
                            <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                              <p style={{ margin: 0, color: 'var(--text-muted)' }}>No applicants have submitted yet.</p>
                            </div>
                          ) : (
                            <div className="applicants-table-wrapper">
                              <table className="dashboard-table">
                                <thead>
                                  <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Track</th>
                                    <th>Status</th>
                                    <th>Payment Ref</th>
                                    <th>Submitted</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {applicants.slice(0, 50).map((applicant) => (
                                    <tr key={applicant.id}>
                                      <td>{applicant.fullName}</td>
                                      <td>{applicant.email}</td>
                                      <td>{applicant.phone}</td>
                                      <td>{applicant.track}</td>
                                      <td><span className={`status-pill ${applicant.paymentStatus === 'success' ? 'success' : 'pending'}`}>{applicant.paymentStatus}</span></td>
                                      <td>{applicant.paymentReference || 'N/A'}</td>
                                      <td>{new Date(applicant.submittedAt).toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </section>
                      )}

                      {selectedAdminTab === 'payments' && (
                        <section className="dashboard-editor-card">
                          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Paystack Payment Settings</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Configure your Paystack API key and pricing for Pre-teen & Teens Academy program.</p>

                          {dashboardMessage && <div className="status-feedback-banner" style={{ marginTop: '1.5rem' }}>{dashboardMessage}</div>}

                          <form onSubmit={(e) => {
                            e.preventDefault();
                            setPaystackPublicKey(tempPaystackKey);
                            setTeensKidsMonthlyFee(parseInt(tempMonthlyFee) || 10000);
                            setDashboardMessage('✓ Payment settings saved successfully!');
                            setTimeout(() => setDashboardMessage(null), 3000);
                          }} style={{ marginTop: '1.5rem' }}>
                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Paystack Public Key</label>
                              <input
                                type="text"
                                value={tempPaystackKey}
                                onChange={(e) => setTempPaystackKey(e.target.value)}
                                className="plain-text-input"
                                placeholder="pk_live_... or pk_test_..."
                                required
                              />
                              <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                                Your Paystack public API key. Switch between test and live keys as needed.
                              </small>
                            </div>

                            <div className="form-input-container">
                              <label style={{ fontWeight: '600' }}>Program Registration Fee (NGN)</label>
                              <input
                                type="number"
                                value={tempMonthlyFee}
                                onChange={(e) => setTempMonthlyFee(e.target.value)}
                                className="plain-text-input"
                                placeholder="10000"
                                min="1000"
                                max="1000000"
                                required
                              />
                              <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                                Update the academy registration fee for the Pre-teen & Teens program. This value drives the displayed pricing for clients.
                              </small>
                            </div>

                            <button
                              type="submit"
                              className="form-submit-action-btn"
                              style={{ marginTop: '1.5rem', width: '100%', maxWidth: '200px' }}
                            >
                              Save Payment Settings
                            </button>
                          </form>

                          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>Current Configuration</h4>
                            <div style={{ display: 'grid', gap: '0.75rem', color: 'var(--text-muted)' }}>
                              <span><strong>Active Public Key:</strong> {paystackPublicKey.substring(0, 20)}...</span>
                              <span><strong>Monthly Fee:</strong> ₦{teensKidsMonthlyFee.toLocaleString()}</span>
                              <span><strong>3 Months:</strong> ₦{(teensKidsMonthlyFee * 3).toLocaleString()}</span>
                              <span><strong>6 Months:</strong> ₦{(teensKidsMonthlyFee * 6).toLocaleString()}</span>
                              <span><strong>12 Months:</strong> ₦{(teensKidsMonthlyFee * 12).toLocaleString()}</span>
                            </div>
                          </div>
                        </section>
                      )}
                    </main>
                  </div>
                </div>
              ) : (
                <Navigate to="/admin" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Multi-Column Footer Component */}
        <footer className="workspace-fluid-footer">
          <div className="footer-columns-container">
            <div className="footer-brand-column">
              <Link to="/" className="footer-brand-logo-row" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="footer-vector-badge"><img src={theme === 'dark' ? "../logo/logo2.jpeg" : "../logo/logomain.png"} alt="Paz Thriving Tribe logo" className="nav-logo-img" /></div>
                <span className="footer-brand-headline">Paz Thriving Tribe</span>
              </Link>
              <p>Paz Thriving Tribe Coaching, Mentoring and Counselling Organisation is committed to
                impacting individuals, families, transforming teenagers, positively influencing women,
                and helping children and young people develop the values, character, and healthy
                habits they need to thrive and become purposeful leaders.</p>
            </div>

            <div className="footer-links-column">
              <h4>What we offer</h4>
              <div className="footer-interactive-links">
                <Link to="/care-counseling" className="footer-nav-anchor">Talk & Thrive</Link>
                <Link to="/services/children" className="footer-nav-anchor">Thriving Pre-teens & Teens</Link>
                <Link to="/services/family" className="footer-nav-anchor">Thriving Parents</Link>
                <Link to="/services/marriage" className="footer-nav-anchor">Thriving Women</Link>
              </div>
            </div>

            <div className="footer-links-column">
              <h4>Portals</h4>
              <div className="footer-interactive-links">
                <Link to="https://pazthrivingtribe.schoolsfocus.net/signin" className="footer-nav-anchor">Academy Portal</Link>
              </div>
            </div>

            <div className="footer-links-column">
              <h4>Inquiries</h4>
              <div className="footer-interactive-links">
                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}><i className="fa-solid fa-location-dot" style={{ marginRight: '5px' }}></i> Lagos Main Campus, Nigeria</span>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}><i className="fa-solid fa-envelope" style={{ marginRight: '5px' }}></i> support@paztribe.org</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom-copyright-strip">
            <p>&copy; 2026 Paz Thriving Tribe.</p>
            <div className="footer-regulatory-tags">
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Privacy</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>System Terms</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// =========================================================================
// SERVICE ROUTE VIEWS CONTROLLER (WITH INNER TOPIC SLIDER BANNER)
// =========================================================================
function ServicePageWrapper({ services, programs, onIntakeSubmit }) {
  const { serviceSlug } = useParams();
  const [success, setSuccess] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formConcern, setFormConcern] = useState('');
  const activeService = services[serviceSlug];

  const availablePrograms = programs.filter((program) => program.service === serviceSlug);
  const servicePrograms = {
    title: availablePrograms.length > 0 ? `${activeService.title} Programs` : "Available Programs",
    classes: availablePrograms.length > 0 ? availablePrograms.map((program) => ({
      id: program.id,
      name: program.name,
      duration: program.duration,
      level: program.level,
      time: program.schedule,
      description: program.description
    })) : []
  };

  // Specific image portfolios for sub-page banners to loop through dynamically
  const subPageBannerSlides = {
    family: [
      {
        image: "https://images.unsplash.com/photo-1542037104857-ffbe0ba8309e?q=80&w=1200",
        eyebrow: "Support for every stage of growth",
        title: "A calm, encouraging space for women and families",
        text: "Step into a supportive experience designed to help you build clarity, confidence, and practical direction in everyday life."
      },
      {
        image: "https://images.unsplash.com/photo-1609234656388-0ff363383899?q=80&w=1200",
        eyebrow: "Purposeful guidance",
        title: "Navigate life transitions with confidence",
        text: "Our coaching and mentoring approach helps you move forward with a clearer mind, stronger habits, and a grounded sense of purpose."
      },
      {
        image: "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?q=80&w=1200",
        eyebrow: "Growth that feels personal",
        title: "Practical support for real-life challenges",
        text: "From communication to strengthening your values, each session is crafted to meet you where you are and guide you forward."
      }
    ],
    marriage: [
      {
        image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1200",
        eyebrow: "Women’s community and wellness",
        title: "A trusted place to connect, reflect, and thrive",
        text: "This space gives women a welcoming environment for personal growth, emotional support, shared learning, and renewed confidence."
      },
      {
        image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200",
        eyebrow: "Mentoring and encouragement",
        title: "Build relationships that support your next season",
        text: "Explore practical guidance for self-worth, family connection, leadership, and the confidence to move forward with intention."
      },
      {
        image: "https://images.unsplash.com/photo-1621478378722-43c34346ef26?q=80&w=1200",
        eyebrow: "Empowerment in practice",
        title: "Grow into your best self with steady support",
        text: "Every conversation is designed to help you feel heard, uplifted, and equipped to create meaningful progress in your life."
      }
    ],
    children: [
      {
        image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1200",
        eyebrow: "For teens, parents, and young leaders",
        title: "A direct, reassuring guide for young people and families",
        text: "Our programs help children and teens build confidence, resilience, and healthy habits through consistent mentoring support."
      },
      {
        image: "https://images.unsplash.com/photo-1484662021356-799479afd455?q=80&w=1200",
        eyebrow: "Mentorship that feels alive",
        title: "Strengthen focus, confidence, and character",
        text: "We help young people develop the mindset and skills they need to grow, communicate better, and thrive in life."
      },
      {
        image: "https://images.unsplash.com/photo-1471286174243-e7a4d9afb34a?q=80&w=1200",
        eyebrow: "Support that keeps moving",
        title: "Practical learning with a warm, encouraging tone",
        text: "From workshops to one-on-one support, every opportunity is meant to help young people move forward with clarity and purpose."
      }
    ]
  }[serviceSlug] || [];

  useEffect(() => {
    window.scrollTo(0, 0);
    AOS.refresh();
    setActiveSlideIndex(0); // Reset when category changes
  }, [serviceSlug]);

  // Handle automatic cycling of the service page banner gallery
  useEffect(() => {
    if (subPageBannerSlides.length === 0) return;
    const serviceBannerInterval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % subPageBannerSlides.length);
    }, 9000);
    return () => clearInterval(serviceBannerInterval);
  }, [subPageBannerSlides]);

  const handleEnrollClass = (classItem) => {
    if (!enrolledClasses.find(c => c.id === classItem.id)) {
      setEnrolledClasses([...enrolledClasses, classItem]);
    }
  };

  const handleRemoveEnrollment = (classId) => {
    setEnrolledClasses(enrolledClasses.filter(c => c.id !== classId));
  };

  if (!activeService) {
    return <Navigate to="/" replace />;
  }

  const subPageMeta = {
    family: {
      newsTitle: "Thriving Parents Update",
      newsText: "New empowerment guide released: 'Building Confidence & Purpose as an Independent Woman'.",
      formSub: "Schedule Your Personal Development Consultation"
    },
    marriage: {
      newsTitle: "Women Tribe Connection Brief",
      newsText: "Upcoming Women's Empowerment Circle meeting scheduled for next month with guest speakers on leadership and sisterhood.",
      formSub: "Join the Thriving Women Community"
    },
    children: {
      newsTitle: "Thriving Pre-teen & Teens Monitor",
      newsText: "Cognitive stability milestone tracking update released for one-on-one pre-teen and adolescent mentorship program platforms.",
      formSub: "Enroll Child / Teenager into Thriving Pre-teen & Teens"
    }
  }[serviceSlug];

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (onIntakeSubmit) {
      await onIntakeSubmit({
        fullName: formName,
        email: formEmail,
        phone: '',
        track: serviceSlug,
        message: formConcern,
        passportFile: formPassportFile,
        documentFile: formDocumentFile
      });
    }
    setSuccess(true);
    setFormName('');
    setFormEmail('');
    setFormConcern('');
    setFormPassportFile(null);
    setFormDocumentFile(null);
    setTimeout(() => setSuccess(false), 5000);
  };

  const currentBannerSlide = subPageBannerSlides[activeSlideIndex] || null;

  return (
    <div className="public-website-container">
      {/* DYNAMIC SLIDING TOPIC BANNER */}
      <section className="service-view-hero-banner">
        <div
          className="service-banner-bg"
          style={{ backgroundImage: `url(${currentBannerSlide?.image || ''})` }}
        />
        <div className="service-banner-content" key={activeSlideIndex}>
          <span
            className="section-label"
            style={{ color: '#ffffff', textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0, 0, 0, 0.65)' }}
          >
            {currentBannerSlide?.eyebrow || activeService.title}
          </span>
          <h1 data-aos="zoom-in">{currentBannerSlide?.title || activeService.title}</h1>
          <p data-aos="fade-up" data-aos-delay="100">{currentBannerSlide?.text || activeService.subtitle}</p>
          <div className="service-banner-controls">
            <button
              type="button"
              className="service-banner-btn"
              aria-label="Previous slide"
              onClick={() => setActiveSlideIndex((prev) => (prev - 1 + subPageBannerSlides.length) % subPageBannerSlides.length)}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            {subPageBannerSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`service-banner-dot ${index === activeSlideIndex ? 'active' : ''}`}
                aria-label={`Show slide ${index + 1}`}
                onClick={() => setActiveSlideIndex(index)}
              />
            ))}
            <button
              type="button"
              className="service-banner-btn"
              aria-label="Next slide"
              onClick={() => setActiveSlideIndex((prev) => (prev + 1) % subPageBannerSlides.length)}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
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
                    <input type="text" required placeholder="John Doe" value={formName} onChange={(e) => setFormName(e.target.value)} className="plain-text-input" />
                  </div>
                  <div className="form-input-container">
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Email Address</label>
                    <input type="email" required placeholder="johndoe@example.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="plain-text-input" />
                  </div>
                </div>
                <div className="form-input-container">
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Specific Primary Concern Context / Program Interest</label>
                  <textarea rows="4" required placeholder="Provide brief summary details..." value={formConcern} onChange={(e) => setFormConcern(e.target.value)} className="plain-text-input" style={{ resize: 'vertical' }}></textarea>
                </div>
                <div className="form-input-container">
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Passport Photo (jpg/png)</label>
                  <input type="file" accept="image/*" onChange={(e) => setFormPassportFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} className="plain-text-input" />
                </div>
                <div className="form-input-container">
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Supporting Document (PDF/DOC)</label>
                  <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*" onChange={(e) => setFormDocumentFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} className="plain-text-input" />
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

      {/* AVAILABLE CLASSES & ENROLLMENT SECTION */}
      <section style={{ padding: '4rem 2rem', backgroundColor: 'var(--bg-card)', marginTop: '3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '2.2rem', fontWeight: '800', textAlign: 'center' }} data-aos="fade-down">
            <i className="fa-solid fa-graduation-cap" style={{ marginRight: '0.5rem', color: 'var(--accent-primary)' }}></i>
            {servicePrograms.title}
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }} data-aos="fade-up">
            Explore our comprehensive curriculum designed specifically for {activeService.title.toLowerCase()}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {servicePrograms.classes.map((classItem, idx) => (
              <div
                key={classItem.id}
                className="enrollment-class-card"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                style={{
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--accent-green)',
                    color: 'white',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    {classItem.level}
                  </span>
                </div>

                <h4 style={{ marginBottom: '0.8rem', fontWeight: '700', fontSize: '1.1rem', lineHeight: '1.4' }}>
                  {classItem.name}
                </h4>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  flexGrow: 1
                }}>
                  <div><i className="fa-solid fa-calendar" style={{ marginRight: '0.5rem', color: 'var(--accent-green)' }}></i> {classItem.duration}</div>
                  <div><i className="fa-solid fa-clock" style={{ marginRight: '0.5rem', color: 'var(--accent-green)' }}></i> {classItem.time}</div>
                </div>

                <button
                  onClick={() => handleEnrollClass(classItem)}
                  disabled={enrolledClasses.some(c => c.id === classItem.id)}
                  style={{
                    padding: '0.8rem 1.2rem',
                    backgroundColor: enrolledClasses.some(c => c.id === classItem.id) ? 'var(--text-muted)' : 'var(--accent-green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: enrolledClasses.some(c => c.id === classItem.id) ? 'default' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: enrolledClasses.some(c => c.id === classItem.id) ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!enrolledClasses.some(c => c.id === classItem.id)) {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = enrolledClasses.some(c => c.id === classItem.id) ? '0.6' : '1';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <i className={`fa-solid ${enrolledClasses.some(c => c.id === classItem.id) ? 'fa-check' : 'fa-plus'}`} style={{ marginRight: '0.5rem' }}></i>
                  {enrolledClasses.some(c => c.id === classItem.id) ? 'Enrolled' : 'Enroll Now'}
                </button>
              </div>
            ))}
          </div>

          {/* ENROLLMENT SUMMARY SECTION */}
          {enrolledClasses.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '2px solid var(--accent-green)',
                borderRadius: '12px',
                padding: '2rem',
                marginTop: '2rem'
              }}
              data-aos="zoom-in"
            >
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <i className="fa-solid fa-bookmark" style={{ marginRight: '0.8rem', color: 'var(--accent-green)', fontSize: '1.4rem' }}></i>
                Your Enrollment Summary ({enrolledClasses.length} classe{enrolledClasses.length !== 1 ? 's' : ''})
              </h3>

              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                {enrolledClasses.map((enrolled) => (
                  <div
                    key={enrolled.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '8px',
                      borderLeft: '4px solid var(--accent-green)'
                    }}
                  >
                    <div>
                      <h5 style={{ marginBottom: '0.3rem', fontWeight: '700' }}>{enrolled.name}</h5>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-calendar-check" style={{ marginRight: '0.4rem' }}></i>
                        {enrolled.time}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveEnrollment(enrolled.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#ff4757',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <i className="fa-solid fa-trash"></i> Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  alert(`Enrolled in ${enrolledClasses.length} classe${enrolledClasses.length !== 1 ? 's' : ''}:\n\n${enrolledClasses.map(c => c.name).join('\n')}\n\nPlease check your email for confirmation details.`);
                  setEnrolledClasses([]);
                }}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: 'var(--accent-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <i className="fa-solid fa-paper-plane" style={{ marginRight: '0.8rem' }}></i>
                Confirm & Submit Enrollments
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CareCounselingPage() {
  const counselingHeroSlides = [
    {
      eyebrow: 'Talk & Thrive',
      title: 'A calm, respectful place to talk and grow',
      text: 'For parents, teens, women, and young adults who want guidance, encouragement, and a trusted place to be heard.',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200'
    },
    {
      eyebrow: 'Emotional support',
      title: 'Find clarity and practical next steps',
      text: 'This space is designed to help you work through stress, life transitions, relationships, and personal challenges with dignity and confidence.',
      image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200'
    },
    {
      eyebrow: 'Coaching and mentoring',
      title: 'Support that feels direct, warm, and empowering',
      text: 'The goal is simple: help every client feel supported, understood, and ready to move forward with practical guidance.',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200'
    }
  ];

  const directMessagePoints = [
    'If you are looking for a safe, respectful place to talk, we are here for you.',
    'You do not have to carry stress, confusion, or emotional strain alone.',
    'Book a session with our inhouse counselor today!'
  ];

  const serviceAreas = [
    'Stress and overwhelm',
    'Parenting challenges',
    'Teen behavioral concerns',
    'Self-esteem issues',
    'Relationship struggles',
    'Life transitions',
    'Purpose and direction',
    'Emotional wellbeing'
  ];

  const careFocusSlides = [
    {
      eyebrow: 'What this service is for',
      title: 'A calm space for guidance, reassurance, and practical next steps',
      description: 'This section brings the core message together in one place so clients can quickly understand how support works and what to expect.',
      items: directMessagePoints,
      badge: 'Core message'
    },
    {
      eyebrow: 'Who it is for',
      title: 'Built for parents, teens, women, and young adults',
      description: 'We tailor our support to people navigating stress, emotional strain, and life changes who need a respectful and approachable space.',
      items: [
        'Parents who need guidance and emotional support.',
        'Teenagers who need a trusted space to speak openly.',
        'Women and young adults seeking clarity, confidence, and direction.'
      ],
      badge: 'Client fit'
    },
    {
      eyebrow: 'What we help with',
      title: 'Support for real challenges, not just surface concerns',
      description: 'The focus is on practical emotional wellbeing, healthy relationships, and steady progress in everyday life.',
      items: serviceAreas,
      badge: 'Common focus areas'
    }
  ];

  const sessionStructure = [
    { label: 'Discovery Session', detail: 'A first conversation to understand the person\'s needs (30 minutes).' },
    { label: 'Standard Counseling Session', detail: 'Listening, reflection, guidance, and action points (60 minutes).' },
    { label: 'Follow-Up Sessions', detail: 'Progress review, accountability, and continued support.' }
  ];

  const bookingSteps = [
    'Book a session via WhatsApp, Google Form, or the website.',
    'Complete a confidential intake form.',
    'Select a physical or virtual session.',
    'Attend your session and begin the support process.'
  ];

  const [activeCounselingSlide, setActiveCounselingSlide] = useState(0);
  const [activeCareFocusIndex, setActiveCareFocusIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    clientType: 'Individual',
    sessionType: 'Virtual',
    preferredTime: 'Any time',
    concern: ''
  });
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const currentCareFocusSlide = careFocusSlides[activeCareFocusIndex];

  const handleBookingSubmit = async (event) => {
    event.preventDefault();

    const message = [
      `Client type: ${bookingForm.clientType}`,
      `Session type: ${bookingForm.sessionType}`,
      `Preferred time: ${bookingForm.preferredTime}`,
      `Concern: ${bookingForm.concern}`
    ].join(' | ');

    try {
      const { error } = await supabase.from('tribe_applicants').insert([{
        full_name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        track: 'talk-thrive',
        message
      }]);

      if (error) throw error;

      setBookingSubmitted(true);
      setBookingForm({ name: '', email: '', phone: '', clientType: 'Individual', sessionType: 'Virtual', preferredTime: 'Any time', concern: '' });
    } catch (err) {
      console.error('Talk & Thrive booking submission failed:', err);
      setBookingSubmitted(false);
      alert('We could not save your booking right now. Please try again shortly.');
    }
  };

  useEffect(() => {
    const counselingInterval = setInterval(() => {
      setActiveCounselingSlide((prev) => (prev + 1) % counselingHeroSlides.length);
    }, 9000);

    return () => clearInterval(counselingInterval);
  }, [counselingHeroSlides.length]);

  useEffect(() => {
    const careFocusInterval = setInterval(() => {
      setActiveCareFocusIndex((prev) => (prev + 1) % careFocusSlides.length);
    }, 9000);

    return () => clearInterval(careFocusInterval);
  }, [careFocusSlides.length]);

  return (
    <div className="public-website-container">
      <style>{`
        .talk-thrive-booking-backdrop {
          position: fixed;
          inset: 0;
          background: linear-gradient(145deg, rgba(2, 6, 23, 0.82), rgba(15, 23, 42, 0.82));
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 1100;
        }

        .talk-thrive-booking-card {
          width: 100%;
          max-width: 860px;
          border-radius: 24px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96));
          border: 1px solid rgba(148, 163, 184, 0.22);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.35);
          padding: 1.1rem;
          max-height: 92vh;
          overflow-y: auto;
        }

        .talk-thrive-booking-card .care-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(16, 185, 129, 0.12));
          border: 1px solid rgba(148, 163, 184, 0.25);
          color: var(--text-primary);
        }

        .talk-thrive-modal-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .talk-thrive-note-card {
          display: grid;
          gap: 0.35rem;
          padding: 0.9rem;
          border-radius: 16px;
          background: linear-gradient(145deg, rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.92));
          border: 1px solid rgba(148, 163, 184, 0.24);
        }

        .talk-thrive-note-card strong {
          color: var(--text-primary);
          font-size: 0.92rem;
        }

        .talk-thrive-note-card span {
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.35;
        }

        .talk-thrive-modal-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 0.85rem;
        }

        .talk-thrive-modal-actions button {
          flex: 1 1 auto;
          min-width: 180px;
        }

        @media (max-width: 768px) {
          .talk-thrive-booking-card {
            border-radius: 18px;
            padding: 0.95rem;
          }

          .talk-thrive-modal-grid {
            grid-template-columns: 1fr;
          }

          .talk-thrive-modal-actions {
            flex-direction: column-reverse;
          }

          .talk-thrive-modal-actions button {
            width: 100%;
            min-width: 0;
          }
        }

        @media (max-width: 480px) {
          .talk-thrive-booking-card h3 {
            font-size: 1.06rem;
          }

          .talk-thrive-booking-card p {
            font-size: 0.95rem;
          }

          .talk-thrive-note-card {
            padding: 0.75rem;
          }
        }
      `}</style>
      <section className="service-view-hero-banner" data-aos="fade-up" style={{ minHeight: '460px', marginTop: '0.75rem' }}>
        <div
          className="service-banner-bg"
          style={{ backgroundImage: `url(${counselingHeroSlides[activeCounselingSlide].image})` }}
        />
        <div className="service-banner-content" key={activeCounselingSlide}>
          <span
            className="section-label"
            style={{ color: '#ffffff', textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0, 0, 0, 0.65)' }}
          >
            {counselingHeroSlides[activeCounselingSlide].eyebrow}
          </span>
          <h1>{counselingHeroSlides[activeCounselingSlide].title}</h1>
          <p>{counselingHeroSlides[activeCounselingSlide].text}</p>
          <div className="service-banner-controls">
            <button
              type="button"
              className="service-banner-btn"
              onClick={() => setActiveCounselingSlide((prev) => (prev - 1 + counselingHeroSlides.length) % counselingHeroSlides.length)}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            {counselingHeroSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`service-banner-dot ${index === activeCounselingSlide ? 'active' : ''}`}
                aria-label={`Show slide ${index + 1}`}
                onClick={() => setActiveCounselingSlide(index)}
              />
            ))}
            <button
              type="button"
              className="service-banner-btn"
              onClick={() => setActiveCounselingSlide((prev) => (prev + 1) % counselingHeroSlides.length)}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      <section className="care-counseling-section" data-aos="fade-up" style={{ paddingTop: '1rem' }}>
        <div className="care-counseling-shell">
          <div className="care-intro-block">
            <span className="section-label">Talk & Thrive</span>
            <h1 className="section-title-heading" style={{ textAlign: 'left', marginBottom: '0.2rem' }}>Support that feels calm, confidential, and practical.</h1>
            <p className="section-subtext" style={{ textAlign: 'left', marginBottom: '0', fontSize: '1rem' }}>
              Talk & Thrive Sessions provide a safe, confidential, and supportive space where you can freely express yourself, share your burdens and gain clarity
            </p>
          </div>

          <div className="care-section-block">
            <div className="care-animated-grid">
              <article className="care-animated-box" data-aos="fade-up" data-aos-delay="100">
                <span className="care-pill">Support</span>
                <h3>Guidance for real-life pressure</h3>
                <p>Our Talk & Thrive session offers a confidential and warm space to onboarding and hear our clients out.</p>
              </article>
              <article className="care-animated-box" data-aos="fade-up" data-aos-delay="180">
                <span className="care-pill">Approach</span>
                <h3>Warm, practical, and personal</h3>
                <p>Every session is designed to help clients feel heard, encouraged, and better equipped.</p>
              </article>
              <article className="care-animated-box" data-aos="fade-up" data-aos-delay="260">
                <span className="care-pill">Outcome</span>
                <h3>Support that strengthens the whole journey</h3>
                <p>Emotion Relief, Clarity, Practical Guidance, Renewed Confidence, Peace and a clear path forward.</p>
              </article>
            </div>
          </div>

          <div className="care-section-block">
            <article className="care-counseling-card care-animated-box" data-aos="fade-up" data-aos-delay="320" style={{ borderRadius: '20px' }}>
              <span className="care-pill">Why it matters</span>
              <h3>Support that feels steady, confidential, personal, and practical</h3>
              <p style={{ marginBottom: '0.95rem' }}>
                Whether you are managing stress, family pressure, or a life transition, our counseling support is designed to help you feel heard, calm, and confident about your next step.
              </p>

              {/* <div className="why-it-matters-grid">
                <article className="why-it-matters-card" data-aos="fade-up" data-aos-delay="120">
                  <span className="why-it-matters-icon">01</span>
                  <h4>Gentle guidance</h4>
                  <p>Clear, respectful support for emotional strain, uncertainty, and everyday pressure.</p>
                </article>
                <article className="why-it-matters-card" data-aos="fade-up" data-aos-delay="220">
                  <span className="why-it-matters-icon">02</span>
                  <h4>Practical next steps</h4>
                  <p>Tools and reflection that help you move forward with confidence and calm.</p>
                </article>
                <article className="why-it-matters-card" data-aos="fade-up" data-aos-delay="320">
                  <span className="why-it-matters-icon">03</span>
                  <h4>Client-centered care</h4>
                  <p>A professional experience shaped around dignity, trust, and a steady path to growth.</p>
                </article>
              </div> */}
            </article>
          </div>

          <div className="care-section-block">
            <article className="care-counseling-card care-animated-box care-focus-surface" data-aos="fade-up" data-aos-delay="380" style={{ borderRadius: '20px' }}>
              <div className="care-focus-header">
                <div className="care-focus-copy">
                  <span className="care-pill">{currentCareFocusSlide.badge}</span>
                  <p className="care-focus-helper" style={{ marginBottom: '0.25rem' }}>{currentCareFocusSlide.eyebrow}</p>
                  <h3 style={{ marginBottom: '0.45rem' }}>{currentCareFocusSlide.title}</h3>
                  <p>{currentCareFocusSlide.description}</p>
                </div>
                <div className="care-focus-actions" aria-label="Focus slider controls">
                  <button
                    type="button"
                    className="care-focus-btn"
                    onClick={() => setActiveCareFocusIndex((prev) => (prev - 1 + careFocusSlides.length) % careFocusSlides.length)}
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  {careFocusSlides.map((slide, index) => (
                    <button
                      key={slide.eyebrow}
                      type="button"
                      className={`care-focus-dot ${index === activeCareFocusIndex ? 'active' : ''}`}
                      aria-label={`Show ${slide.eyebrow} slide`}
                      onClick={() => setActiveCareFocusIndex(index)}
                    />
                  ))}
                  <button
                    type="button"
                    className="care-focus-btn"
                    onClick={() => setActiveCareFocusIndex((prev) => (prev + 1) % careFocusSlides.length)}
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>

              <div className="care-services-strip" style={{ marginTop: '1rem' }}>
                {currentCareFocusSlide.items.map((item, index) => (
                  <article key={`${item}-${index}`} className="care-mini-card" data-aos="fade-up" data-aos-delay="120">
                    {item}
                    {item === 'Book a session with our inhouse counselor today!' && (
                      <button
                        type="button"
                        className="form-submit-action-btn"
                        style={{ width: '100%', marginTop: '0.9rem' }}
                        onClick={() => {
                          setBookingSubmitted(false);
                          setIsBookingModalOpen(true);
                        }}
                      >
                        Book Now
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </article>
          </div>

          {isBookingModalOpen && (
            <div
              className="talk-thrive-booking-backdrop"
              onClick={() => setIsBookingModalOpen(false)}
            >
              <article
                className="talk-thrive-booking-card"
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.6rem' }}>
                  <div>
                    <span className="care-pill">Talk & Thrive booking</span>
                    <h3 style={{ margin: '0.35rem 0 0.35rem', fontSize: '1.35rem' }}>Request a counseling session</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Share your details here and your request will be captured in the admin dashboard for follow-up.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    style={{
                      border: '1px solid var(--border-color)',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      borderRadius: '999px',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                    aria-label="Close booking form"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>

                <div className="talk-thrive-note-card" style={{ marginBottom: '1rem' }}>
                  <strong>What happens next?</strong>
                  <span>We capture your request in the same applicant flow used by the admin dashboard and contact you through the details you provide.</span>
                </div>

                {bookingSubmitted ? (
                  <div className="status-feedback-banner" style={{ marginTop: '0.5rem' }}>
                    <i className="fa-solid fa-circle-check"></i> Your booking request has been saved and sent to the admin dashboard for follow-up.
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="cms-creation-form-layout" style={{ marginTop: '0.5rem' }}>
                    <div className="talk-thrive-modal-grid">
                      <div className="form-input-container">
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Full Name</label>
                        <input type="text" required value={bookingForm.name} onChange={(e) => setBookingForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Enter your full name" className="plain-text-input" />
                      </div>
                      <div className="form-input-container">
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Email Address</label>
                        <input type="email" required value={bookingForm.email} onChange={(e) => setBookingForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="you@example.com" className="plain-text-input" />
                      </div>
                    </div>

                    <div className="talk-thrive-modal-grid">
                      <div className="form-input-container">
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Phone Number</label>
                        <input type="tel" required value={bookingForm.phone} onChange={(e) => setBookingForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+234..." className="plain-text-input" />
                      </div>
                      <div className="form-input-container">
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Client Type</label>
                        <select value={bookingForm.clientType} onChange={(e) => setBookingForm((prev) => ({ ...prev, clientType: e.target.value }))} className="plain-text-input">
                          <option value="Individual">Individual</option>
                          <option value="Parent">Parent / Guardian</option>
                          <option value="Teen">Teen</option>
                          <option value="Woman">Woman / Young Adult</option>
                        </select>
                      </div>
                    </div>

                    <div className="talk-thrive-modal-grid">
                      <div className="form-input-container">
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Session Type</label>
                        <select value={bookingForm.sessionType} onChange={(e) => setBookingForm((prev) => ({ ...prev, sessionType: e.target.value }))} className="plain-text-input">
                          <option value="Virtual">Virtual</option>
                          <option value="In-person">In-person</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                      <div className="form-input-container">
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Preferred Time</label>
                        <select value={bookingForm.preferredTime} onChange={(e) => setBookingForm((prev) => ({ ...prev, preferredTime: e.target.value }))} className="plain-text-input">
                          <option value="Any time">Any time</option>
                          <option value="Morning">Morning</option>
                          <option value="Afternoon">Afternoon</option>
                          <option value="Evening">Evening</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-input-container">
                      <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>What would you like support with?</label>
                      <textarea rows="5" required value={bookingForm.concern} onChange={(e) => setBookingForm((prev) => ({ ...prev, concern: e.target.value }))} placeholder="Share a brief overview of your needs, goals, or concerns." className="plain-text-input" style={{ resize: 'vertical' }} />
                    </div>

                    <div className="talk-thrive-modal-actions">
                      <button type="submit" className="form-submit-action-btn" style={{ minWidth: '220px' }}>
                        <i className="fa-solid fa-paper-plane"></i> Send Booking Request
                      </button>
                      <button type="button" onClick={() => setIsBookingModalOpen(false)} className="care-focus-btn" style={{ background: 'transparent' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </article>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// =========================================================================
// HOMEPAGE CLIENT REGISTRATION INTAKE COMPONENT
// =========================================================================
function HomeIntakeForm({ onSubmitApplicant }) {
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [track, setTrack] = useState('family');
  const [message, setMessage] = useState('');

  const submitForm = async (e) => {
    e.preventDefault();
    if (onSubmitApplicant) {
      await onSubmitApplicant({ fullName, email: emailAddress, phone, track, message });
    }
    setSubmitted(true);
    setFullName('');
    setEmailAddress('');
    setPhone('');
    setTrack('family');
    setMessage('');
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
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Enter name" className="plain-text-input" />
        </div>
        <div className="form-input-container">
          <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Contact Email Address</label>
          <input type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} required placeholder="name@domain.com" className="plain-text-input" />
        </div>
      </div>

      <div className="registration-fields-grid">
        <div className="form-input-container">
          <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Mobile Phone Line</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+234..." className="plain-text-input" />
        </div>
        <div className="form-input-container">
          <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Targeted Intake Track Selection</label>
          <select required value={track} onChange={(e) => setTrack(e.target.value)} className="plain-text-input" style={{ height: '46px' }}>
            <option value="family">Thriving Parents</option>
            <option value="marriage">Thriving Women</option>
            <option value="children">Thriving Pre-teen & Teens</option>
          </select>
        </div>
      </div>

      <div className="form-input-container">
        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Tell us briefly about your goal</label>
        <textarea rows="3" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What are you hoping to achieve?" className="plain-text-input" style={{ resize: 'vertical' }} />
      </div>

      <button type="submit" className="form-submit-action-btn">
        <i className="fa-solid fa-user-plus"></i> Submit Secure Registration
      </button>
    </form>
  );
}

function ThriverRegistrationModal({ visible, onClose, onRegister, paystackPublicKey }) {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    age: '',
    gender: 'Female',
    schoolName: '',
    currentClassGrade: '',
    homeAddress: '',
    hobbies: '',
    parentName: '',
    relationship: '',
    phone1: '',
    phone2: '',
    parentEmail: '',
    occupation: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    signature: '',
    consentDate: new Date().toISOString().slice(0, 10),
    track: 'Thriving Pre-teen & Teens',
    amount: 10000
  });
  const [goalAreas, setGoalAreas] = useState({
    confidenceBuilding: true,
    publicSpeaking: false,
    communicationSkills: false,
    leadershipResilience: false,
    disciplineIntegrity: false,
    emotionalIntelligence: false,
    goalSetting: false,
    positiveCharacter: false,
    financialLiteracy: false,
    others: false
  });
  const [otherGoal, setOtherGoal] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);
  const [passportFile, setPassportFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [passportPreviewUrl, setPassportPreviewUrl] = useState(null);
  const [stepIndex, setStepIndex] = useState(0); // 0 = Thriver info, 1 = Parent+goals+health, 2 = Preview, 3 = Confirmation
  const passportInputRef = useRef(null);

  const handlePassportPreviewClick = () => {
    if (passportInputRef.current) {
      passportInputRef.current.click();
    }
  };

  const goalLabels = {
    confidenceBuilding: 'Confidence Building',
    publicSpeaking: 'Public Speaking',
    communicationSkills: 'Communication Skills',
    leadershipResilience: 'Leadership and Resilience Skills',
    disciplineIntegrity: 'Discipline, Integrity and Responsibility',
    emotionalIntelligence: 'Emotional Intelligence',
    goalSetting: 'Goal Setting',
    positiveCharacter: 'Positive Character Formation',
    financialLiteracy: 'Financial Literacy',
    others: 'Others'
  };

  useEffect(() => {
    if (!visible) return;
    if (window.PaystackPop) {
      setPaystackReady(true);
      return;
    }

    const existingScript = document.getElementById('paystack-inline-js');
    if (existingScript) {
      setPaystackReady(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => setPaystackReady(true);
    script.onerror = () => setStatusMessage('Unable to load Paystack checkout. Please try again later.');
    document.body.appendChild(script);
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setFormData((prev) => ({
        ...prev,
        fullName: '',
        dateOfBirth: '',
        age: '',
        gender: 'Female',
        schoolName: '',
        currentClassGrade: '',
        homeAddress: '',
        hobbies: '',
        parentName: '',
        relationship: '',
        phone1: '',
        phone2: '',
        parentEmail: '',
        occupation: '',
        allergies: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        signature: '',
        consentDate: new Date().toISOString().slice(0, 10),
        track: 'Thriving Pre-teen & Teens',
        amount: 10000
      }));
      setGoalAreas({
        confidenceBuilding: true,
        publicSpeaking: false,
        communicationSkills: false,
        leadershipResilience: false,
        disciplineIntegrity: false,
        emotionalIntelligence: false,
        goalSetting: false,
        positiveCharacter: false,
        financialLiteracy: false,
        others: false
      });
      setOtherGoal('');
      setStatusMessage('');
      setLoading(false);
      setPassportFile(null);
      setDocumentFile(null);
      setPassportPreviewUrl(null);
      setStepIndex(0);
    }
  }, [visible]);

  useEffect(() => {
    if (!passportFile) {
      setPassportPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(passportFile);
    setPassportPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [passportFile]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (key) => {
    setGoalAreas((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedGoals = Object.entries(goalAreas).reduce((acc, [key, checked]) => {
    if (!checked) return acc;
    if (key === 'others') {
      if (otherGoal.trim()) acc.push(otherGoal.trim());
      return acc;
    }
    acc.push(goalLabels[key]);
    return acc;
  }, []);

  const handlePaymentSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setStatusMessage('');

    if (!formData.parentEmail || !formData.phone1) {
      setStatusMessage('Please provide both parent email and a primary phone number.');
      return;
    }

    if (!paystackReady || !window.PaystackPop) {
      setStatusMessage('Paystack checkout is loading. Please wait a moment and try again.');
      return;
    }

    if (!paystackPublicKey || paystackPublicKey.includes('demo_key_update_from_admin')) {
      setStatusMessage('A valid Paystack test key is required. Please update the public key in admin settings.');
      return;
    }

    setLoading(true);

    const paymentHandler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: formData.parentEmail,
      amount: Number(formData.amount || 10000) * 100,
      currency: 'NGN',
      ref: `PTT-${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Thriver Name', variable_name: 'thriver_name', value: formData.fullName },
          { display_name: 'Parent Phone', variable_name: 'parent_phone', value: formData.phone1 },
          { display_name: 'Selected Track', variable_name: 'selected_track', value: formData.track }
        ]
      },
      callback: async (response) => {
        const registrationData = {
          ...formData,
          developmentGoals: selectedGoals.join(', '),
          paymentReference: response.reference,
          paymentStatus: 'success'
          , passportFile,
          documentFile
        };
        if (onRegister) await onRegister(registrationData);
        setStatusMessage('Payment successful and registration submitted. Thank you!');
        setLoading(false);
        setTimeout(() => {
          setStatusMessage('');
          onClose();
        }, 1200);
      },
      onClose: () => {
        setStatusMessage('Payment was cancelled. You can try again anytime.');
        setLoading(false);
      }
    });

    paymentHandler.openIframe();
  };

  const handlePayLater = async () => {
    setStatusMessage('');
    setLoading(true);
    try {
      const registrationData = {
        ...formData,
        developmentGoals: selectedGoals.join(', '),
        paymentStatus: 'pending',
        paymentMethod: 'bank_transfer',
        passportFile,
        documentFile
      };
      if (onRegister) await onRegister(registrationData);
      setStatusMessage('Registration submitted. Please complete payment via bank transfer using the details provided to you.');
      setLoading(false);
      setTimeout(() => {
        setStatusMessage('');
        onClose();
      }, 2500);
    } catch (err) {
      setStatusMessage('Unable to submit registration. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmitApplication = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setStepIndex(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayNow = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    await handlePaymentSubmit();
  };

  const handleNextStep = () => {
    setStepIndex((prev) => Math.min(prev + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousStep = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  const handleEdit = () => setStepIndex(0);

  return (
    <div className="registration-modal-overlay" onClick={onClose}>
      <div className="registration-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="registration-modal-header">
          <div>
            <h3>Thriver Registration Form</h3>
            <p className="registration-prompt-banner">Use the step flow to complete your application. Preview and submit once all information is ready.</p>
          </div>
          <button className="registration-modal-close-btn" type="button" onClick={onClose} aria-label="Close registration form">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="registration-flow-nav">
          <div className="registration-flow-step">
            <span className={stepIndex === 0 ? 'active' : ''}>1. Thriver Info</span>
            <span className={stepIndex === 1 ? 'active' : ''}>2. Parent & Goals</span>
            <span className={stepIndex === 2 ? 'active' : ''}>3. Preview</span>
            <span className={stepIndex === 3 ? 'active' : ''}>4. Confirm</span>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (stepIndex < 2) handleNextStep(); }}>
          {stepIndex === 0 && (
            <>
              <section className="registration-modal-section">
                <h4>A. THRIVER INFORMATION</h4>
                <div className="registration-fields-grid">
                  <div className="passport-upload-row">
                    <div className="passport-upload-preview">
                      <div
                        className="preview-box"
                        onClick={handlePassportPreviewClick}
                        onDoubleClick={handlePassportPreviewClick}
                        style={{ cursor: 'pointer', position: 'relative' }}
                      >
                        {passportPreviewUrl ? (
                          <img src={passportPreviewUrl} alt="Passport preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: '#6b7280', padding: '0.5rem', textAlign: 'center' }}>Passport preview</div>
                        )}
                        <div style={{
                          position: 'absolute',
                          bottom: '0.5rem',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(255, 255, 255, 0.9)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          color: '#334155',
                          pointerEvents: 'none'
                        }}>
                          {passportPreviewUrl ? 'Double-click to change photo' : 'Double-click to choose image'}
                        </div>
                      </div>
                      <input
                        ref={passportInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPassportFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                        style={{ display: 'none' }}
                      />
                    </div>
                    <div className="passport-upload-form">
                      <div className="form-input-container">
                        <label>Full Name</label>
                        <input type="text" value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} required className="plain-text-input" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-input-container">
                          <label>Date of Birth</label>
                          <input type="date" value={formData.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} required className="plain-text-input" />
                        </div>
                        <div className="form-input-container">
                          <label>Age</label>
                          <input type="number" min="6" max="25" value={formData.age} onChange={(e) => updateField('age', e.target.value)} required className="plain-text-input" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-input-container">
                    <label>Gender</label>
                    <select value={formData.gender} onChange={(e) => updateField('gender', e.target.value)} className="plain-text-input" style={{ height: '46px' }}>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="form-input-container">
                    <label>School Name</label>
                    <input type="text" value={formData.schoolName} onChange={(e) => updateField('schoolName', e.target.value)} className="plain-text-input" />
                  </div>
                  <div className="form-input-container">
                    <label>Current Class / Grade</label>
                    <input type="text" value={formData.currentClassGrade} onChange={(e) => updateField('currentClassGrade', e.target.value)} className="plain-text-input" />
                  </div>
                  <div className="form-input-container" style={{ gridColumn: '1 / -1' }}>
                    <label>Home Address</label>
                    <input type="text" value={formData.homeAddress} onChange={(e) => updateField('homeAddress', e.target.value)} className="plain-text-input" />
                  </div>
                  <div className="form-input-container" style={{ gridColumn: '1 / -1' }}>
                    <label>Special Interests / Hobbies</label>
                    <input type="text" value={formData.hobbies} onChange={(e) => updateField('hobbies', e.target.value)} className="plain-text-input" />
                  </div>
                </div>
              </section>
            </>
          )}

          {stepIndex === 1 && (
            <>
              <section className="registration-modal-section">
                <h4>B. PARENT / GUARDIAN INFORMATION</h4>
                <div className="registration-fields-grid">
                  <div className="form-input-container">
                    <label>Parent / Guardian Name</label>
                    <input type="text" value={formData.parentName} onChange={(e) => updateField('parentName', e.target.value)} required className="plain-text-input" />
                  </div>
                  <div className="form-input-container">
                    <label>Relationship to Child</label>
                    <input type="text" value={formData.relationship} onChange={(e) => updateField('relationship', e.target.value)} required className="plain-text-input" />
                  </div>
                  <div className="form-input-container">
                    <label>Phone Number 1</label>
                    <input type="tel" value={formData.phone1} onChange={(e) => updateField('phone1', e.target.value)} required className="plain-text-input" />
                  </div>
                  <div className="form-input-container">
                    <label>Phone Number 2</label>
                    <input type="tel" value={formData.phone2} onChange={(e) => updateField('phone2', e.target.value)} className="plain-text-input" />
                  </div>
                  <div className="form-input-container">
                    <label>Email Address</label>
                    <input type="email" value={formData.parentEmail} onChange={(e) => updateField('parentEmail', e.target.value)} required className="plain-text-input" />
                  </div>
                  <div className="form-input-container">
                    <label>Occupation</label>
                    <input type="text" value={formData.occupation} onChange={(e) => updateField('occupation', e.target.value)} className="plain-text-input" />
                  </div>
                </div>
              </section>

              <section className="registration-modal-section">
                <h4>C. DEVELOPMENT GOALS</h4>
                <div className="registration-checklist-grid">
                  {Object.keys(goalLabels).map((key) => (
                    <label key={key} className="checkbox-card">
                      <input type="checkbox" checked={goalAreas[key]} onChange={() => toggleGoal(key)} />
                      <span>{goalLabels[key]}</span>
                    </label>
                  ))}
                </div>
                {goalAreas.others && (
                  <div className="form-input-container" style={{ marginTop: '1rem' }}>
                    <label>Other goal focus</label>
                    <input type="text" value={otherGoal} onChange={(e) => setOtherGoal(e.target.value)} className="plain-text-input" placeholder="Please specify other development goals" />
                  </div>
                )}
              </section>

              <section className="registration-modal-section">
                <h4>D. HEALTH INFORMATION</h4>
                <div className="registration-fields-grid">
                  <div className="form-input-container">
                    <label>Allergies or Medical Conditions</label>
                    <input type="text" value={formData.allergies} onChange={(e) => updateField('allergies', e.target.value)} className="plain-text-input" />
                  </div>
                  <div className="form-input-container">
                    <label>Emergency Contact Name</label>
                    <input type="text" value={formData.emergencyContactName} onChange={(e) => updateField('emergencyContactName', e.target.value)} className="plain-text-input" />
                  </div>
                  <div className="form-input-container" style={{ gridColumn: '1 / -1' }}>
                    <label>Emergency Contact Number</label>
                    <input type="tel" value={formData.emergencyContactNumber} onChange={(e) => updateField('emergencyContactNumber', e.target.value)} className="plain-text-input" />
                  </div>
                </div>
              </section>

              <section className="registration-modal-section">
                <h4>E. UPLOADS</h4>
                <div className="registration-fields-grid">
                  <div className="form-input-container">
                    <label>Supporting Document (PDF/DOC)</label>
                    <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*" onChange={(e) => setDocumentFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} className="plain-text-input" />
                  </div>
                </div>
              </section>

              <section className="registration-modal-section">
                <h4>F. CONSENT</h4>
                <div className="form-input-container">
                  <label>I authorize my child/ward to participate in activities organized by Paz Thriving Teens Academy and I will pay the investment fee as at when due.</label>
                  <textarea rows="3" value={formData.signature} onChange={(e) => updateField('signature', e.target.value)} placeholder="Parent signature or printed name" className="plain-text-input" style={{ resize: 'vertical' }} required />
                </div>
                <div className="registration-payment-row">
                  <div className="form-input-container">
                    <label>Date</label>
                    <input type="date" value={formData.consentDate} onChange={(e) => updateField('consentDate', e.target.value)} className="plain-text-input" />
                  </div>
                  <div className="form-input-container">
                    <label>Payment Amount (NGN)</label>
                    <input type="number" min="100" value={formData.amount} onChange={(e) => updateField('amount', e.target.value)} className="plain-text-input" required />
                  </div>
                </div>
              </section>

              <div className="form-input-container" style={{ marginBottom: '1rem' }}>
                <label>Selected Academy Track</label>
                <select value={formData.track} onChange={(e) => updateField('track', e.target.value)} className="plain-text-input" style={{ height: '46px' }}>
                  <option>Thriving Pre-teen & Teens</option>
                  <option>Thriving Parents</option>
                  <option>Thriving Women</option>
                </select>
              </div>
            </>
          )}

          {statusMessage && <div className="payment-status-message">{statusMessage}</div>}

          {stepIndex <= 1 && (
            <div className="registration-action-row">
              {stepIndex > 0 && (
                <button type="button" className="form-cancel-action-btn" onClick={handlePreviousStep} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.6rem 1rem', flex: '0 0 auto' }}>
                  Previous
                </button>
              )}
              <button type="button" className="form-submit-action-btn" onClick={handleNextStep} disabled={loading} style={{ flex: '1 1 220px' }}>
                Next
              </button>
              <button type="button" className="form-cancel-action-btn" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.6rem 1rem', flex: '0 0 auto' }}>
                Cancel
              </button>
            </div>
          )}
        </form>

        {stepIndex === 2 && (
          <div className="registration-preview-card">
            <div className="registration-preview-header">
              <h4>Preview Registration Details</h4>
              <button type="button" className="form-submit-action-btn" style={{ background: '#2563eb', borderColor: '#2563eb', marginLeft: 'auto' }} onClick={() => window.print()}>
                <i className="fa-solid fa-print"></i> Print / Save PDF
              </button>
            </div>
            <div className="registration-preview-row">
              <div className="registration-preview-photo">
                {passportPreviewUrl ? (
                  <img src={passportPreviewUrl} alt="passport" className="registration-preview-photo-img" />
                ) : (
                  <div className="registration-preview-photo-placeholder">Passport preview</div>
                )}
              </div>
              <div className="registration-preview-details">
                <div className="preview-item"><span>Full Name:</span> {formData.fullName}</div>
                <div className="preview-item"><span>DOB:</span> {formData.dateOfBirth}</div>
                <div className="preview-item"><span>Age:</span> {formData.age}</div>
                <div className="preview-item"><span>Gender:</span> {formData.gender}</div>
                <div className="preview-item"><span>School:</span> {formData.schoolName}</div>
                <div className="preview-item"><span>Class / Grade:</span> {formData.currentClassGrade}</div>
                <div className="preview-item"><span>Parent / Guardian:</span> {formData.parentName}</div>
                <div className="preview-item"><span>Primary Phone:</span> {formData.phone1}</div>
                <div className="preview-item"><span>Email:</span> {formData.parentEmail}</div>
                <div className="preview-item"><span>Selected Track:</span> {formData.track}</div>
                <div className="preview-item"><span>Development Goals:</span> {selectedGoals.join(', ') || 'Not specified'}</div>
                <div className="preview-item"><span>Home Address:</span> {formData.homeAddress}</div>
                <div className="preview-item"><span>Hobbies / Interests:</span> {formData.hobbies}</div>
                <div className="preview-item"><span>Allergies / Conditions:</span> {formData.allergies || 'None listed'}</div>
              </div>
            </div>
            <div className="registration-action-row">
              <button type="button" className="form-submit-action-btn" onClick={handleSubmitApplication} disabled={loading} style={{ flex: '1 1 220px' }}>
                <i className="fa-solid fa-file-circle-check"></i> Submit Application
              </button>
              <button type="button" className="form-cancel-action-btn" onClick={handlePreviousStep} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.6rem 1rem', flex: '0 0 auto' }}>Edit</button>
              <button type="button" className="form-cancel-action-btn" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.6rem 1rem', flex: '0 0 auto' }}>Cancel</button>
            </div>
          </div>
        )}

        {stepIndex === 3 && (
          <div className="registration-confirmation-card">
            <h3>Application Submitted</h3>
            <p>Your application has been successfully submitted and will be reviewed by an admin. Once approved, you can complete payment and join Paz Thriving Teens Academy.</p>
            <div className="registration-confirmation-actions">
              <button type="button" className="form-submit-action-btn" onClick={handlePayNow} disabled={loading}>
                <i className="fa-solid fa-credit-card"></i> Pay Now
              </button>
              <button type="button" className="form-submit-action-btn" onClick={handlePayLater} disabled={loading} style={{ background: '#f6ad55', borderColor: '#f6ad55' }}>
                <i className="fa-solid fa-money-bill-transfer"></i> Pay Later
              </button>
              <button type="button" className="form-cancel-action-btn" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.6rem 1rem' }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
