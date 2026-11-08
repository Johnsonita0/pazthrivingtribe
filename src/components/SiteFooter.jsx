import { Link } from 'react-router-dom';
import { normalizeFooterSettings } from '../utils/footerSettings';

export default function SiteFooter({ settings, onOpenLegalPolicy }) {
  const footer = normalizeFooterSettings(settings);
  if (!footer.enabled) return null;

  return (
    <footer className="workspace-fluid-footer">
      <div className="footer-columns-container">
        <div className="footer-brand-column">
          <Link to="/" className="footer-brand-logo-row" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="footer-vector-badge"><img src="/logo/logomain.png" alt="PTT logo" className="nav-logo-img" /></div>
            <span className="footer-brand-headline">{footer.brandName}</span>
          </Link>
          <p>{footer.description}</p>
          <div className="footer-social-links">
            <a href="https://facebook.com/pazthrivingtribe" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://instagram.com/pazthrivingtribe" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="https://twitter.com/pazthrivingtribe" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Twitter">
              <i className="fa-brands fa-twitter"></i>
            </a>
            <a href="https://youtube.com/@pazthrivingtribe" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="YouTube">
              <i className="fa-brands fa-youtube"></i>
            </a>
            <a href="https://linkedin.com/company/pazthrivingtribe" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="LinkedIn">
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
          </div>
        </div>

        <div className="footer-links-column">
          <h4>What we offer</h4>
          <div className="footer-interactive-links">
            <Link to="/care-counseling" className="footer-nav-anchor">Talk &amp; Thrive</Link>
            <Link to="/services/children" className="footer-nav-anchor">Thriving Pre-teens &amp; Teens</Link>
            <Link to="/services/family" className="footer-nav-anchor">Thriving Parents</Link>
            <Link to="/services/marriage" className="footer-nav-anchor">Thriving Women</Link>
          </div>
        </div>

        <div className="footer-links-column">
          <h4>Portals</h4>
          <div className="footer-interactive-links">
            <a href="https://pazthrivingtribe.schoolsfocus.net/signin" className="footer-nav-anchor">Academy Portal</a>
          </div>
        </div>

        <div className="footer-links-column">
          <h4>Inquiries</h4>
          <div className="footer-interactive-links">
            <span className="footer-contact-item"><i className="fa-solid fa-location-dot" aria-hidden="true"></i>{footer.location}</span>
            <a className="footer-nav-anchor footer-contact-item" href={`mailto:${footer.contactEmail}`}>
              <i className="fa-solid fa-envelope" aria-hidden="true"></i>{footer.contactEmail}
            </a>
            <a className="footer-nav-anchor footer-contact-item" href={`tel:${footer.contactPhone.replace(/[^\d+]/g, '')}`}>
              <i className="fa-solid fa-phone" aria-hidden="true"></i>{footer.contactPhone}
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom-copyright-strip">
        <p>&copy; {new Date().getFullYear()} {footer.copyright}</p>
        <div className="footer-regulatory-tags">
          <button type="button" className="footer-nav-anchor" onClick={() => onOpenLegalPolicy('privacy')}>Privacy</button>
          <button type="button" className="footer-nav-anchor" onClick={() => onOpenLegalPolicy('terms')}>System Terms</button>
        </div>
      </div>
    </footer>
  );
}
