import React from 'react';
import { useAuth, AdminPortal, useStepUp, useIsSteppedUp, ContextHolder } from "@frontegg/react";
import AccountSwitcher from './AccountSwitcher';

const Navbar = () => {
  const { user } = useAuth();
  const stepUp = useStepUp();
  const MAX_AGE = 60;
  const isSteppedUp = useIsSteppedUp({ maxAge: MAX_AGE });

  const showAdminPortal = () => {
    AdminPortal.show();
  };

  const logout = () => {
    const baseUrl = ContextHolder.getContext().baseUrl;
    window.location.href = `${baseUrl}/oauth/logout?post_logout_redirect_uri=${window.location}`;
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-section">
        <img
          src={user?.profilePictureUrl}
          alt={user?.name}
          referrerPolicy="no-referrer"
          className="profile-pic"
        />
        {/* <span className="user-name">{user?.name}</span> */}
        <span className="user-name">{user?.email}</span>
      </div>
      <AccountSwitcher />
      <div className="navbar-section">
        <button 
          className="action-button" 
          onClick={showAdminPortal}
          aria-label="Open self service portal for user management"
        >
          Self Service Portal
        </button>
        <button 
          className="action-button logout-button" 
          onClick={logout}
          aria-label="Log out of your account"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 