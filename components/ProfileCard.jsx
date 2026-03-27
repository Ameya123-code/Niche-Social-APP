import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import './ProfileCard.css';

const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round = (v, precision = 3) => parseFloat(v.toFixed(precision));

const AVATAR_FRAME_CLASS_MAP = {
  'neon-pink': 'pc-avatar-frame-neon-pink',
  gold: 'pc-avatar-frame-gold',
  ice: 'pc-avatar-frame-ice',
  emerald: 'pc-avatar-frame-emerald',
  fire: 'pc-avatar-frame-fire',
  rainbow: 'pc-avatar-frame-rainbow',
  sapphire: 'pc-avatar-frame-sapphire',
  amethyst: 'pc-avatar-frame-amethyst',
  ruby: 'pc-avatar-frame-ruby',
  obsidian: 'pc-avatar-frame-obsidian',
  pearl: 'pc-avatar-frame-pearl',
  'rainbow-spin': 'pc-avatar-frame-rainbow-spin',
  aurora: 'pc-avatar-frame-aurora',
  'pulse-neon': 'pc-avatar-frame-pulse-neon',
  cyber: 'pc-avatar-frame-cyber',
};

const CARD_THEME_GRADIENTS = {
  rose: 'linear-gradient(160deg, rgba(71,53,91,0.94) 0%, rgba(55,74,112,0.92) 52%, rgba(25,33,54,0.98) 100%)',
  midnight: 'linear-gradient(160deg, rgba(30,33,62,0.95) 0%, rgba(20,24,44,0.96) 55%, rgba(13,17,32,0.98) 100%)',
  sunset: 'linear-gradient(160deg, rgba(128,52,82,0.95) 0%, rgba(115,55,62,0.94) 50%, rgba(64,35,44,0.98) 100%)',
  ocean: 'linear-gradient(160deg, rgba(4,47,94,0.96) 0%, rgba(2,132,199,0.9) 52%, rgba(8,47,73,0.98) 100%)',
  forest: 'linear-gradient(160deg, rgba(6,78,59,0.96) 0%, rgba(22,101,52,0.92) 52%, rgba(20,83,45,0.98) 100%)',
  violet: 'linear-gradient(160deg, rgba(76,29,149,0.96) 0%, rgba(109,40,217,0.92) 50%, rgba(49,46,129,0.98) 100%)',
  aurora: 'linear-gradient(160deg, rgba(6,182,212,0.88) 0%, rgba(52,211,153,0.86) 48%, rgba(167,139,250,0.9) 100%)',
  ember: 'linear-gradient(160deg, rgba(180,83,9,0.96) 0%, rgba(220,38,38,0.9) 50%, rgba(124,45,18,0.98) 100%)',
  'mono-noir': 'linear-gradient(160deg, rgba(23,23,23,0.98) 0%, rgba(38,38,38,0.95) 54%, rgba(10,10,10,1) 100%)',
  'cotton-candy': 'linear-gradient(160deg, rgba(244,114,182,0.88) 0%, rgba(129,140,248,0.86) 52%, rgba(34,211,238,0.88) 100%)',
};

const ProfileCardComponent = ({
  avatarUrl = '',
  bannerUrl = '',
  avatarFrame = 'none',
  innerGradient = undefined,
  themeId = 'rose',
  borderStyle = 'glass',
  fontStyle = 'modern',
  backgroundMode = 'theme',
  gifUrl = undefined,
  className = '',
  enableTilt = true,
  name = 'User',
  title = '',
  handle = 'user',
  status = 'Online',
  contactText = 'Message',
  showUserInfo = true,
  onContactClick = undefined,
  opinionCount = 0,
  likeCount = 0,
  interests = [],
}) => {
  const wrapRef = useRef(null);
  const shellRef = useRef(null);
  const rafRef = useRef(null);

  const setFromXY = useCallback((x, y) => {
    const shell = shellRef.current;
    const wrap = wrapRef.current;
    if (!shell || !wrap) return;

    const width = shell.clientWidth || 1;
    const height = shell.clientHeight || 1;

    const px = clamp((100 / width) * x);
    const py = clamp((100 / height) * y);

    wrap.style.setProperty('--pointer-x', `${px}%`);
    wrap.style.setProperty('--pointer-y', `${py}%`);
    wrap.style.setProperty('--rotate-x', `${round(-(px - 50) / 8)}deg`);
    wrap.style.setProperty('--rotate-y', `${round((py - 50) / 8)}deg`);
  }, []);

  useEffect(() => {
    if (!enableTilt) return;
    const shell = shellRef.current;
    if (!shell) return;

    const onMove = (event) => {
      const rect = shell.getBoundingClientRect();
      setFromXY(event.clientX - rect.left, event.clientY - rect.top);
    };

    const onLeave = () => {
      const toCenter = () => {
        const rect = shell.getBoundingClientRect();
        setFromXY(rect.width / 2, rect.height / 2);
      };
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(toCenter);
    };

    shell.addEventListener('pointermove', onMove);
    shell.addEventListener('pointerleave', onLeave);

    onLeave();

    return () => {
      shell.removeEventListener('pointermove', onMove);
      shell.removeEventListener('pointerleave', onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enableTilt, setFromXY]);

  const cardTheme = useMemo(() => {
    if ((backgroundMode === 'gif' || backgroundMode === 'image') && gifUrl) {
      const overlay = backgroundMode === 'gif'
        ? 'linear-gradient(180deg, rgba(6,8,12,0.48) 0%, rgba(6,8,12,0.86) 100%)'
        : 'linear-gradient(180deg, rgba(6,8,12,0.35) 0%, rgba(6,8,12,0.72) 100%)';
      return `${overlay}, url(${gifUrl}) center/cover no-repeat`;
    }

    if (innerGradient) return innerGradient;

    return CARD_THEME_GRADIENTS[themeId] ?? CARD_THEME_GRADIENTS.rose;
  }, [themeId, backgroundMode, gifUrl, innerGradient]);

  const frameClass = borderStyle === 'neon' ? 'pc-border-neon' : borderStyle === 'minimal' ? 'pc-border-minimal' : 'pc-border-glass';
  const fontClass = fontStyle === 'mono' ? 'pc-font-mono' : fontStyle === 'playful' ? 'pc-font-playful' : 'pc-font-modern';
  const avatarFrameClass = AVATAR_FRAME_CLASS_MAP[avatarFrame] ?? '';

  return (
    <div ref={wrapRef} className={`pc-wrap ${className}`.trim()}>
      <div ref={shellRef} className={`pc-shell ${enableTilt ? 'pc-shell-tilt' : ''}`}>
        <section className={`pc-card ${frameClass} ${fontClass}`} style={{ background: cardTheme }}>
          <div className="pc-sheen" />
          <div className="pc-vignette" />

          <div className={`pc-avatar-frame ${avatarFrameClass}`}>
            {avatarUrl ? (
              <img className="pc-avatar" src={avatarUrl} alt={`${name} avatar`} loading="lazy" />
            ) : (
              <div className="pc-avatar-fallback">{(name || 'U').slice(0, 1).toUpperCase()}</div>
            )}
          </div>

          <div className="pc-body">
            <div className="pc-headline">
              <h3>{name}</h3>
              <p>{title}</p>
              <span className="pc-status-pill">{status}</span>
            </div>

            {showUserInfo && (
              <div className="pc-user-row">
                <div>
                  <div className="pc-handle">@{handle}</div>
                  <div className="pc-small-muted">{opinionCount} opinions · {likeCount} likes</div>
                </div>
                <button
                  className="pc-contact-btn"
                  onClick={() => onContactClick?.()}
                  type="button"
                  style={{ pointerEvents: 'auto' }}
                >
                  {contactText}
                </button>
              </div>
            )}

            <div className="pc-section">
              <p className="pc-label">Interested In</p>
              <div className="pc-interests">
                {(interests.length ? interests : ['Music', 'Travel', 'Design', 'Tech']).slice(0, 8).map((interest, idx) => (
                  <span key={`${interest}-${idx}`} className="pc-interest-chip">{interest}</span>
                ))}
              </div>
            </div>

            <div className="pc-kpis">
              <div className="pc-kpi-box">
                <span className="pc-kpi-value">{opinionCount}</span>
                <span className="pc-kpi-label">Opinions</span>
              </div>
              <div className="pc-kpi-box">
                <span className="pc-kpi-value">{likeCount}</span>
                <span className="pc-kpi-label">Likes</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);
export default ProfileCard;
