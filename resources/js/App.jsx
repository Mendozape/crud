// App.jsx
import * as React from "react";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Stats from "./pages/Stats";
import NotiPage from "./pages/Notfications/NotiPage";
import NotiProfile from "./pages/Notfications/NotiProfile";
import Profile from "./pages/Profile";

// Chat Pages & Components
import ChatPage from "./pages/Chat/ChatPage";

// Residents SPA
import ShowResidents from "./components/ShowResidents";
import CreateResidents from "./components/CreateResidents";
import EditResidents from "./components/EditResidents";
import CreatePayments from "./components/CreatePayments";
import PaymentHistoryPage from "./components/PaymentHistoryPage"; // <-- NEW IMPORT

// Fees SPA
import ShowFees from "./components/ShowFees";
import CreateFees from "./components/CreateFees";
import EditFees from "./components/EditFees";

// Addresses SPA (Catalog)
import ShowAddresses from "./components/ShowAddresses";
import CreateAddresses from "./components/CreateAddresses";
import EditAddresses from "./components/EditAddresses";

// Permissions SPA
import ShowPermissions from "./components/ShowPermissions";
import CreatePermission from "./components/CreatePermission";
import EditPermission from "./components/EditPermission";

// Roles SPA
import ShowRoles from "./components/ShowRoles";
import CreateRole from "./components/CreateRole";
import EditRole from "./components/EditRole";

// Users SPA
import ShowUsers from "./components/ShowUsers";
import CreateUser from "./components/CreateUser";
import EditUser from "./components/EditUser";

// Reports SPA
import Reports from "./components/Reports";

// Components
import NotificationBadgeUpdater from "./components/NotificationBadgeUpdater";
import ChatBadgeUpdater from "./components/ChatBadgeUpdater";

const App = () => {
    const rootEl = document.getElementById("react-container");
    const initialData = rootEl ? window.Laravel?.user : null;
    const [user, setUser] = useState(initialData); // State for authenticated user data

    return (
        <>
            <NotificationBadgeUpdater />
            <ChatBadgeUpdater />

            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/home" replace />} />

                    {/* Main routes */}
                    <Route path="/home" element={<Stats user={user} />} />
                    <Route path="/profile" element={<Profile user={user} />} />

                    {/* CHAT ROUTE: This loads the main chat interface */}
                    <Route path="/chat" element={<ChatPage user={user} />} />

                    <Route path="/notificationsList" element={<NotiPage />}>
                        <Route path=":id" element={<NotiProfile />} />
                    </Route>

                    {/* Residents SPA routes */}
                    <Route path="/residents" element={<ShowResidents user={user} />} />
                    <Route path="/residents/create" element={<CreateResidents />} />
                    <Route path="/residents/edit/:id" element={<EditResidents />} />
                    
                    <Route path="/residents/payments/history/:id" element={<PaymentHistoryPage />} />
                    <Route path="/addresses/payment/:id" element={<CreatePayments />} />
                    <Route path="/addresses/payments/history/:id" element={<PaymentHistoryPage />} />

                    {/* Fees SPA routes */}
                    <Route path="/fees" element={<ShowFees />} />
                    <Route path="/fees/create" element={<CreateFees />} />
                    <Route path="/fees/edit/:id" element={<EditFees />} />

                    {/* Addresses SPA routes (Catalog) */}
                    <Route path="/addresses" element={<ShowAddresses />} />
                    <Route path="/addresses/create" element={<CreateAddresses />} />
                    <Route path="/addresses/edit/:id" element={<EditAddresses />} />

                    {/* Permissions SPA routes */}
                    <Route path="/permissions" element={<ShowPermissions />} />
                    <Route path="/permissions/create" element={<CreatePermission />} />
                    <Route path="/permissions/edit/:id" element={<EditPermission />} />

                    {/* Roles SPA routes */}
                    <Route path="/roles" element={<ShowRoles />} />
                    <Route path="/roles/create" element={<CreateRole />} />
                    <Route path="/roles/edit/:id" element={<EditRole />} />

                    {/* Users SPA routes */}
                    <Route path="/users" element={<ShowUsers />} />
                    <Route path="/users/create" element={<CreateUser />} />
                    <Route path="/users/edit/:id" element={<EditUser />} />

                    {/* Reports SPA routes */}
                    <Route path="/reports" element={<Reports />} />

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
            </BrowserRouter>
        </>
    );
};

export default App;