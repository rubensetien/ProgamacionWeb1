// Generar color basado en email
export const getColorFromEmail = (email) => {
  if (!email) return '#ff6600';
  
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#ff6600', '#ff8e53', '#e74c3c', '#3498db', 
    '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c',
    '#e67e22', '#16a085'
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

// Obtener iniciales del nombre o email
export const getInitials = (name, email) => {
  if (name && name.trim()) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  
  return 'U';
};
