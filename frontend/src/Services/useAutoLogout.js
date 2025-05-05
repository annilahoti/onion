import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAutoLogout = (timeoutMinutes = 20) => {
  const navigate = useNavigate();

  useEffect(() => {
    let logoutTimer;

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        // Pastro tokenat
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Ridrejto userin
        navigate('/login');
      }, timeoutMinutes * 60 * 1000); // default 20 min
    };

    // Event listeners për aktivitet
    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Starto timerin kur komponenti mountohet
    resetTimer();

    return () => {
      clearTimeout(logoutTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [navigate, timeoutMinutes]);
};

export default useAutoLogout;
