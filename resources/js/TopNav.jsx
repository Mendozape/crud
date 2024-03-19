import React from 'react';
import { createRoot } from 'react-dom/client'
export default function TopNav() {
    return (
        <>
            <li className="nav-item dropdown">
                <a className="nav-link" data-toggle="dropdown" href="#" aria-expanded="false">
                    <i className="far fa-comments" />
                    <span className="badge badge-warning navbar-badge" id="NumNoti">6</span>
                </a>
                <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right" style={{ left: 'inherit', right: 0 }}>
                    <span className="dropdown-item dropdown-header">15 Notifications</span>
                    <div className="dropdown-divider" />
                    <a href="#" className="dropdown-item">
                        <i className="fas fa-envelope mr-2" /> 4 new messages
                        <span className="float-right text-muted text-sm">3 mins</span>
                    </a>
                    <div className="dropdown-divider" />
                    <a href="#" className="dropdown-item">
                        <i className="fas fa-users mr-2" /> 8 friend requests
                        <span className="float-right text-muted text-sm">12 hours</span>
                    </a>
                    <div className="dropdown-divider" />
                    <a href="#" className="dropdown-item">
                        <i className="fas fa-file mr-2" /> 3 new reports
                        <span className="float-right text-muted text-sm">2 days</span>
                    </a>
                    <div className="dropdown-divider" />
                    <a href="#" className="dropdown-item dropdown-footer">See All Notifications</a>
                </div>
            </li>

        </>
    );
}
if (document.getElementById('TopNavDiv')) {
    createRoot(document.getElementById('TopNavDiv')).render(<TopNav />)
}