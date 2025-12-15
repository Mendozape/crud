// App.jsx (Final and Complete)

import * as React from "react";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 🚨 HOOKS
import usePermission from "./hooks/usePermission";

// Pages
import Stats from "./pages/Stats";
import Profile from "./pages/Profile";

// Chat Pages & Components
import ChatPage from "./pages/Chat/ChatPage";

// Residents SPA
import ShowResidents from "./components/ShowResidents";
import CreateResidents from "./components/CreateResidents";
import EditResidents from "./components/EditResidents";
import CreatePayments from "./components/CreatePayments";
import PaymentHistoryPage from "./components/PaymentHistoryPage"; 

// Fees SPA
import ShowFees from "./components/ShowFees";
import CreateFees from "./components/CreateFees";
import EditFees from "./components/EditFees";

// Addresses SPA (Catalog)
import ShowAddresses from "./components/ShowAddresses";
import CreateAddresses from "./components/CreateAddresses";
import EditAddresses from "./components/EditAddresses";

// Streets SPA (New Catalog Imports)
import ShowStreets from "./components/ShowStreet";
import CreateStreets from "./components/CreateStreet";
import EditStreets from "./components/EditStreet";

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

// Expenses SPA
import ExpensesTable from './components/ShowExpense';
import CreateExpense from './components/CreateExpense';
import EditExpense from './components/EditExpense';

// Expense Categories SPA (Catalog Imports)
import ShowExpenseCategories from './components/ShowExpenseCategories';
import CreateExpenseCategory from './components/CreateExpenseCategory';
import EditExpenseCategory from './components/EditExpenseCategory';

// Reports SPA
import Reports from "./components/Reports";

// Components
//import NotificationBadgeUpdater from "./components/NotificationBadgeUpdater";
import ChatBadgeUpdater from "./components/ChatBadgeUpdater";

const App = () => {
    const rootEl = document.getElementById("react-container");
    const initialData = rootEl ? window.Laravel?.user : null;
    const [user, setUser] = useState(initialData); // State for authenticated user data

    // 🚨 Initialize the permission hook
    const { can } = usePermission(user);

    return (
        <>
            <ChatBadgeUpdater />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/home" replace />} />

                    {/* Main routes */}
                    
                    {/* 🛠️ HOME/STATS ROUTE: We move the authorization check inside Stats.jsx 
                       to avoid redirecting users without permission, per the new requirement. */}
                    <Route path="/home" element={<Stats user={user} />} />
                    <Route path="/profile" element={<Profile user={user} />} />

                    {/* CHAT ROUTE: Assuming chat is accessible to all authenticated users for now */}
                    <Route path="/chat" element={<ChatPage user={user} />} />

                    {/* --------------------------------------------------- */}
                    {/* 🛡️ RESIDENTS SPA routes */}
                    {/* --------------------------------------------------- */}
                    <Route
                        path="/residents"
                        element={
                            can('Ver-residentes') 
                                ? <ShowResidents user={user} />
                                : <Navigate to="/home" replace /> // Deny access to the module
                        }
                    />
                    <Route
                        path="/residents/create"
                        element={
                            can('Crear-residentes')
                                ? <CreateResidents />
                                : <Navigate to="/residents" replace />
                        }
                    />
                    <Route
                        path="/residents/edit/:id"
                        element={
                            can('Editar-residentes')
                                ? <EditResidents />
                                : <Navigate to="/residents" replace />
                        }
                    />

                    {/* Payment routes related to Residents/Addresses */}
                    {/* NOTE: These need specific permission checks, assumed based on 'Ver-pagos' or 'Crear-pagos' */}
                    <Route 
                        path="/residents/payments/history/:id" 
                        element={
                            can('Ver-pagos') 
                                ? <PaymentHistoryPage /> 
                                : <Navigate to="/home" replace />
                        }
                    />
                    <Route 
                        path="/addresses/payment/:id" 
                        element={
                            can('Crear-pagos') 
                                ? <CreatePayments /> 
                                : <Navigate to="/home" replace />
                        }
                    />
                    <Route 
                        path="/addresses/payments/history/:id" 
                        element={
                            can('Ver-pagos') 
                                ? <PaymentHistoryPage /> 
                                : <Navigate to="/home" replace />
                        }
                    />

                    {/* --------------------------------------------------- */}
                    {/* 🛡️ FEES SPA routes */}
                    {/* --------------------------------------------------- */}
                    <Route 
                        path="/fees" 
                        element={
                            can('Ver-cuotas') 
                                ? <ShowFees /> 
                                : <Navigate to="/home" replace />
                        }
                    />
                    <Route 
                        path="/fees/create" 
                        element={
                            can('Crear-cuotas') 
                                ? <CreateFees /> 
                                : <Navigate to="/fees" replace />
                        }
                    />
                    <Route 
                        path="/fees/edit/:id" 
                        element={
                            can('Editar-cuotas') 
                                ? <EditFees /> 
                                : <Navigate to="/fees" replace />
                        }
                    />

                    {/* --------------------------------------------------- */}
                    {/* 🛡️ ADDRESSES SPA routes (Predios/Catalog) */}
                    {/* --------------------------------------------------- */}
                    <Route 
                        path="/addresses" 
                        element={
                            can('Ver-predios') 
                                ? <ShowAddresses /> 
                                : <Navigate to="/home" replace />
                        }
                    />
                    <Route 
                        path="/addresses/create" 
                        element={
                            can('Crear-predios') 
                                ? <CreateAddresses /> 
                                : <Navigate to="/addresses" replace />
                        }
                    />
                    <Route 
                        path="/addresses/edit/:id" 
                        element={
                            can('Editar-predios') 
                                ? <EditAddresses /> 
                                : <Navigate to="/addresses" replace />
                        }
                    />

                    {/* --------------------------------------------------- */}
                    {/* 🛡️ STREETS SPA ROUTES (NEW CATALOG) */}
                    {/* --------------------------------------------------- */}
                    <Route 
                        path="/streets" 
                        element={
                            can('Ver-calles') 
                                ? <ShowStreets /> 
                                : <Navigate to="/home" replace />
                        }
                    />
                    <Route 
                        path="/streets/create" 
                        element={
                            can('Crear-calles') 
                                ? <CreateStreets /> 
                                : <Navigate to="/streets" replace />
                        }
                    />
                    <Route 
                        path="/streets/edit/:id" 
                        element={
                            can('Editar-calles') 
                                ? <EditStreets /> 
                                : <Navigate to="/streets" replace />
                        }
                    />

                    {/* --------------------------------------------------- */}
                    {/* 🛡️ PERMISSIONS SPA routes (Configuration) */}
                    {/* --------------------------------------------------- */}
                    <Route 
                        path="/permissions" 
                        element={
                            can('Ver-permisos') 
                                ? <ShowPermissions /> 
                                : <Navigate to="/home" replace />
                        }
                    />
                    <Route 
                        path="/permissions/create" 
                        element={
                            can('Crear-permisos') 
                                ? <CreatePermission /> 
                                : <Navigate to="/permissions" replace />
                        }
                    />
                    <Route 
                        path="/permissions/edit/:id" 
                        element={
                            can('Editar-permisos') 
                                ? <EditPermission /> 
                                : <Navigate to="/permissions" replace />
                        }
                    />

                    {/* --------------------------------------------------- */}
                    {/* 🛡️ ROLES SPA routes (Configuration) */}
                    {/* --------------------------------------------------- */}
                    <Route 
                        path="/roles" 
                        element={
                            can('Ver-roles') 
                                ? <ShowRoles /> 
                                : <Navigate to="/home" replace />
                        }
                    />
                    <Route 
                        path="/roles/create" 
                        element={
                            can('Crear-roles') 
                                ? <CreateRole /> 
                                : <Navigate to="/roles" replace />
                        }
                    />
                    <Route 
                        path="/roles/edit/:id" 
                        element={
                            can('Editar-roles') 
                                ? <EditRole /> 
                                : <Navigate to="/roles" replace />
                        }
                    />

                    {/* --------------------------------------------------- */}
                    {/* 🛡️ USERS SPA routes (CRUD Permissions) */}
                    {/* --------------------------------------------------- */}
                    <Route 
                        path="/users" 
                        element={
                            can('Ver-usuarios') 
                                ? <ShowUsers /> 
                                : <Navigate to="/home" replace />
                        }
                    />
                    <Route 
                        path="/users/create" 
                        element={
                            can('Crear-usuarios') 
                                ? <CreateUser /> 
                                : <Navigate to="/users" replace />
                        }
                    />
                    <Route 
                        path="/users/edit/:id" 
                        element={
                            can('Editar-usuarios') 
                                ? <EditUser /> 
                                : <Navigate to="/users" replace />
                        }
                    />

                    {/* --------------------------------------------------- */}
                    {/* 🛡️ EXPENSE CATEGORIES SPA ROUTES (CATALOG) */}
                    {/* --------------------------------------------------- */}
                    <Route 
                        path="/expense_categories" 
                        element={
                            can('Ver-catalogo-gastos') 
                                ? <ShowExpenseCategories /> 
                                : <Navigate to="/home" replace />
                        }
                    />
                    <Route 
                        path="/expense_categories/create" 
                        element={
                            can('Crear-catalogo-gastos') 
                                ? <CreateExpenseCategory /> 
                                : <Navigate to="/expense_categories" replace />
                        }
                    />
                    <Route 
                        path="/expense_categories/edit/:id" 
                        element={
                            can('Editar-catalogo-gastos') 
                                ? <EditExpenseCategory /> 
                                : <Navigate to="/expense_categories" replace />
                        }
                    />

                    {/* --------------------------------------------------- */}
                    {/* 🛡️ EXPENSES SPA routes (Individual Transactions) */}
                    {/* --------------------------------------------------- */}
                    <Route 
                        path="/expenses" 
                        element={
                            can('Ver-gastos') 
                                ? <ExpensesTable /> 
                                : <Navigate to="/home" replace />
                        }
                    />
                    <Route 
                        path="/expenses/create" 
                        element={
                            can('Crear-gastos') 
                                ? <CreateExpense /> 
                                : <Navigate to="/expenses" replace />
                        }
                    />
                    <Route 
                        path="/expenses/edit/:id" 
                        element={
                            can('Editar-gastos') 
                                ? <EditExpense /> 
                                : <Navigate to="/expenses" replace />
                        }
                    />

                    {/* --------------------------------------------------- */}
                    {/* 🛡️ REPORTS SPA routes */}
                    {/* --------------------------------------------------- */}
                    <Route 
                        path="/reports" 
                        element={
                            can('Reportes') 
                                ? <Reports /> 
                                : <Navigate to="/home" replace />
                        }
                    />

                    {/* Catch-all: Redirects any unknown route to the home page */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
            </BrowserRouter>
        </>
    );
};

export default App;