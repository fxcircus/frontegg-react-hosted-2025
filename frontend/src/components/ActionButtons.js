import React from 'react';
import { AdminPortal, useStepUp, useIsSteppedUp, ContextHolder } from "@frontegg/react";

const ActionButtons = () => {
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
    <div className="button-row">
      <div className="button-container">
        {isSteppedUp ? (
          <div className="stepped-up-message">You are STEPPED UP!</div>
        ) : (
          <button
            className="action-button step-up-mfa"
            onClick={() => stepUp({ maxAge: MAX_AGE })}
          >
            Step up MFA
          </button>
        )}
        <p className="button-description">
          Additional verification step before granting access to
          restricted app areas.
        </p>
      </div>
      <div className="button-container">
        <button className="action-button" onClick={showAdminPortal}>
          Admin Portal
        </button>
        <p className="button-description">
          Fully self-served, comprehensive set of tools for
          user-management, authentication, security, and more for your
          end-users.
        </p>
      </div>
      <div className="button-container">
        <button className="action-button logout-button" onClick={logout}>
          Logout
        </button>
        <p className="button-description">End user session.</p>
      </div>
    </div>
  );
};

export default ActionButtons; 