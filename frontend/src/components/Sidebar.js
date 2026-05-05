import React, { useState } from 'react';
import { AdminPortal, ContextHolder } from "@frontegg/react";
import TenantSelector from './TenantSelector';
import './Sidebar.css';

const Sidebar = ({ activeSection, onSectionChange, isMobileOpen, onMobileClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'user', label: 'User & Auth', icon: '👤' },
    { id: 'tenants', label: 'Tenants', icon: '🏢' },
    { id: 'documents', label: 'ReBAC (FGA)', icon: '📄' },
    { id: 'pokemon', label: 'Backend SDK', icon: '🔒' },
    { id: 'jwt-verifier', label: 'JWT Verifier', icon: '🔐' },
    // { id: 'admin', label: 'Embedded Components', icon: '⚙️' },
    { id: 'api', label: 'Frontegg APIs', icon: '🚀' },
  ];

  const showAdminPortal = () => {
    AdminPortal.showMultiApp();
  };

  const logout = () => {
    const baseUrl = ContextHolder.getContext().baseUrl;
    window.location.href = `${baseUrl}/oauth/logout?post_logout_redirect_uri=${window.location}`;
  };

  const handleSectionChange = (section) => {
    onSectionChange(section);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {isMobileOpen && <div className="mobile-overlay" onClick={onMobileClose} />}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <button 
        className="sidebar-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? '→' : '←'}
      </button>

      <div className="sidebar-content">
        <TenantSelector isCollapsed={isCollapsed} />

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => handleSectionChange(item.id)}
              title={isCollapsed ? item.label : ''}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="sidebar-actions">
          <button 
            className="sidebar-action-btn admin-portal"
            onClick={showAdminPortal}
            title={isCollapsed ? 'Self Service Portal' : ''}
          >
            <span className="sidebar-action-icon">🔧</span>
            {!isCollapsed && <span>Self Service Portal</span>}
          </button>
          <button 
            className="sidebar-action-btn logout"
            onClick={logout}
            title={isCollapsed ? 'Logout' : ''}
          >
            <span className="sidebar-action-icon">🚪</span>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;