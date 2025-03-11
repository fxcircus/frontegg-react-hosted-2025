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
    <div className="navbar">
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
        <button className="action-button" onClick={showAdminPortal}>
          Admin Portal
        </button>
        <button className="action-button logout-button" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar; 