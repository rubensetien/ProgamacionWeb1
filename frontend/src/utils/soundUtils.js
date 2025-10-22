// Reproducir sonido de notificación
export const reproducirNotificacion = () => {
  // Opción 1: Usar un archivo de audio
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Error reproduciendo sonido:', err));
  } catch (error) {
    console.log('Error con audio file, usando beep:', error);
    // Fallback: generar beep con Web Audio API
    reproducirBeep();
  }
};

// Generar beep simple con Web Audio API (fallback)
export const reproducirBeep = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('No se pudo reproducir sonido:', error);
  }
};