// Genera un color basado en el email del usuario (consistente)
export const getColorFromEmail = (email) => {
  if (!email) return '#ff6600';
  
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    '#E63946', '#A8DADC', '#457B9D', '#F4A261', '#2A9D8F'
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

// Obtiene las iniciales del nombre o email
export const getInitials = (name, email) => {
  if (name && name !== email) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  // Si solo tenemos email
  return email.substring(0, 2).toUpperCase();
};