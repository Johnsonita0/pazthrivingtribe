import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const SEARCH_OPTIONS = [
  { label: 'Home', path: '/', keywords: ['home', 'landing', 'start', 'main'] },
  { label: 'Talk & Thrive', path: '/care-counseling', keywords: ['talk', 'thrive', 'care', 'counseling', 'support'] },
  { label: 'Thriving Pre-teens & Teens', path: '/teens-kids-academy', keywords: ['teens', 'pre-teens', 'kids', 'youth', 'academy', 'confidence'] },
  { label: 'Thriving Children', path: '/services/children', keywords: ['children', 'kids', 'young', 'parenting'] },
  { label: 'Thriving Parents', path: '/services/family', keywords: ['parents', 'family', 'parenting', 'family support'] },
  { label: 'Thriving Women', path: '/services/marriage', keywords: ['women', 'marriage', 'relationship', 'couples'] }
];

const SEARCH_SUGGESTIONS = SEARCH_OPTIONS.flatMap((option) => [
  { label: option.label, path: option.path, source: 'page' },
  ...option.keywords.map((keyword) => ({ label: keyword, path: option.path, source: option.label }))
]);

const SERVICE_CARDS = [
  { label: 'Talk & Thrive', description: 'Start with compassionate coaching.', path: '/care-counseling' },
  { label: 'Thriving Pre-teens & Teens', description: 'Build youth confidence.', path: '/teens-kids-academy' },
  { label: 'Thriving Parents', description: 'Practical family guidance.', path: '/services/family' }
];

export default function App() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchText, setSearchText] = useState('');
  const [searchFeedback, setSearchFeedback] = useState('Type a keyword or page name to search.');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const visibleSuggestions = SEARCH_SUGGESTIONS.filter((item) => {
    const normalized = item.label.toLowerCase().replace(/[-_\/]/g, ' ');
    const query = searchText.trim().toLowerCase();
    return query.length === 0 || normalized.includes(query);
  });
  
  const handleSuggestionSelect = (path, label) => {
    setSearchText(label);
    setShowSuggestions(false);
    navigate(path);
  };
  
  // Game State
  const [gameState, setGameState] = useState('idle'); 
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [gameSpeed, setGameSpeed] = useState(2.5); // Starts gentle
  const gameLoopRef = useRef(null);

  // Network listener
  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchText.trim().toLowerCase().replace(/[\s_\/\-]+/g, ' ');
    if (!query) {
      setSearchFeedback('Type a keyword or page name to search.');
      return;
    }

    const match = SEARCH_OPTIONS.find((option) => {
      const labelMatch = option.label.toLowerCase().includes(query);
      const pathMatch = option.path.toLowerCase().includes(query);
      const keywordMatch = option.keywords?.some((keyword) => keyword.toLowerCase().includes(query));
      return labelMatch || pathMatch || keywordMatch;
    });

    if (match) {
      navigate(match.path);
      return;
    }

    setSearchFeedback(`No page found for "${searchText}". Try another phrase like home, counseling, teens, family, or marriage.`);
  };

  // Diplomatic obstacle spawning logic
  const spawnObstacle = useCallback(() => {
    return { id: Date.now(), x: 100, isBig: Math.random() > 0.7 };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
      setObstacles((prev) => {
        // Move existing obstacles
        let nextObstacles = prev
          .map(obs => ({ ...obs, x: obs.x - gameSpeed }))
          .filter(obs => obs.x > -20); // Cleanup off-screen

        // Diplomatic Spawning: Only spawn if the last obstacle is at least 45% away
        const lastObs = nextObstacles[nextObstacles.length - 1];
        if (!lastObs || lastObs.x < 55) {
          if (Math.random() > 0.95) { // Lower chance to keep spacing
            nextObstacles.push(spawnObstacle());
          }
        }

        // Score logic
        if (prev.length > 0 && prev[0].x > 0 && nextObstacles[0].x <= 0) {
            setScore(s => {
              const newScore = s + 1;
              // Progressive speed: start slow, increase every 30 jumps
              if (newScore >= 60) setGameSpeed(4.5);
              else if (newScore >= 30) setGameSpeed(3.5);
              else setGameSpeed(2.5);
              return newScore;
            });
        }

        // Collision logic
        for (let obs of nextObstacles) {
          if (obs.x < 12 && obs.x > 5 && !isJumping) {
            setGameState('gameOver');
            if (score > highScore) setHighScore(score);
          }
        }
        return nextObstacles;
      });
    }, 50); // Tick rate

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, isJumping, gameSpeed, score, spawnObstacle, highScore]);

  const startGame = () => {
    setScore(0);
    setGameSpeed(2.5);
    setObstacles([]);
    setGameState('playing');
  };

  const handleJump = () => {
    if (isJumping || gameState !== 'playing') return;
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 600); // Smoother arc
  };

  return (
    <main className="main-wrapper">
      {!isOnline ? (
        <div className="offline-container">
          <div className="game-card">
            <h2>Connection Lost</h2>
            <p>Our digital path is temporarily blocked. Stay focused and keep growing!</p>
            <div className="game-stage" onClick={handleJump} role="button" aria-label="Jump">
              {gameState !== 'playing' && (
                <div className="game-overlay">
                  <h3>{gameState === 'gameOver' ? `Final Score: ${score}` : 'Ready to Grow?'}</h3>
                  {gameState === 'gameOver' && <p>Best Record: {highScore}</p>}
                  <button onClick={startGame} className="primary-btn">
                    {gameState === 'gameOver' ? 'Try Again' : 'Start Growth'}
                  </button>
                </div>
              )}
              <div className={`player ${isJumping ? 'jumping' : ''}`}>🌱</div>
              {obstacles.map(obs => (
                <div key={obs.id} className={`obstacle ${obs.isBig ? 'big' : ''}`} style={{ left: `${obs.x}%` }} />
              ))}
              <div className="ground"></div>
            </div>
            <div className="game-stats">Growth Score: {score}</div>
          </div>
        </div>
      ) : (
        <div className="online-container">
          <div className="content-grid">
            <div className="copy-area">
              <span className="eyebrow">404 Error</span>
              <h1>Page not found.</h1>
              <p className="body-text">We couldn't find the page you're looking for, but the Paz Thriving Tribe community is still here for you.</p>
              <form className="search-box" onSubmit={handleSearch}>
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Search for a service or page..."
                />
                <button type="submit">Find</button>
              </form>
              {showSuggestions && visibleSuggestions.length > 0 && (
                <div className="suggestions-panel">
                  {visibleSuggestions.slice(0, 8).map((item) => (
                    <button
                      key={`${item.label}-${item.path}`}
                      type="button"
                      className="suggestion-chip"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSuggestionSelect(item.path, item.label)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
              <p className="search-feedback">{searchFeedback}</p>
            </div>
            <div className="visual-area">
              <svg viewBox="0 0 320 280" className="illustration" xmlns="http://www.w3.org/2000/svg">
                <rect width="320" height="280" fill="#0f172a" />
                <rect x="110" y="100" width="100" height="100" rx="10" fill="#cbd5e1" />
                <circle cx="150" cy="125" r="5" fill="#22c55e" />
                <circle cx="170" cy="125" r="5" fill="#22c55e" />
                <path d="M210 140 L250 120" stroke="#cbd5e1" strokeWidth="12" strokeLinecap="round" />
                <path d="M250 120 L280 140" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
                <circle cx="280" cy="140" r="6" fill="#ef4444" />
              </svg>
            </div>
          </div>

          <div className="service-grid">
            {SERVICE_CARDS.map((card) => (
              <div key={card.label} className="service-box">
                <h3>{card.label}</h3>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        body { margin: 0; font-family: 'Inter', system-ui, sans-serif; background: #f8fafc; color: #0f172a; }
        .main-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 32px 24px; margin-top: 70px; }
        
        /* Online Styles */
        .online-container { max-width: 900px; width: 100%; background: #ffffff; border-radius: 24px; padding: 48px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; margin-bottom: 48px; }
        .eyebrow { color: #059669; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
        h1 { font-size: 2.5rem; font-weight: 800; margin: 12px 0; line-height: 1.2; }
        .body-text { font-size: 1rem; line-height: 1.6; color: #475569; margin: 16px 0; }
        .search-box { display: flex; gap: 8px; margin-top: 24px; position: relative; }
        .search-box input { flex: 1; padding: 12px 16px; border-radius: 8px; border: 1px solid #cbd5e1; min-width: 0; background: #f8fafc; transition: border-color 0.2s ease, box-shadow 0.2s ease; font-size: 1rem; }
        .search-box input:focus { border-color: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,0.12); outline: none; }
        .search-box button { padding: 12px 24px; background: #0f172a; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; white-space: nowrap; }
        .suggestions-panel { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 10px; margin-top: 14px; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 12px 35px rgba(15,23,42,0.06); }
        .suggestion-chip { padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 999px; background: #ffffff; color: #0f172a; font-size: 0.95rem; cursor: pointer; transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease; }
        .suggestion-chip:hover, .suggestion-chip:focus { background: #ecfdf5; border-color: #22c55e; transform: translateY(-1px); }
        .search-feedback { margin-top: 16px; color: #475569; font-size: 0.96rem; line-height: 1.6; }
        .visual-area { background: #0f172a; border-radius: 16px; overflow: hidden; height: 200px; display: flex; align-items: center; justify-content: center; }
        .illustration { width: 100%; height: 100%; }
        .service-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .service-box { padding: 24px; border: 1px solid #f1f5f9; border-radius: 16px; background: #fafafa; transition: all 0.2s ease; }
        .service-box h3 { margin: 0 0 12px 0; font-size: 1.1rem; color: #0f172a; }
        .service-box p { margin: 0; font-size: 0.95rem; color: #64748b; line-height: 1.5; }
        
        /* Tablet Responsive (768px - 1024px) */
        @media (max-width: 1024px) {
          .main-wrapper { padding: 28px 20px; }
          .online-container { padding: 40px; border-radius: 20px; }
          .content-grid { gap: 48px; margin-bottom: 40px; }
          h1 { font-size: 2rem; }
          .body-text { font-size: 0.95rem; }
          .service-grid { gap: 16px; }
          .visual-area { height: 180px; }
        }
        
        /* Tablet Portrait (768px - 896px) */
        @media (max-width: 896px) {
          .content-grid { grid-template-columns: 1fr; gap: 32px; text-align: center; }
          .service-grid { grid-template-columns: repeat(2, 1fr); }
          .visual-area { height: 220px; margin: 20px 0; }
        }
        
        /* Mobile Landscape (480px - 768px) */
        @media (max-width: 768px) {
          .main-wrapper { padding: 24px 16px; margin-top: 70px; }
          .online-container { padding: 32px 24px; border-radius: 20px; }
          .content-grid { gap: 24px; margin-bottom: 32px; }
          h1 { font-size: 1.75rem; }
          .body-text { font-size: 0.9rem; }
          .eyebrow { font-size: 0.7rem; }
          .search-box { gap: 6px; margin-top: 20px; }
          .search-box input { padding: 10px 14px; font-size: 0.95rem; }
          .search-box button { padding: 10px 20px; font-size: 0.9rem; }
          .suggestions-panel { gap: 8px; padding: 12px; margin-top: 12px; grid-template-columns: repeat(auto-fit, minmax(95px, 1fr)); }
          .suggestion-chip { padding: 8px 12px; font-size: 0.9rem; }
          .search-feedback { font-size: 0.9rem; margin-top: 14px; }
          .visual-area { height: 160px; }
          .illustration { width: 100%; height: 100%; }
          .service-grid { grid-template-columns: 1fr; gap: 14px; }
          .service-box { padding: 20px; }
          .service-box h3 { font-size: 1rem; }
          .service-box p { font-size: 0.9rem; }
        }
        
        /* Mobile Portrait (380px - 480px) */
        @media (max-width: 480px) {
          .main-wrapper { padding: 16px 12px; margin-top: 70px; min-height: calc(100vh - 70px); }
          .online-container { padding: 24px 18px; border-radius: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.08); }
          .content-grid { gap: 20px; margin-bottom: 24px; }
          h1 { font-size: 1.5rem; margin: 8px 0; }
          .body-text { font-size: 0.85rem; margin: 12px 0; }
          .eyebrow { font-size: 0.65rem; }
          .search-box { gap: 6px; margin-top: 16px; flex-direction: column; }
          .search-box input { padding: 10px 12px; font-size: 0.9rem; border-radius: 6px; }
          .search-box button { padding: 10px 18px; font-size: 0.85rem; border-radius: 6px; width: 100%; }
          .suggestions-panel { gap: 6px; padding: 10px; margin-top: 10px; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); }
          .suggestion-chip { padding: 7px 10px; font-size: 0.85rem; border-radius: 6px; }
          .search-feedback { font-size: 0.85rem; margin-top: 12px; line-height: 1.5; }
          .visual-area { height: 140px; border-radius: 12px; margin: 16px 0; }
          .service-grid { gap: 12px; }
          .service-box { padding: 16px; border-radius: 12px; }
          .service-box h3 { font-size: 0.95rem; margin: 0 0 8px 0; }
          .service-box p { font-size: 0.8rem; }
        }
        
        /* Extra Small (< 380px) */
        @media (max-width: 380px) {
          .main-wrapper { padding: 12px 10px; margin-top: 70px; }
          .online-container { padding: 18px 14px; }
          h1 { font-size: 1.3rem; margin: 6px 0; }
          .body-text { font-size: 0.8rem; margin: 10px 0; }
          .search-box { gap: 4px; }
          .search-box input { padding: 8px 10px; font-size: 0.85rem; }
          .search-box button { padding: 8px 14px; font-size: 0.8rem; }
          .suggestions-panel { padding: 8px; gap: 5px; }
          .suggestion-chip { padding: 6px 8px; font-size: 0.8rem; }
          .visual-area { height: 120px; }
          .service-box { padding: 14px; }
          .service-box h3 { font-size: 0.9rem; }
          .service-box p { font-size: 0.75rem; }
        }

        
        /* Offline Game Styles */
        .offline-container { width: 100%; max-width: 500px; padding: 20px; }
        .game-card { background: #fff; padding: 40px; border-radius: 24px; text-align: center; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .game-card h2 { margin: 0 0 12px 0; font-size: 1.8rem; }
        .game-card p { margin: 0 0 24px 0; font-size: 1rem; color: #475569; }
        .game-stage { position: relative; height: 180px; background: #f8fafc; border-radius: 16px; overflow: hidden; margin: 24px 0; border: 2px solid #e2e8f0; cursor: pointer; display: flex; align-items: flex-end; }
        .player { position: absolute; bottom: 30px; left: 10%; font-size: 2rem; transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .player.jumping { transform: translateY(-70px); }
        .obstacle { position: absolute; bottom: 30px; width: 20px; height: 20px; background: #059669; border-radius: 4px; }
        .obstacle.big { width: 32px; height: 32px; background: #0f172a; }
        .ground { position: absolute; bottom: 25px; left: 0; right: 0; height: 4px; background: #cbd5e1; }
        .game-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; }
        .game-overlay h3 { margin: 0 0 8px 0; font-size: 1.3rem; }
        .game-overlay p { margin: 0 0 16px 0; font-size: 1rem; color: #475569; }
        .primary-btn { padding: 12px 32px; background: #059669; color: white; border-radius: 99px; border: none; font-weight: 600; cursor: pointer; margin-top: 16px; font-size: 1rem; }
        .primary-btn:hover { background: #047857; }
        .game-stats { font-weight: 700; color: #0f172a; font-size: 1.25rem; margin-top: 16px; }
        
        /* Offline Game Responsive */
        @media (max-width: 768px) {
          .offline-container { padding: 16px; }
          .game-card { padding: 30px 24px; }
          .game-card h2 { font-size: 1.5rem; }
          .game-card p { font-size: 0.95rem; }
          .game-stage { height: 160px; margin: 20px 0; }
          .player { font-size: 1.8rem; }
          .player.jumping { transform: translateY(-60px); }
          .primary-btn { padding: 10px 28px; font-size: 0.95rem; }
          .game-stats { font-size: 1.1rem; }
        }
        
        @media (max-width: 480px) {
          .offline-container { padding: 12px; }
          .game-card { padding: 24px 18px; border-radius: 16px; }
          .game-card h2 { font-size: 1.3rem; margin: 0 0 10px 0; }
          .game-card p { font-size: 0.85rem; margin: 0 0 18px 0; }
          .game-stage { height: 140px; margin: 16px 0; border-radius: 12px; }
          .player { font-size: 1.5rem; }
          .player.jumping { transform: translateY(-50px); }
          .game-overlay h3 { font-size: 1.1rem; }
          .game-overlay p { font-size: 0.9rem; }
          .primary-btn { padding: 9px 24px; font-size: 0.9rem; }
          .game-stats { font-size: 1rem; }
        }
        
        @media (max-width: 380px) {
          .game-card { padding: 18px 14px; }
          .game-card h2 { font-size: 1.1rem; }
          .game-card p { font-size: 0.8rem; }
          .game-stage { height: 120px; }
          .player { font-size: 1.2rem; }
          .primary-btn { padding: 8px 20px; font-size: 0.85rem; }
          .game-stats { font-size: 0.95rem; }
        }
      `}</style>
    </main>
  );
}