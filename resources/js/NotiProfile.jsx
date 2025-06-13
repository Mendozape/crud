import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

axios.defaults.withCredentials = true;

const getCsrfToken = async () => {
  try {
    await axios.get('/sanctum/csrf-cookie');
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
  }
};

export default function NotiProfile() {
  const { notiId } = useParams();
  const [notiObj, setNotiObj] = useState(null);
  const [notiList, setNotiList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        await getCsrfToken();
        const response = await axios.get(`/api/admin/notis/${notiId}`, {
          headers: { Accept: 'application/json' },
        });

        console.log('Notification response:', response.data);

        if (response.data && response.data.noti) {
          setNotiObj(response.data.noti);
          // Convert the object with numeric keys into an array of notification objects
          const valuesArray = Object.values(response.data.noti);
          setNotiList(valuesArray);
        } else {
          setNotiObj(null);
          setNotiList([]);
        }
      } catch (err) {
        console.error('Error fetching notification:', err);
        setError('Failed to load notification.');
        setNotiObj(null);
        setNotiList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotification();
  }, [notiId]);

  if (isLoading) return <p>Loading notification...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!notiList.length) return <p>No notification found.</p>;

  return (
    <div>
      {notiList.map((item) => (
        <div key={item.id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
          <p><strong>ID:</strong> {item.id}</p>
        </div>
      ))}
    </div>
  );
}