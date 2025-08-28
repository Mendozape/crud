import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import TopNav from "./components/TopNav";
import NotificationBadgeUpdater from "./components/NotificationBadgeUpdater";
import Stats from "./pages/Stats";
import NotiPage from "./pages/NotiPage";
import NotiProfile from "./pages/NotiProfile";
import ProfilePage from "./pages/ProfilePage";

const Layout = () => (
  <div style={{ paddingTop: '0' }}>
    <TopNav />
    <NotificationBadgeUpdater />
    <Outlet />
  </div>
);

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/home", element: <Stats /> },
      { path: "/notificationsList", element: <NotiPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/", element: <Stats /> },
      { path: "*", element: <div>404 - Page Not Found</div> },
    ],
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;