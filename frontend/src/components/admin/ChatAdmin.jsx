const ChatAdmin = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '20px',
      color: '#666'
    }}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        style={{ width: '80px', height: '80px', color: '#ccc' }}
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#333', margin: 0 }}>
        Chat Admin
      </h2>
      <p style={{ fontSize: '16px', margin: 0 }}>
        Panel de chat en desarrollo - SPRINT 4
      </p>
    </div>
  );
};

export default ChatAdmin;
