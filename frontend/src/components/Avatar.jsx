import { getColorFromEmail, getInitials } from '../utils/avatarUtils';
import '../styles/Avatar.css';

const Avatar = ({ email, name, size = 'medium', className = '' }) => {
  const bgColor = getColorFromEmail(email);
  const initials = getInitials(name || email, email);
  
  const sizeClasses = {
    small: 'avatar-small',
    medium: 'avatar-medium',
    large: 'avatar-large'
  };

  return (
    <div 
      className={`avatar ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: bgColor }}
      title={email}
    >
      <span className="avatar-initials">{initials}</span>
    </div>
  );
};

export default Avatar;