import "./App.css";
import { useEffect, useState } from "react";
import {
  useAuth,
  useLoginWithRedirect,
} from "@frontegg/react";

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import UserAuth from './components/UserAuth';
import EntitlementsInfo from './components/EntitlementsInfo';
import TenantHierarchySwitcher from './components/TenantHierarchySwitcher';
import TenantMetadata from './components/TenantMetadata';
import APIPlayground from './components/APIPlayground';
import AdminPortal from './components/AdminPortal';
import DocumentManager from './components/DocumentManager/DocumentManager';

function App() {
  const { isAuthenticated } = useAuth();
  const loginWithRedirect = useLoginWithRedirect();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect({});
    }
  }, [isAuthenticated, loginWithRedirect]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onSectionChange={setActiveSection} />;
      case 'user':
        return (
          <div className="section-container">
            <UserAuth />
          </div>
        );
      case 'tenants':
        return (
          <div className="section-container">
            <TenantHierarchySwitcher title="Tenant Hierarchy" />
            <TenantMetadata />
          </div>
        );
      case 'api':
        return <APIPlayground />;
      case 'admin':
        return <AdminPortal />;
      case 'documents':
        return <DocumentManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <div className="app-container">
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
            isMobileOpen={isMobileMenuOpen}
            onMobileClose={() => setIsMobileMenuOpen(false)}
          />
          
          <div className={`app-content ${isMobileMenuOpen ? 'menu-open' : ''}`}>
            <div className="mobile-header">
              <button 
                className="mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? '✕' : '☰'}
              </button>
              <h1 className="mobile-title">Frontegg Demo</h1>
            </div>
            
            <main id="main-content" className="main-content">
              {renderContent()}
            </main>
          </div>
        </div>
      ) : (
        <div className="login-section">
          <h1 onClick={() => loginWithRedirect()}>No Session, Redirecting.</h1>
        </div>
      )}
    </div>
  );
}

export default App;
