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

// Permissions SPA
import ShowPermissions from "./components/ShowPermissions";
import CreatePermission from "./components/CreatePermission";
import EditPermission from "./components/EditPermission";

// Roles SPA
import ShowRoles from "./components/ShowRoles";
import CreateRole from "./components/CreateRole";
import EditRole from "./components/EditRole";

// Components
import NotificationBadgeUpdater from "./components/NotificationBadgeUpdater";

const App = () => {
  const rootEl = document.getElementById("react-container");
  const initialData = rootEl ? window.Laravel?.user : null;
  const [user, setUser] = useState(initialData);

  return (
    <>
      <NotificationBadgeUpdater />

      <BrowserRouter>
        <Routes>
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

          {/* Permissions SPA routes */}
          <Route path="/permissions" element={<ShowPermissions />} />
          <Route path="/permissions/create" element={<CreatePermission />} />
          <Route path="/permissions/edit/:id" element={<EditPermission />} />

          {/* Roles SPA routes */}
          <Route path="/roles" element={<ShowRoles />} />
          <Route path="/roles/create" element={<CreateRole />} />
          <Route path="/roles/edit/:id" element={<EditRole />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
