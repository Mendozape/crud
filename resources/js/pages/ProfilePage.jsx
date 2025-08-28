// resources/js/pages/ProfilePage.jsx
import React from "react";

const ProfilePage = () => {
  const user = window.Laravel?.user || {};
  return (
    <div style={{ padding: 20 }}>
      <h1>Profile Page</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default ProfilePage;
