import { useEffect } from "react";

const NotificationBadgeUpdater = () => {
  useEffect(() => {
    const handleNotification = (e) => {
      const badge = document.getElementById('notification-count');
      if (badge) {
        let count = parseInt(badge.textContent) || 0;
        badge.textContent = count + 1;
      }
    };

    window.addEventListener('notification-updated', handleNotification);

    return () => {
      window.removeEventListener('notification-updated', handleNotification);
    };
  }, []);

  return null;
};

export default NotificationBadgeUpdater;
