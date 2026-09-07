export default function VendorSupportChat() {
  return (
    <div style={{ position: 'fixed', right: '20px', bottom: '20px', zIndex: 3000 }}>
      <a
        href="https://wa.me/2348037383820"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with PAZ vendor support on WhatsApp"
        title="Chat with PAZ vendor support on WhatsApp"
        style={{
          width: '56px',
          height: '56px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid #fff',
          borderRadius: '50%',
          background: '#25D366',
          color: '#fff',
          fontSize: '1.65rem',
          boxShadow: '0 12px 24px rgba(15,23,42,.24)',
          textDecoration: 'none',
          animation: 'bounce-default 1.7s ease-in-out infinite',
        }}
      >
        <i className="fa-brands fa-whatsapp" aria-hidden="true" />
      </a>
    </div>
  );
}
