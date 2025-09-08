// App.jsx
import * as React from "react";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Stats from "./pages/Stats";
import NotiPage from "./pages/Notfications/NotiPage";
import NotiProfile from "./pages/Notfications/NotiProfile";
import Profile from "./pages/Profile";

// Residents SPA
import ShowResidents from "./components/ShowResidents";
import CreateResidents from "./components/CreateResidents";
import EditResidents from "./components/EditResidents";
import CreatePayments from "./components/CreatePayments";

// Fees SPA
import ShowFees from "./components/ShowFees";
import CreateFees from "./components/CreateFees";
import EditFees from "./components/EditFees";

// Components
import NotificationBadgeUpdater from "./components/NotificationBadgeUpdater";

const App = () => {
  // Get initial user data from Blade
  const rootEl = document.getElementById("react-container");
  const initialData = rootEl ? window.Laravel?.user : null; // ✅ only take the user object

  const [user, setUser] = useState(initialData);

  return (
    <>
      {/* Notification bell always mounted */}
      <NotificationBadgeUpdater />

      <BrowserRouter>
        <Routes>
          {/* Redirect root to /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Main routes */}
          <Route path="/home" element={<Stats user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />

          <Route path="/notificationsList" element={<NotiPage />}>
            <Route path=":id" element={<NotiProfile />} />
          </Route>

          {/* Residents SPA routes */}
          <Route path="/residents" element={<ShowResidents user={user} />} />
          <Route path="/residents/create" element={<CreateResidents />} />
          <Route path="/residents/edit/:id" element={<EditResidents />} />
          <Route path="/residents/payment/:id" element={<CreatePayments />} />

          {/* Fees SPA routes */}
          <Route path="/fees" element={<ShowFees />} />
          <Route path="/fees/create" element={<CreateFees />} />
          <Route path="/fees/edit/:id" element={<EditFees />} />

          {/* Catch-all: redirect unmatched routes to /home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
