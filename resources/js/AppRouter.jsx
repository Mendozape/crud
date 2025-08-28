import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import TopNav from "./components/TopNav";
import NotificationBadgeUpdater from "./components/NotificationBadgeUpdater";
import Stats from "./pages/Stats";
import NotiPage from "./pages/NotiPage";
import NotiProfile from "./pages/NotiProfile";
import ProfilePage from "./pages/ProfilePage";

// Layout component: always shows TopNav
const Layout = () => (
  <>
    <TopNav />
    <NotificationBadgeUpdater />
    <Outlet /> {/* Page content */}
  </>
);

const router = createBrowserRouter([
  {
    element: <Layout />, // Wrap all routes
    children: [
      { path: "/home", element: <Stats /> },
      {
        path: "/notificationsList",
        element: <NotiPage />,
        children: [{ path: ":id", element: <NotiProfile /> }],
      },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/", element: <Stats /> },
      { path: "*", element: <div>404 - Page Not Found</div> },
    ],
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
