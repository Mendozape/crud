import { useEffect } from "react";
import axios from "axios";

const NotificationBadgeUpdater = () => {
  const fetchNotificationCount = async () => {
    try {
      await axios.get("/sanctum/csrf-cookie");
      const res = await axios.get("/api/notis/countNotis");

      const count = res.data?.countNotis
        ? Object.keys(res.data.countNotis).length
        : 0;

      const badge = document.getElementById("notification-count");
      if (badge) {
        badge.textContent = count > 0 ? count : "";
      }
    } catch (err) {
      console.error("Failed to fetch notification count:", err);
    }
  };

  useEffect(() => {
    fetchNotificationCount();

    // Aquí puedes omitir el intervalo si ya tienes Echo funcionando
    // const interval = setInterval(fetchNotificationCount, 60000);
    // return () => clearInterval(interval);
  }, []);

  return null;
};

export default NotificationBadgeUpdater;